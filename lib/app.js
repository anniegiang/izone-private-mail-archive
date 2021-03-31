const PMApi = require('./pmApi');
const MailSaver = require('./mailSaver');
const fs = require('fs');
const path = require('path');
class App {
  constructor(settings) {
    this.settings = settings;
    this.PMApi = new PMApi(settings);
    this.MailSaver = new MailSaver();
  }

  async init() {
    if (!this.checkConfig) {
      console.log('Your settings are incomplete.');
      return;
    }

    const inboxResponse = await this.PMApi.getInbox();

    if (inboxResponse.error || !inboxResponse.data.mails) {
      console.error('There was an error getting your inbox: ', inboxResponse);
      return;
    }

    const directory = path.join(__dirname, `../out`);
    const { mails } = inboxResponse.data;

    const latestMail = mails[mails.length - 1];
    const latestMailPath = path.join(
      directory,
      `${latestMail.member.realname_ko}`,
      `${latestMail.id}.html`
    );

    if (fs.existsSync(latestMailPath)) {
      console.log(
        `No new mail, lastest mail is ${latestMail.id}.`
      );
      return;
    }

    const userProfileResponse = await this.PMApi.getProfile();

    if (userProfileResponse.error || !userProfileResponse.data.user) {
      console.error('Your account was not found, cannot fetch mail.');
      return;
    }

    const { user } = userProfileResponse.data;
    this.MailSaver.setUser(user);

    console.log(`Fetching mails for ${user.nickname}...`);
    const failedMailDetails = {};

    const newMails = await Promise.all(
      mails.map(async (mail) => {
        const mailDetails = await this.PMApi.getMailDetail(mail.id);

        if (mailDetails.error) {
          failedMailDetails[mail.id] = mailDetails;
          return;
        }

        const { member } = mail;
        const memberId = member.id;

        if (!this.MailSaver.getMember(memberId)) {
          await this.MailSaver.addMember({
            id: memberId,
            name: member.realname_ko,
            imageUrl: member.image_url,
          });
        }

        const newMail = {
          memberId,
          mailId: mail.id,
          subject: mail.subject_ko,
          content: mail.content_ko,
          receivedDateTime: mail.receive_datetime,
          mailDetailsHTML: mailDetails.data,
        };

        return newMail;
      })
    );

    newMails.forEach((mail) => {
      console.log(`Saving mail: ${mail.mailId}...`);
      this.MailSaver.saveMail(mail, directory);
    });

    if (Object.keys(failedMailDetails).length) {
      console.error('Failed to create mails for: ', failedMailDetails);
    }
  }

  get checkConfig() {
    return this.settings.app || this.settings.endpoints || this.settings.pm;
  }
}

module.exports = App;
