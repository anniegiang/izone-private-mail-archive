const path = require('path');
const settings = require('./settings');
const PMApi = require('./lib/pmApi');
const MailSaver = require('./lib/mailSaver');

class App {
  constructor(settings) {
    this.settings = settings;
    this.PMApi = new PMApi(settings);
    this.MailSaver = new MailSaver();
  }

  async init() {
    const today = new Date();
    const lastDay = new Date('2021-05-31');
    const sameMonth = today.getUTCMonth() === lastDay.getUTCMonth();
    const sameDay = today.getUTCDate() === lastDay.getUTCDate();
    const sameYear = today.getUTCFullYear() === lastDay.getUTCFullYear();

    if (sameMonth && sameDay && sameYear) {
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

    const directory = path.join(__dirname, this.settings.app.mailFolder);
    await this.MailSaver.makeDirectory(directory);

    const userProfileResponse = await this.PMApi.getProfile();

    if (userProfileResponse.error || !userProfileResponse.data.user) {
      console.error('❗️ Your account was not found, cannot fetch mail.');
      return;
    }

    const { user } = userProfileResponse.data;
    this.MailSaver.setUser(user);

    console.log(`💌 Fetching mails for ${user.nickname}...\n`);

    const localMails = await this.MailSaver.localMails(directory);

    let done = false;
    let page = 1;
    let allMails = [];
    let latestMail;

    while (!done) {
      const inbox = await this.PMApi.getInbox(page);

      if (inbox.error || !inbox.data.mails) {
        console.error('❗️ There was an error getting your inbox: ', inbox);
        done = true;
        break;
      }

      if (page === 1) {
        const newestMail = inbox.data.mails[0];

        if (localMails.includes(newestMail.id)) {
          latestMail = newestMail;
        }
      }

      allMails.push(...inbox.data.mails);

      if (!inbox.data.has_next_page) {
        done = true;
        break;
      }

      page++;
    }

    let totalMails = 0;
    let failedMails = 0;
    const reversedMails = allMails.reverse(); //oldest to newest
    const indexPath = path.join(__dirname, this.settings.app.mailViewerFile);

    await this.MailSaver.buildIndexPage(indexPath);

    for (const mail of reversedMails) {
      const htmlFileName = this.MailSaver.fileName(mail);
      const memberDir = path.join(directory, mail.member.realname_ko);
      const mailPath = path.join(memberDir, htmlFileName);

      if (localMails.includes(mail.id)) {
        continue;
      }

      const imagesPath = path.join(memberDir, this.settings.app.imagesFolder);
      await this.MailSaver.makeDirectory(memberDir);
      await this.MailSaver.makeDirectory(imagesPath);

      const { member } = mail;
      await this.MailSaver.addMember(member);

      const mailDetails = await this.PMApi.getMailDetail(mail.id);
      mail.mailDetailsHTMLString = mailDetails.data;

      console.log(`📩 Saving ${member.realname_ko} - ${htmlFileName}`);

      await this.MailSaver.saveMail(
        mail,
        mailPath,
        imagesPath,
        async (error) => {
          if (error) {
            console.log('❌ Fail!\n', error);
            failedMails++;
          } else {
            console.log('✅ Saved!\n');
            totalMails++;
            await this.MailSaver.createMailView(mail, mailPath, indexPath);
          }
        }
      );
    }

    if (latestMail) {
      console.log(
        `✅  No new mail, lastest mail is from ${latestMail.member.realname_ko} (${latestMail.id}).`
      );
    }

    console.log(
      `🎉 Finished saving ${totalMails} new ${
        totalMails > 2 ? 'mails' : 'mail'
      }!`
    );

    if (failedMails) {
      console.log(
        `❗️ Failed to save ${failedMails} ${
          failedMails > 2 ? 'mails' : 'mail'
        }!`
      );
    }
  }

  get checkConfig() {
    return (
      this.settings.pm['user-id'] &&
      this.settings.pm['access-token'] &&
      this.settings.app.mailFolder
    );
  }
}

const app = new App(settings);
app.init();
