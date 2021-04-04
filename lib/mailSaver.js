const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const Api = require('./api');

class MailSaver {
  constructor() {
    this.members = {};
    this.api = new Api({});
  }

  async imageUrlToBase64(imageUrl) {
    const response = await this.api.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    if (!response.error) {
      const base64String = Buffer.from(response.data).toString('base64');
      return `data:'${response.headers['content-type']}';base64,${base64String}`;
    }
    return response;
  }

  async saveMail(mail, mailPath) {
    const member = this.members[mail.memberId];
    const headerHTMLString = `<div id="mail-header"><div style="display:flex; justify-content: space-between; padding: 20px 15px; border-bottom: 1px solid Gainsboro;"><div style="display:flex;"><img data-id="member-image"src=${member.imageUrl}    style="width: 3rem; margin-right: 10px; border-radius: 50%;" /><div><h4 style="margin: 0;">${member.name}</h4><h5  style="font-weight: lighter;  margin: 0;">To: <span style="color:gray;">${this.user.nickname}</span></h5></div></div><h4 style="color: silver; font-weight: lighter; margin:0;">${mail.receivedDateTime}</h4></div><div style="padding: 20px 15px; border-bottom: 1px solid Gainsboro;"><h3 style="margin: 0;">${mail.subject}</h3></div></div>`;

    const mailDetailsDOM = new JSDOM(mail.mailDetailsHTMLString);
    const allImgs = mailDetailsDOM.window.document.querySelectorAll('img');

    for (const img of allImgs) {
      const response = await this.imageUrlToBase64(img.src);
      if (!response) {
        console.log(response);
        return response;
      }
      img.src = response;
    }

    const headInnerHTML = mailDetailsDOM.window.document.querySelector('head')
      .innerHTML;

    const mailDetailsOuterHTML = mailDetailsDOM.window.document.querySelector(
      '#mail-detail'
    ).outerHTML;

    const htmlEl = mailDetailsDOM.window.document.createElement('html');
    htmlEl.lang = 'ko';
    htmlEl.innerHTML = headerHTMLString + mailDetailsOuterHTML;

    const htmlHeadEl = htmlEl.querySelector('head');
    htmlHeadEl.innerHTML = headInnerHTML;

    return fs.writeFile(
      mailPath,
      `<!DOCTYPE html>${htmlEl.outerHTML}`,
      'utf8',
      function (error) {
        return error;
      }
    );
  }

  directoryExists(directory) {
    return fs.existsSync(directory);
  }

  makeDirectory(directory) {
    if (!this.directoryExists(directory)) {
      fs.mkdirSync(directory);
    }
  }

  setUser(user) {
    this.user = user;
  }

  async addMember(member) {
    this.members[member.id] = member;
    this.members[member.id].imageUrl = await this.imageUrlToBase64(
      this.members[member.id].imageUrl
    );
  }

  getMember(memberId) {
    return this.members[memberId];
  }
}

module.exports = MailSaver;
