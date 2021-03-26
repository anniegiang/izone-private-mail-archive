const Api = require("./api.js");

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

  async getInbox() {
    const res = await this.api.get(this.endpoints.inbox, {
      params: {
        is_star: 0,
        is_unread: 0,
        page: 1,
      },
    });
    return this.formatResponse(res);
  }

  async getMailDetail(mailId) {
    const res = await this.api.get(`${this.endpoints.mail}/${mailId}`, {
      baseURL: this.appHost,
    });
    return this.formatResponse(res);
  }

  async getMembers() {
    const res = await this.api.get(this.endpoints.members);
    return this.formatResponse(res);
  }

  async getProfile() {
    const res = await this.api.get(this.endpoints.users);
    return this.formatResponse(res);
  }

  formatResponse(res) {
    return this.goodRequest(res.status)
      ? { data: res.data }
      : { error: res.error ? res.error : true };
  }

  goodRequest(status) {
    return status === 200;
  }
}

module.exports = PMApi;
