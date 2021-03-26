const Api = require("./api.js");

const CLASS_NAME = "PMApi";
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
    try {
      const response = await this.api.get(this.endpoints.inbox, {
        params: {
          is_star: 0,
          is_unread: 0,
          page: 1,
        },
      });
      return this.api.respond(response);
    } catch (error) {
      return this.api.errorResponse(error, CLASS_NAME, "getInbox");
    }
  }

  async getMailDetail(mailId) {
    try {
      const response = await this.api.get(`${this.endpoints.mail}/${mailId}`, {
        baseURL: this.appHost,
      });
      return this.api.respond(response);
    } catch (error) {
      return this.api.errorResponse(error, CLASS_NAME, "getMailDetail");
    }
  }

  async getMembers() {
    try {
      const response = await this.api.get(this.endpoints.members);
      return this.api.respond(response);
    } catch (error) {
      return this.api.errorResponse(error, CLASS_NAME, "getMembers");
    }
  }

  async getProfile() {
    try {
      const response = await this.api.get(this.endpoints.users);
      return this.api.respond(response);
    } catch (error) {
      return this.api.errorResponse(error, CLASS_NAME, "getProfile");
    }
  }
}

module.exports = PMApi;
