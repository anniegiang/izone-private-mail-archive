const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const Api = require('./api');

class MailSaver {
  constructor() {
    this.members = {};
    this.api = new Api({});
    this.mailDetailDOMS = {};
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
    const headerHTMLString = `<div id="mail-header"><div class="mail-content-container"><div class="mail-content-image-container"><img data-id="member-image" src=${member.image_url}><div><h4 class="mail-content-member-name">${member.realname_ko}</h4><h5 class="mail-content-user-name">To: <span>${this.user.nickname}</span></h5></div></div><h4 class="mail-content-mail-date">${mail.receive_datetime}</h4></div><div class="mail-content-subject-container"><h3 class="mail-content-subject">${mail.subject_ko}</h3></div></div>`;

    const mailDetailsDOM = new JSDOM(mail.mailDetailsHTMLString);
    const allImgs = mailDetailsDOM.window.document.querySelectorAll('img');

    let imageNum = 1;
    for (const img of allImgs) {
      const response = await this.imageUrlToBase64(img.src);

      if (!response.base64String) {
        console.log(`❗️ Failed to download image for ${mail.id}`);
        return response.base64String;
      }

      img.src = response.base64String;

      const contentType = response.contentType.split('/')[1];
      let imagePath = path.join(imagesPath, this.fileName(mail, contentType));

      if (await this.directoryExists(imagePath)) {
        imagePath = path.join(
          imagesPath,
          this.fileName(mail, contentType, imageNum)
        );
        imageNum++;
      }

      try {
        await fs.promises.writeFile(
          imagePath,
          response.rawBase64String,
          'base64'
        );
      } catch (error) {
        console.error(`❗️  Error saving image ${imagePath} `, error);
      }
    }

    const headInnerHTML = mailDetailsDOM.window.document.querySelector('head')
      .innerHTML;

    const mailDetailsOuterHTML = mailDetailsDOM.window.document.querySelector(
      '#mail-detail'
    ).outerHTML;

    const htmlEl = mailDetailsDOM.window.document.createElement('html');
    htmlEl.lang = 'ko';
    htmlEl.innerHTML = headerHTMLString + mailDetailsOuterHTML;

    const customStyleLinkTag = mailDetailsDOM.window.document.createElement(
      'link'
    );

    customStyleLinkTag.rel = 'stylesheet';
    customStyleLinkTag.href = path.join(__dirname, '../client/mail.css');

    const htmlHeadEl = htmlEl.querySelector('head');
    htmlHeadEl.innerHTML = headInnerHTML;
    htmlHeadEl.appendChild(customStyleLinkTag);

    this.mailDetailDOMS[mail.id] = mailDetailsDOM;

    try {
      await fs.promises.writeFile(
        mailPath,
        `<!DOCTYPE html>${htmlEl.outerHTML}`,
        'utf8'
      );
      return cb();
    } catch (error) {
      return cb(error);
    }
  }

  async createMailView(mail, mailPath, indexPath) {
    const index = await fs.promises.readFile(indexPath, 'utf8');
    const indexDOM = this.indexDOM || new JSDOM(index);

    const currentMails = indexDOM.window.document.querySelectorAll('.mail');
    for (const mailEl of currentMails) {
      if (mailEl.id === mail.id) {
        return;
      }
    }

    const member = this.members[mail.member.id];
    const mailDetailDOM = this.mailDetailDOMS[mail.id];
    const pTags = mailDetailDOM.window.document.querySelectorAll(
      '#mail-detail p'
    );

    let body = '';
    for (const pTag of pTags) {
      body += pTag.textContent + ' ';
    }

    body = body.slice(0, 50);
    const newMailPath = mailPath.replace(/ /g, '%20');

    const mailHTML = `<div class="mail" id=${mail.id} data-src=${newMailPath}><div class="mail-container"><img src=${member.image_url} data-id="member-image" alt=${member.realname_ko}><div class="mail-header-container"><div class="mail-header"><h4 class="member-name">${member.realname_ko}</h4><h4 class="mail-date">🖇 ${mail.receive_datetime}</h4></div><h4 class="mail-subject">${mail.subject_ko}</h4><h4 class="mail-body">${body}...</h4></div></div></div>`;

    const mailDOM = new JSDOM(mailHTML, { runScripts: 'dangerously' });
    const mailElDOM = mailDOM.window.document.querySelector(`#${mail.id}`);

    indexDOM.window.document.querySelector('#mails').prepend(mailElDOM);

    this.indexDOM = indexDOM;

    try {
      await fs.promises.writeFile(
        indexPath,
        `<!DOCTYPE html>${
          indexDOM.window.document.querySelector('html').outerHTML
        }`,
        'utf8'
      );
    } catch (error) {
      console.error('Error adding mail to viewer: ', error);
    }
  }

  fileName(mail, mimeType = 'html', key = '') {
    const mailDate = new Date(mail.receive_datetime).toDateString();
    const fileName = `${mail.id}__${mailDate}__${mail.subject_ko}__${
      key && `${key}__`
    }.${mimeType}`;

    return fileName.replace(/ /g, '-').replace(/\//g, '-');
  }

  async localMails(directory) {
    const files = await fs.promises.readdir(directory);

    const htmlFiles = await Promise.all(
      files.map(async (file) => {
        const newPath = path.join(directory, file);
        const stat = await fs.promises.lstat(newPath);

        if (stat.isDirectory()) {
          return this.localMails(newPath);
        }

        const parsedFile = path.parse(file);
        if (
          stat.isFile() &&
          parsedFile.ext === '.html' &&
          parsedFile.name !== 'index'
        ) {
          return file;
        }
      })
    );

    return htmlFiles
      .flat()
      .filter((file) => file !== undefined)
      .map((file) => file.slice(0, 6));
  }

  async buildIndexPage(indexPath) {
    if (!(await this.directoryExists(indexPath))) {
      const { document } = new JSDOM().window;
      const html = document.createElement('html');
      const head = document.createElement('head');
      const body = document.createElement('body');
      const link = document.createElement('link');
      const script = document.createElement('script');
      const title = document.createElement('title');
      const section = document.createElement('section');
      const meta = document.createElement('meta');
      const viewPortMeta1 = document.createElement('meta');
      const viewPortMeta2 = document.createElement('meta');

      html.lang = 'ko';

      meta.setAttribute('charset', 'UTF-8');
      viewPortMeta1.setAttribute('name', 'viewport');
      viewPortMeta1.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0'
      );
      viewPortMeta2.setAttribute('http-equiv', 'X-UA-Compatible');
      viewPortMeta2.setAttribute('content', 'IE=edge');

      script.src = path.join(__dirname, '../client/index.js');
      link.href = path.join(__dirname, '../client/mail-viewer.css');
      link.rel = 'stylesheet';
      section.id = 'mails';
      title.textContent = 'IZ*ONE Private Mail';

      head.prepend(title);
      head.prepend(link);
      head.prepend(script);
      head.prepend(viewPortMeta2);
      head.prepend(viewPortMeta1);
      head.prepend(meta);
      body.append(section);

      html.append(head);
      html.append(body);

      try {
        await fs.promises.writeFile(
          indexPath,
          `<!DOCTYPE html>${html.outerHTML}`,
          'utf-8'
        );
      } catch (error) {
        console.error(`❗️  Error saving document ${indexPath} `, error);
      }
    }
  }

  async directoryExists(directory) {
    try {
      await fs.promises.access(directory);
      return true;
    } catch (error) {
      return false;
    }
  }

  async makeDirectory(directory) {
    await fs.promises.mkdir(directory, { recursive: true });
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
      console.log("❗️ Failed to save member's profile picture.");
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
