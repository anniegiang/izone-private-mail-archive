const settings = require('../settings');
const Database = require('./database');
const PrivateMailController = require('./controllers/privateMail');

class Context {
  constructor() {
    this.settings = settings;
    this.database = new Database();
    this.pmController = new PrivateMailController();
  }
}

module.exports = Context;
