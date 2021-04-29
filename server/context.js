const settings = require('../settings');
const Database = require('./database');
const PrivateMailController = require('./controllers/privateMail');

class Context {
  constructor() {
    this.settings = settings;
    this.database = new Database();
    this.pmController = new PrivateMailController({
      baseURL: settings.app.apiHost,
      headers: settings.pm,
    });
  }
}

module.exports = Context;
