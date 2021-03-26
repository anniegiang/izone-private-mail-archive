const PMApi = require("./pmApi");
const { Mail, Member, Inbox } = require("./helpers");

class App {
  constructor(settings) {
    this.PMApi = new PMApi(settings);
  }

  async init() {
    console.log("Fetching mails...");

    const { data: inboxData } = await this.PMApi.getInbox();

    const inbox = new Inbox();
    const memberCache = {};

    await Promise.all(
      inboxData.mails.map(async (mail) => {
        const { data: details } = await this.PMApi.getMailDetail(mail.id);
        mail.detail = details;

        const memberId = mail.member.id;
        if (memberCache[memberId] === undefined) {
          memberCache[memberId] = new Member(mail.member);
        }
        inbox.add(new Mail(mail), memberCache[memberId]);
      })
    );

    console.log("Finished getting mails!");
    console.log(inbox.list());
  }
}

module.exports = App;
