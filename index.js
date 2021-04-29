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

  async test() {}

  async getUser() {
    const { error, data } = await this.pmController.getProfile();
    if (error || !data.user) {
      console.error('❗️ Your account was not found, cannot fetch mail.');
      return;
    }
    return data.user;
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
    memberObj.setImageUrl = base64String;
    this.inbox.addMember(memberObj);
    return Promise.resolve(memberObj);
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
    let mails = [];

    while (!done) {
      const { error, data } = await this.pmController.getInbox(page);

      if (error || !data.mails) {
        console.error('❗️ There was an error getting your inbox: ', error);
        done = true;
        break;
      }

      mails = [...mails, ...data.mails];

      // if (!data.has_next_page) {
      //   console.log('HI');
      done = true;
      break;
      // }
      // page++;
    }

    return { rawMails: mails };
  }

  async init() {
    this.preChecks();

    // try {
    const user = await this.getUser();
    if (!user) return;

    this.inbox.userProfile = new User(user);

    console.log(`Welcome ${this.inbox.user.name}!`);

    const subscribedMembers = await this.getSubscribedMembers();
    if (!subscribedMembers) return;

    await Promise.all(
      subscribedMembers.map(async (data) => this.processRawMember(data.member))
    );

    const mailView = new MailViewBuilder();

    console.log(`Output directory: ${this.database.mailsDirectory}`);

    await this.database.setupOutputDirectory();
    await mailView.buildIndexPage(this.database.indexFilePath);

    await Promise.all(
      Object.values(this.inbox.members).map(async (member) => {
        const memberPath = await this.database.setupMemberDirectory(
          member.name
        );

        member.localDirectoryPath = memberPath;
        const memberIndexPath = path.join(
          memberPath,
          this.database.defaultIndexFileName
        );

        await mailView.buildIndexPage(memberIndexPath);
      })
    );

    this.localMails = await this.database.localMails();

    console.log('💌 Fetching your mails...\n');
    const { rawMails } = await this.getPaginatedMails();

    const newMails = rawMails.filter(
      (mail) => !this.localMails.includes(mail.id)
    );

    await Promise.all(
      newMails.reverse().map(async (mail) => this.processRawMail(mail))
    ).then((mailObjs) => {
      mailObjs.forEach((mailObj) => {
        const member = this.inbox.members[mailObj.memberId];
        member.addMail(mailObj);
        this.inbox.addMail(mailObj);
      });
    });

    let totalMails = 0;
    let failedMails = 0;

    await Promise.all(
      this.inbox.mails.map(async (mail) => {
        const member = this.inbox.members[mail.memberId];
        const mailBuilder = new MailBuilder(mail, member, this.inbox.user);
        const log = `${member.name} - ${mail.fileName}`;

        return mailBuilder
          .saveMail()
          .then(async () => {
            totalMails++;
            console.log(`✅ Saved! ${log}\n`);
            const mailPath = mailBuilder.mailPath;

            await mailView.createMailView(
              mailPath,
              mail,
              member,
              this.database.indexFilePath
            );

            await mailView.createMailView(
              mailPath,
              mail,
              member,
              path.join(member.localPath, this.database.defaultIndexFileName)
            );

            return Promise.resolve(log);
          })
          .catch((error) => {
            failedMails++;
            console.log(`❌ Fail! ${log}\n`, error);
            return Promise.resolve(error);
          });
      })
    );

    // async (error, encoded) => {
    //       if (!error || encoded) {
    //         console.log('✅ Saved!\n');
    //         const mailPath = !encoded
    //           ? mailBuilder.mailPath
    //           : encodeFullFilePath(mailBuilder.mailPath);

    //         await mailView.createMailView(
    //           mailPath,
    //           mail,
    //           member,
    //           this.database.indexFilePath
    //         );

    //         await mailView.createMailView(
    //           mailPath,
    //           mail,
    //           member,
    //           path.join(member.localPath, this.database.defaultIndexFileName)
    //         );

    //         totalMails++;
    //       } else {
    //         console.log('❌ Fail!\n');
    //         failedMails++;
    //       }
    //     });

    //   for (const mail of reversedMails) {
    //     console.log(`📩 Saving ${member.name} - ${mailObj.fileName}`);

    //     // add Home and current member to main viewer
    //     await mailView.createMemberLink(
    //       'All',
    //       this.database.indexFilePath,
    //       this.database.indexFilePath
    //     );

    //     await mailView.createMemberLink(
    //       member.name,
    //       memberIndexPath,
    //       this.database.indexFilePath
    //     );

    //     const memberDirs = await this.database.memberDirectoryPaths();

    //     // add Home to all member's views
    //     await Promise.all(
    //       memberDirs.map(async (dir) => {
    //         const dirPath = path.join(
    //           this.database.mailsDirectory,
    //           dir,
    //           this.database.defaultIndexFileName
    //         );

    //         await mailView.createMemberLink(
    //           'All',
    //           this.database.indexFilePath,
    //           dirPath
    //         );
    //       })
    //     );

    //     // add member links to each member view
    //     await Promise.all(
    //       memberDirs.map(async (dir) => {
    //         for (let dir2 of memberDirs) {
    //           const dirPath = path.join(
    //             this.database.mailsDirectory,
    //             dir,
    //             this.database.defaultIndexFileName
    //           );

    //           const dirPath2 = path.join(
    //             this.database.mailsDirectory,
    //             dir2,
    //             this.database.defaultIndexFileName
    //           );

    //           await mailView.createMemberLink(dir2, dirPath2, dirPath);
    //         }
    //       })
    //     );

    //     await newMail.saveMail(async (error, encoded) => {
    //       if (!error || encoded) {
    //         console.log('✅ Saved!\n');
    //         const mailPath = !encoded
    //           ? newMail.mailPath
    //           : encodeFullFilePath(newMail.mailPath);

    //         await mailView.createMailView(
    //           mailPath,
    //           mailObj,
    //           member,
    //           this.database.indexFilePath
    //         );

    //         await mailView.createMailView(
    //           mailPath,
    //           mailObj,
    //           member,
    //           memberIndexPath
    //         );

    //         totalMails++;
    //       } else {
    //         console.log('❌ Fail!\n');
    //         failedMails++;
    //       }
    //     });
    //   }

    if (totalMails) {
      console.log(
        `🎉 Finished saving ${totalMails} new ${
          totalMails > 2 ? 'mails' : 'mail'
        }!`
      );
    }

    if (failedMails) {
      console.log(
        `❗️ Failed to save ${failedMails} ${
          failedMails > 2 ? 'mails' : 'mail'
        }!`
      );
    }
    // } catch (error) {
    //   console.error('❗️ ', error);
    // }
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
}

const app = new App();
app.init();
