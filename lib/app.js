const settings = require("../settings");
const Api = require("./api");

class App {
  constructor() {
    this.api = new Api(settings);
  }
}

module.exports = App;
