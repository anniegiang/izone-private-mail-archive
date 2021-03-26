const PMApi = require("./pmApi");
const { Mail, Member, Inbox } = require("./helpers");

class App {
  constructor(settings) {
    this.settings = settings;
    this.PMApi = new PMApi(this.settings);
  }

  async init() {
    if (!this.checkConfig) {
      console.log("Your settings are incomplete.");
      return;
    }

    console.log("Fetching mails...");

    const inboxResponse = await this.PMApi.getInbox();

    if (
      inboxResponse.error === true ||
      inboxResponse.data.mails === undefined
    ) {
      console.error("There was an error getting your inbox: ", inboxResponse);
      return;
    }

    const inbox = new Inbox();
    const failedMailDetails = {};
    const memberCache = {};

    await Promise.all(
      inboxResponse.data.mails.map(async (mail) => {
        console.log(`Getting mail details for mail: ${mail.id}...`);
        const mailDetails = await this.PMApi.getMailDetail(mail.id);

        if (mailDetails.error) {
          failedMailDetails[mail.id] = mailDetails;
          return;
        }

        mail.details = mailDetails;

        const memberId = mail.member.id;
        if (memberCache[memberId] === undefined) {
          memberCache[memberId] = new Member(mail.member);
        }

        inbox.add(new Mail(mail), memberCache[memberId]);
      })
    );

    if (Object.keys(failedMailDetails).length) {
      console.error("Failed to create mails for: ", failedMailDetails);
    }

    console.log("Finished getting mails!");
    console.log("Inbox total: ", inbox.total);
  }

  get checkConfig() {
    return this.settings.app || this.settings.endpoints || this.settings.pm;
  }
}

module.exports = App;
