const axios = require("axios");

class Api {
  constructor(settings) {
    this.api = axios.create({
      baseURL: settings.app.apiHost,
      headers: settings.pm,
    });
  }

  async get(path, options) {
    const res = await this.api(path, options);
    return res;
  }
}

module.exports = Api;
