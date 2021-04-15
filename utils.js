const userSettings = require('./userSettings');

const fileName = (mail, mimeType = 'html', key = '') => {
  const { mailFileName } = userSettings;
  
  let fileName = `${mail.id}__`;

  if (mailFileName.date) {
    const mailDate = new Date(mail.createdAt).toDateString();
    fileName += `${mailDate}__`;
  }

  if (mailFileName.subject) {
    fileName += `${mail.subject}__`;
  }

  if (key) {
    fileName += `${key}__`;
  }

  fileName += `.${mimeType}`;

  return fileName.replace(/ /g, '-').replace(/\//g, '-');
};

module.exports = { fileName };
