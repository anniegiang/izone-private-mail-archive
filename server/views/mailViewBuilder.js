const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const Context = require('../context');

class MailViewBuilder extends Context {
  async createMailView(mailPath, mail, member) {
    const index = await this.database.readFile(
      this.database.indexFilePath,
      'utf8'
    );
    const indexDOM = new JSDOM(index);

    const currentMails = indexDOM.window.document.querySelectorAll('.mail');
    for (const mailEl of currentMails) {
      if (mailEl.id === mail.id) {
        return;
      }
    }

    const content = mail.content.slice(0, 50);

    const mailHTML = `<div class="mail" id=${mail.id} data-src=${mailPath}><div class="mail-container"><img src=${member.imageUrl} data-id="member-image" alt=${member.name}><div class="mail-header-container"><div class="mail-header"><h4 class="member-name">${member.name}</h4><h4 class="mail-date">🖇 ${mail.createdAt}</h4></div><h4 class="mail-subject">${mail.subject}</h4><h4 class="mail-body">${content}...</h4></div></div></div>`;

    const mailDOM = new JSDOM(mailHTML, { runScripts: 'dangerously' });
    const mailElDOM = mailDOM.window.document.querySelector(`#${mail.id}`);

    indexDOM.window.document.querySelector('#mails').prepend(mailElDOM);

    try {
      await this.database.writeFile(
        this.database.indexFilePath,
        `<!DOCTYPE html>${
          indexDOM.window.document.querySelector('html').outerHTML
        }`,
        'utf8'
      );
    } catch (error) {
      console.error('Error adding mail to viewer: ', error);
    }
  }

  async buildIndexPage() {
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

    script.src = path.join(__dirname, '../../client/index.js');
    link.href = path.join(__dirname, '../../client/mail-viewer.css');
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
      await this.database.writeFile(
        this.database.indexFilePath,
        `<!DOCTYPE html>${html.outerHTML}`,
        'utf-8'
      );
    } catch (error) {
      console.error(
        `❗️  Error saving document ${this.database.indexFilePath} `,
        error
      );
    }
  }
}

module.exports = MailViewBuilder;
