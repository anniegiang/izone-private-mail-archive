const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const Context = require('../context');

class MailViewBuilder extends Context {
  async createMemberLink(linkLabel, link, destinationPath) {
    const index = await this.database.readFile(destinationPath, 'utf8');
    const indexDOM = new JSDOM(index);

    const memberLinks = indexDOM.window.document.querySelectorAll(
      '.member-link'
    );

    for (const linkEl of memberLinks) {
      if (linkEl.id.includes(linkLabel)) {
        return;
      }
    }

    const linkHTML = `<a class='member-link' id=${
      linkLabel + '-member-link'
    } href=${link}>${linkLabel}</a>`;

    const linkDOM = new JSDOM(linkHTML, { runScripts: 'dangerously' });
    const linkEl = linkDOM.window.document.querySelector(
      `#${linkLabel}-member-link`
    );

    indexDOM.window.document.querySelector('#member-links').append(linkEl);

    try {
      await this.database.writeFile(
        destinationPath,
        `<!DOCTYPE html>${
          indexDOM.window.document.querySelector('html').outerHTML
        }`,
        'utf8'
      );
    } catch (error) {
      console.error('Error adding mail to member viewer: ', error);
    }
  }
  async createMailView(mailPath, mail, member, indexPath) {
    const index = await this.database.readFile(indexPath, 'utf8');
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

  async buildIndexPage(indexPath = this.database.indexFilePath) {
    const { document } = new JSDOM().window;

    const html = document.createElement('html');
    const head = document.createElement('head');
    const body = document.createElement('body');
    const link = document.createElement('link');
    const script = document.createElement('script');
    const title = document.createElement('title');
    const mails = document.createElement('section');
    const memberLinks = document.createElement('section');
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

    script.src = path.resolve('client/index.js');
    link.href = path.resolve('client/mail-viewer.css');
    link.rel = 'stylesheet';
    mails.id = 'mails';
    memberLinks.id = 'member-links';
    title.textContent = 'IZ*ONE Private Mail';

    head.prepend(title);
    head.prepend(link);
    head.prepend(script);
    head.prepend(viewPortMeta2);
    head.prepend(viewPortMeta1);
    head.prepend(meta);

    body.append(memberLinks);
    body.append(mails);

    html.append(head);
    html.append(body);

    try {
      await this.database.writeFile(
        indexPath,
        `<!DOCTYPE html>${html.outerHTML}`,
        'utf-8'
      );
    } catch (error) {
      console.error(`❗️  Error saving document ${indexPath} `, error);
    }
  }
}

module.exports = MailViewBuilder;
