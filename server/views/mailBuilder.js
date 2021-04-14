const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const Context = require('../context');
const { fileName } = require('../../utils');

class MailBuilder extends Context {
  constructor(mail, member, user) {
    super();
    this.mail = mail;
    this.member = member;
    this.user = user;
  }

  async setupMemberDirectory() {
    const memberDirectory = path.join(
      this.database.mailsDirectory,
      this.member.name
    );

    const memberImagesDirectory = path.join(
      memberDirectory,
      this.database.imagesDirectory
    );

    await this.database.makeDirectory(memberImagesDirectory);

    this.memberDirectory = memberDirectory;
    this.memberImagesDirectory = memberImagesDirectory;
  }

  async saveMail() {
    const dom = new JSDOM(this.mail.mailDetails);
    const { document } = dom.window;

    document.querySelectorAll('link').forEach((link) => link.remove());
    document.querySelectorAll('script').forEach((link) => link.remove());

    const imgs = document.querySelectorAll('img');
    await this.convertAndSaveImages(imgs);

    const mailHeader = new JSDOM(this.mailHeader).window.document.querySelector(
      '#mail-header'
    );

    document.querySelector('#mail-detail').parentNode.prepend(mailHeader);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path.join(__dirname, '../../client/mail.css');

    document.querySelector('head').appendChild(link);

    try {
      await this.storeMail(this.mailPath, dom.serialize(), 'utf-8');
      return true;
    } catch (error) {
      console.error(`Error saving mail ${this.mail.id}`, error);
      return false;
    }
  }

  async convertAndSaveImages(imgs) {
    let imageNum = 1;
    await Promise.all(
      Array.prototype.map.call(imgs, async (img) => {
        const response = await this.downloadImage(img.src);

        img.src = response.base64String;

        const contentType = response.contentType.split('/')[1];

        let imagePath = path.join(
          this.memberImagesDirectory,
          fileName(this.mail, contentType)
        );

        if (await this.database.directoryExists(imagePath)) {
          imagePath = path.join(
            this.memberImagesDirectory,
            fileName(this.mail, contentType, imageNum)
          );

          imageNum++;
        }
        await this.saveImage(imagePath, response.rawBase64String, 'base64');
      })
    );
  }

  async storeMail(path, data, dataType) {
    try {
      await this.database.writeFile(path, data, dataType);
      return true;
    } catch (error) {
      console.error(`❗️  Error saving mail ${path} `, error);
      return false;
    }
  }

  async downloadImage(imageUrl) {
    try {
      return this.pmController.downloadImage(imageUrl);
    } catch (error) {
      console.error(`❗️  Error downloading image ${imageUrl} `, error);
    }
  }

  async saveImage(path, data, dataType) {
    try {
      await this.database.writeFile(path, data, dataType);
    } catch (error) {
      console.error(`❗️  Error saving image ${path} `, error);
    }
  }

  get mailPath() {
    return path.join(this.memberDirectory, this.mail.fileName);
  }

  get mailHeader() {
    return `<div id="mail-header"><div class="mail-content-container"><div class="mail-content-image-container"><img data-id="member-image" src=${this.member.imageUrl}><div><h4 class="mail-content-member-name">${this.member.name}</h4><h5 class="mail-content-user-name">To: <span>${this.user.name}</span></h5></div></div><h4 class="mail-content-mail-date">${this.mail.createdAt}</h4></div><div class="mail-content-subject-container"><h3 class="mail-content-subject">${this.mail.subject}</h3></div></div>`;
  }
}

module.exports = MailBuilder;
