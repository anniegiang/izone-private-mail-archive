const axios = require("axios");

class Api {
  constructor(settings) {
    this.api = axios.create({
      baseURL: settings.app.apiHost,
      headers: settings.pm,
    });
    this.endpoints = settings.endpoints;
  }

  get(path, options) {
    return this.api(path, options);
  }

  getInbox() {
    return this.get(this.endpoints.inbox, {
      params: {
        is_star: 0,
        is_unread: 0,
        page: 1,
      },
    });
  }
}

module.exports = Api;
