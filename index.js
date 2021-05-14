const path = require('path');
const Context = require('./server/context');
const Inbox = require('./server/models/inbox');
const Mail = require('./server/models/mail');
const Member = require('./server/models/member');
const MailBuilder = require('./server/views/mailBuilder');
const MailViewBuilder = require('./server/views/mailViewBuilder');
const User = require('./server/models/user');
const { encodeFullFilePath } = require('./utils');
class App extends Context {
  constructor() {
    super();
    this.inbox = new Inbox();
  }

  async getUser() {
    const { error, data } = await this.pmController.getProfile();
    if (error || !data.user) {
      console.error('❗️ Your account was not found, cannot fetch mail.');
      return;
    }
    return new User(data.user);
  }

  async getSubscribedMembers() {
    const { error, data } = await this.pmController.getMenu();
    if (error || !data.receiving_members) {
      console.error('❗️ Could not get your subscribed members.');
      return;
    }
    return data.receiving_members[0].team_members[0].members;
  }

  async processRawMember(member) {
    const memberObj = new Member(member);
    const { base64String } = await this.pmController.downloadImage(
      memberObj.imageUrl
    );
    memberObj.setImageUrl = base64String || '';
    return memberObj;
  }

  async processRawMail(mail) {
    const mailObj = new Mail(mail);
    const { data } = await this.pmController.getMailDetail(mailObj.id);
    mailObj.mailDetailHTML = data;
    return mailObj;
  }

  async getPaginatedMails() {
    let done = false;
    let page = 1;
    let rawMails = [];

    while (!done) {
      const { error, data } = await this.pmController.getInbox(page);

      if (error || !data.mails) {
        console.error('❗️ There was an error getting your inbox: ', error);
        done = true;
        break;
      }

      rawMails = [...rawMails, ...data.mails];

      if (!data.has_next_page) {
        done = true;
        break;
      }
      page++;
    }

    return rawMails;
  }

  preChecks() {
    if (this.isServiceTerminated) {
      console.log(
        '❗️  Private Mail has termininated their service.\nThis script will no longer be able to fetch new mails.'
      );
      return;
    }
    if (!this.checkConfig) {
      console.log(
        '❗️ Your settings are incomplete. Fill in your info in userSettings.js.'
      );
      return;
    }
  }

  get isServiceTerminated() {
    const today = new Date();
    const lastDay = new Date('2021-05-31');
    const sameMonth = today.getUTCMonth() === lastDay.getUTCMonth();
    const sameDay = today.getUTCDate() === lastDay.getUTCDate();
    const sameYear = today.getUTCFullYear() === lastDay.getUTCFullYear();
    return sameMonth && sameDay && sameYear;
  }

  get checkConfig() {
    return (
      this.settings.pm['user-id'] &&
      this.settings.pm['access-token'] &&
      this.settings.app.mailFolder
    );
  }

  async init() {
    this.preChecks();

    // Get current user's profile
    const currentUser = await this.getUser();
    if (!currentUser) return;
    this.inbox.userProfile = currentUser;

    console.log(`💌 Welcome ${this.inbox.user.name}!`);
    console.log(`➡️  Output folder: ${this.database.mailsDirectory}`);

    const BuildIndexView = new MailViewBuilder();

    // Setup output directory
    console.log('➡️  Setting up output folders and files...');
    await this.database.setupOutputDirectory();
    await BuildIndexView.buildIndexPage();
    await BuildIndexView.createMemberLink(
      'Home',
      this.database.indexFilePath,
      this.database.indexFilePath
    );

    // Fetch subscribed members
    const subscribedMembers = await this.getSubscribedMembers();
    if (!subscribedMembers) return;

    // Process raw members and setup each member's directory
    await Promise.all(
      subscribedMembers.map(async (member) => {
        const memberObj = await this.processRawMember(member.member);
        this.inbox.addMember(memberObj);

        // Setup member's directory
        memberObj.localDirectoryPath = await this.database.setupMemberDirectory(
          memberObj.name
        );

        const memberIndexPath = path.join(
          memberObj.localPath,
          this.database.defaultIndexFileName
        );

        await BuildIndexView.createMemberLink(
          memberObj.name,
          memberIndexPath,
          this.database.indexFilePath
        );

        await BuildIndexView.buildIndexPage(memberIndexPath);
        await BuildIndexView.createMemberLink(
          'Home',
          this.database.indexFilePath,
          memberIndexPath
        );
      })
    );

    // Add nav links to index pages
    const members = Object.values(this.inbox.members);
    for (const memberObj of members) {
      const memberIndexPath = path.join(
        memberObj.localPath,
        this.database.defaultIndexFileName
      );

      // Add other member's links
      for (const memberObj2 of members) {
        const memberIndexPath2 = path.join(
          memberObj2.localPath,
          this.database.defaultIndexFileName
        );

        await BuildIndexView.createMemberLink(
          memberObj.name,
          memberIndexPath,
          memberIndexPath2
        );
      }
    }

    // Fetch, process, and build mail static files
    console.log('➡️  Fetching mails from server...');
    const localMailIds = await this.database.localMails();
    const rawMails = await this.getPaginatedMails();
    const mails = rawMails
      .filter((mail) => !localMailIds.includes(mail.id) && mail.member.id !== 0)
      .reverse();

    console.log(`➡️  Saving ${mails.length} new mails...\n`);

    let totalMails = 0;
    let failedMails = 0;

    this.inbox.mails = await Promise.all(
      mails.map(async (mail) => this.processRawMail(mail))
    );

    await Promise.all(
      this.inbox.mails.map(async (mailObj) => {
        const memberObj = this.inbox.members[mailObj.memberId];
        const BuildMail = new MailBuilder(mailObj, memberObj, this.inbox.user);
        const log = `${memberObj.name} - ${mailObj.fileName}`;

        return BuildMail.saveMail()
          .then(async () => {
            totalMails++;
            console.log(`✅  Saved ${log}\n`);
          })
          .catch((error) => {
            failedMails++;
            console.log(`❌  Failed to save: ${log}\n${error}\n`);
          });
      })
    );

    // Build index views - non-parallel
    console.log('➡️  Building mail viewers...\n');
    for (const mailObj of this.inbox.mails) {
      console.log(`➡️  Add ${mailObj.id} to mail viewers`);
      const memberObj = this.inbox.members[mailObj.memberId];
      const mailPath = path.join(memberObj.localPath, mailObj.fileName);
      const memberIndexPath = path.join(
        memberObj.localPath,
        this.database.defaultIndexFileName
      );
      // Build index pages
      await BuildIndexView.createMailView(
        mailPath,
        mailObj,
        memberObj,
        this.database.indexFilePath
      )
        .then(() => {
          console.log('✅  Home mail view');
        })
        .catch(() => {
          console.log('❌  Home mail view');
        });

      await BuildIndexView.createMailView(
        mailPath,
        mailObj,
        memberObj,
        memberIndexPath
      )
        .then(() => {
          console.log(`✅  ${memberObj.name} mail view\n`);
        })
        .catch(() => {
          console.log(`❌  ${memberObj.name} mail view\n`);
        });
    }

    console.log(
      `🎉  Finished saving ${totalMails} new ${
        totalMails > 1 ? 'mails' : 'mail'
      }!`
    );
    if (failedMails) {
      console.log(
        `❌  Failed to save ${failedMails} new ${
          failedMails > 1 ? 'mails' : 'mail'
        }.`
      );
    }

    console.log(
      `\nView all mails in the browser:\n${this.database.indexFilePath}\n`
    );
  }
}

const app = new App();
app.init();
