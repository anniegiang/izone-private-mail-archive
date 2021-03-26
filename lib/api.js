const http = require("http");
const settings = require("../settings");

class Api {
  constructor() {
    this.port = settings.app.port;
  }

  startServer() {
    this.server = http.createServer((req, res) => {
      res.statusCode = 200;
    });

    this.server.listen(this.port, () => {
      console.log(`Server running at port ${this.port}`);
    });
  }
}

module.exports = Api;
