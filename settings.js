const dotenv = require('dotenv');
dotenv.config();

const app = {
  apiHost: `${process.env.PM_API_HOST}${process.env.PM_API_VERSION}`,
  appHost: process.env.PM_APP_HOST,
  mailFolder: process.env.MAIL_FOLDER,
  imagesFolder: process.env.IMAGES_FOLDER,
};

const endpoints = {
  inbox: process.env.PM_INBOX_PATH,
  mail: process.env.PM_MAIL_PATH,
  members: process.env.PM_MEMBERS_PATH,
  users: process.env.PM_USERS_PATH,
};

const pm = {
  'terms-version': process.env.TERMS_VERSION,
  'application-version': process.env.APPLICATION_VERSION,
  'os-type': process.env.OS_TYPE,
  'user-id': process.env.PM_USER_ID,
  'access-token': process.env.PM_ACCESS_TOKEN,
};

module.exports = {
  pm,
  app,
  endpoints,
};
