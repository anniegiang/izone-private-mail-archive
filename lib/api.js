const axios = require("axios");

class Api {
  constructor(apiConfig) {
    this.api = axios.create(apiConfig);
  }

  async get(path, options) {
    await this.api(path, options);
  }

  respond(res) {
    return { data: res.data, error: false };
  }

  errorResponse(error, className, errorOrigin) {
    const { response } = error;
    const result = {
      className,
      errorOrigin,
      error: true,
      status: null,
      statusText: null,
      data: null,
    };

    if (!response) {
      return result;
    }

    if (response.status) {
      result.status = response.status;
    }

    if (response.statusText) {
      result.statusText = response.statusText;
    }

    if (response.data) {
      result.data = response.data;

      if (response.data.error && response.data.error.data) {
        result.data = response.data.error.data;
      }
    }

    return result;
  }
}

module.exports = Api;
