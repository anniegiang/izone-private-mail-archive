const BaseAPI = require('../baseAPI.js');
const settings = require('../../settings');

class PrivateMailController {
  constructor() {
    this.apiHost = settings.app.apiHost;
    this.appHost = settings.app.appHost;
    this.headers = settings.pm;
    this.endpoints = settings.endpoints;
    this.api = new BaseAPI({
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

  async getProfile() {
    return this.api.get(this.endpoints.users);
  }

  async downloadImage(imageUrl) {
    const response = await this.api.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    const result = { contentType: response.headers['content-type'] };

    if (!response.error) {
      const base64String = Buffer.from(response.data).toString('base64');
      result.rawBase64String = base64String;
      result.base64String = `data:'${response.headers['content-type']}';base64,${base64String}`;
    } else {
      result.base64String = '';
    }

    return result;
  }
}

module.exports = PrivateMailController;
