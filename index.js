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

  htmlFileName(mail) {
    const mailDate = new Date(mail.receive_datetime);
    const formattedDate = `${mailDate.getFullYear()}-${
      mailDate.getMonth() + 1
    }-${mailDate.getDate()}`;
    return `${mail.id}__${mail.subject_ko}__${formattedDate}__.html`;
  }

  async init() {
    if (!this.checkConfig) {
      console.log('❗️ Your settings are incomplete.');
      return;
    }

    const initialInbox = await this.PMApi.getInbox();

    if (initialInbox.error || !initialInbox.data.mails) {
      console.error(
        '❗️ There was an error getting your inbox: ',
        initialInbox
      );
      return;
    }

    const directory = path.join(__dirname, this.settings.app.destinationFolder);

    const { mails } = initialInbox.data;
    const latestMail = mails[0];
    const latestMailPath = path.join(
      directory,
      `${latestMail.member.realname_ko}`,
      this.htmlFileName(latestMail)
    );

    this.MailSaver.makeDirectory(directory);

    if (this.MailSaver.directoryExists(latestMailPath)) {
      console.log(`✅  No new mail, lastest mail is ${latestMail.id}.`);
      return;
    }

    const userProfileResponse = await this.PMApi.getProfile();

    if (userProfileResponse.error || !userProfileResponse.data.user) {
      console.error('❗️ Your account was not found, cannot fetch mail.');
      return;
    }

    const { user } = userProfileResponse.data;
    this.MailSaver.setUser(user);

    console.log(`💌 Fetching mails for ${user.nickname}...\n`);

    let done = false;
    let page = 1;
    let totalMails = 0;
    let failedMails = 0;

    while (!done) {
      const inbox = await this.PMApi.getInbox(page);

      if (inbox.error || !inbox.data.mails) {
        console.error('❗️ There was an error getting your inbox: ', inbox);
        done = true;
        break;
      }

      for (const mail of inbox.data.mails) {
        const htmlFileName = this.htmlFileName(mail);
        const memberDir = path.join(directory, mail.member.realname_ko);
        const mailPath = path.join(memberDir, htmlFileName);

        if (this.MailSaver.directoryExists(mailPath)) {
          continue;
        }

        this.MailSaver.makeDirectory(memberDir);

        const { member } = mail;
        const memberId = member.id;

        if (!this.MailSaver.getMember(memberId)) {
          await this.MailSaver.addMember({
            id: memberId,
            name: member.realname_ko,
            imageUrl: member.image_url,
          });
        }

        const mailDetails = await this.PMApi.getMailDetail(mail.id);

        const newMail = {
          memberId,
          mailId: mail.id,
          subject: mail.subject_ko,
          content: mail.content_ko,
          receivedDateTime: mail.receive_datetime,
          mailDetailsHTMLString: mailDetails.data,
        };

        console.log(`📩 Saving ${member.realname_ko} - ${htmlFileName}`);
        const savedStatus = await this.MailSaver.saveMail(newMail, mailPath);

        if (savedStatus === undefined) {
          console.log('✅ Saved!\n');
          totalMails++;
        } else {
          console.log('❌ Fail!\n');
          failedMails++;
        }
      }

      if (!inbox.data.has_next_page) {
        done = true;
        break;
      }

      page++;
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
    return this.settings.app || this.settings.endpoints || this.settings.pm;
  }
}

const app = new App(settings);
app.init();
