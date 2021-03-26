const Server = require("./server");

class App {
  constructor() {
    this.server = new Server();
  }
}

module.exports = App;
