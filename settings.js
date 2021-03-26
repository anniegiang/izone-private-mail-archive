const dotenv = require("dotenv");
dotenv.config();

const userSettings = {
  userId: process.env.PM_USER_ID,
  accessToken: process.env.PM_ACCESS_TOKEN,
};

const appSettings = {
  "terms-version": process.env.TERMS_VERSION,
  "os-type": process.env.OS_TYPE,
  api_host: process.env.PM_API_HOST,
  app_host: process.env.PM_APP_HOST,
};

module.exports = {
  userSettings,
  appSettings,
};
