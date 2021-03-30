const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const Api = require('./api');

class MailSaver {
  constructor() {
    this.members = {};
    this.api = new Api({});
  }

  saveMail(mail, directory) {
    const member = this.members[mail.memberId];
    const headerHTML = this.headerHTML({
      date: mail.receivedDateTime,
      subject: mail.subject,
      memberName: member.name,
      imageUrl: member.imageUrl,
      receiverName: this.user.nickname,
    });

    const dom = new JSDOM(mail.mailDetailsHTML);
    const { document } = dom.window;

    const memberDir = path.join(directory, member.name);

    if (!fs.existsSync(memberDir)) {
      fs.mkdirSync(memberDir);
    }

    const file = path.join(memberDir, `${mail.mailId}.html`);

    fs.writeFile(
      file,
      headerHTML + document.documentElement.outerHTML,
      'utf8',
      function (error) {
        return error ? error : true;
      }
    );
  }

  async imageToBase64(url) {
    const base64 = await this.api.get(url, {
      responseType: 'arraybuffer',
    });
    return base64.error ? null : Buffer.from(base64.data).toString('base64');
  }

  headerHTML(data) {
    return `<div id="mail-header">
      <div
        style="display:flex; justify-content: space-between; padding: 20px 15px; border-bottom: 1px solid Gainsboro;">
        <div style="display:flex;">
          <img
            data-id="member-image"
            src=${data.imageUrl}
            style="width: 3rem; margin-right: 10px; border-radius: 50%;" 
          />
          <div>
            <h4 style="margin:0;">${data.memberName}</h4>
            <h5 style="font-weight: lighter;  margin:0;">To: <span style="color:gray;">${data.receiverName}</span>
            </h5>
          </div>
        </div>
        <h4 style="color:silver; font-weight: lighter; margin:0;">${data.date}</h4>
      </div>
      <div style="padding: 20px 15px; border-bottom: 1px solid Gainsboro;">
        <h3 style="margin:0;">${data.subject}</h3>
      </div>
    </div>`;
  }

  setUser(user) {
    this.user = user;
  }

  addMember(member) {
    this.members[member.id] = member;
  }

  getMember(memberId) {
    return this.members[memberId];
  }
}

module.exports = MailSaver;
