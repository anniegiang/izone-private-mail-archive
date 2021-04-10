const userSettings = require('./userSettings');
const dotenv = require('dotenv');
dotenv.config();

const app = {
  apiHost: `https://app-api.izone-mail.com/v1`,
  appHost: 'https://app-web.izone-mail.com',
  imagesFolder: 'images',
  mailFolder: userSettings.mailFolderName || process.env.MAIL_FOLDER,
  mailViewerFile: process.env.MAIL_VIEWER_FILE || 'index.html',
};

const endpoints = {
  inbox: '/inbox',
  mail: '/mail',
  members: '/menu',
  users: '/users',
};

const pm = {
  'terms-version': 5,
  'application-version': '1.2.3',
  'os-type': 'iOS',
  'user-id': userSettings.userId || process.env.PM_USER_ID,
  'access-token': userSettings.accessToken || process.env.PM_ACCESS_TOKEN,
};

module.exports = {
  pm,
  app,
  endpoints,
};
