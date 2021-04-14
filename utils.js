const fileName = (mail, mimeType = 'html', key = '') => {
  const mailDate = new Date(mail.createdAt).toDateString();
  const fileName = `${mail.id}__${mailDate}__${mail.subject}__${
    key && `${key}__`
  }.${mimeType}`;
  return fileName.replace(/ /g, '-').replace(/\//g, '-');
};

module.exports = { fileName };
