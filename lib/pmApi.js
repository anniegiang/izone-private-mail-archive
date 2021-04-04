const Api = require('./api.js');

class PMApi {
  constructor(settings) {
    this.apiHost = settings.app.apiHost;
    this.appHost = settings.app.appHost;
    this.headers = settings.pm;
    this.endpoints = settings.endpoints;
    this.api = new Api({
      baseURL: this.apiHost,
      headers: this.headers,
    });
  }

  async getInbox(page = 1) {
    return this.api.get(this.endpoints.inbox, {
      params: { page, is_star: 0, is_unread: 0 },
    });
  }

  async getMailDetail(mailId) {
    return this.api.get(`${this.endpoints.mail}/${mailId}`, {
      baseURL: this.appHost,
    });
  }

  async getMembers() {
    return this.api.get(this.endpoints.members);
  }

  async getProfile() {
    return this.api.get(this.endpoints.users);
  }
}

module.exports = PMApi;
