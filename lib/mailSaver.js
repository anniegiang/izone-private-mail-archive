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

  async imageUrlToBase64(imageUrl) {
    const response = await this.api.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const result = { contentType: response.headers['content-type'] };

    if (!response.error) {
      const base64String = Buffer.from(response.data).toString('base64');
      result.rawBase64String = base64String;
      result.base64String = `data:'${response.headers['content-type']}';base64,${base64String}`;
    } else {
      result.base64String = '';
    }

    return result;
  }

  async saveMail(mail, mailPath, imagesPath, cb) {
    const member = this.members[mail.member.id];
    const headerHTMLString = `<div id="mail-header"><div style="display:flex; justify-content: space-between; padding: 20px 15px; border-bottom: 1px solid Gainsboro;"><div style="display:flex;"><img data-id="member-image"src=${member.image_url}    style="width: 3rem; margin-right: 10px; border-radius: 50%;" /><div><h4 style="margin: 0;">${member.realname_ko}</h4><h5  style="font-weight: lighter;  margin: 0;">To: <span style="color:gray;">${this.user.nickname}</span></h5></div></div><h4 style="color: silver; font-weight: lighter; margin:0;">${mail.receive_datetime}</h4></div><div style="padding: 20px 15px; border-bottom: 1px solid Gainsboro;"><h3 style="margin: 0;">${mail.subject_ko}</h3></div></div>`;

    const mailDetailsDOM = new JSDOM(mail.mailDetailsHTMLString);
    const allImgs = mailDetailsDOM.window.document.querySelectorAll('img');

    let imageNum = 1;
    for (const img of allImgs) {
      const response = await this.imageUrlToBase64(img.src);

      if (!response.base64String) {
        console.log(`❗️ Failed to build image for ${mail.id}: `, error);
        return response.base64String;
      }

      img.src = response.base64String;

      const contentType = response.contentType.split('/')[1];
      let imagePath = path.join(imagesPath, this.fileName(mail, contentType));

      if (this.directoryExists(imagePath)) {
        imagePath = path.join(
          imagesPath,
          this.fileName(mail, contentType, imageNum)
        );
        imageNum++;
      }

      await fs.writeFile(
        imagePath,
        response.rawBase64String,
        'base64',
        function (error) {
          error && console.log(`❗️ Failed to save image ${mail.id}: `, error);
          return error;
        }
      );
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

    return new Promise((resolve, reject) => {
      fs.writeFile(mailPath, `<!DOCTYPE html>${htmlEl.outerHTML}`, 'utf8', (e) => {
        if (e) {
          return reject(cb(e));
        }
        resolve(cb(e));
      });
    });
  }

  fileName(mail, mimeType = 'html', key = '') {
    const mailDate = new Date(mail.receive_datetime).toDateString();
    return `${mail.id}__${mailDate}__${key && `${key}__`}.${mimeType}`;
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
    if (this.getMember(member.id)) {
      return;
    }

    const response = await this.imageUrlToBase64(member.image_url);

    if (!response.base64String) {
      console.log(`❗️ Failed to save member's profile picture.`);
      return;
    }

    member.image_url = response.base64String;
    this.members[member.id] = member;
  }

  getMember(memberId) {
    return this.members[memberId];
  }
}

module.exports = MailSaver;
