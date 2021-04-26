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

const encodeFullFilePath = (path) => {
  const reg = new RegExp('[mib][0-9]{5}');
  const startIdx = path.search(reg);

  const rootPath = path.slice(0, startIdx);
  const fileName = path.slice(startIdx);
  const encoded = encodeURIComponent(fileName);

  return rootPath + encoded;
};

module.exports = { fileName, encodeFullFilePath };
