const axios = require("axios");

class Api {
  constructor(apiConfig) {
    this.api = axios.create(apiConfig);
  }

  async get(path, options) {
    const res = await this.api(path, options);
    return res;
  }
}

module.exports = Api;
