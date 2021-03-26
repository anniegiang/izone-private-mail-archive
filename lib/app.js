const PMApi = require("./pmApi");

class App {
  constructor(settings) {
    this.PMApi = new PMApi(settings);
  }

  async init() {
    // fetch inbox
    // compare local inbox with latest mail
    // stop if local inbox is already updated
    //
  }
}

module.exports = App;
