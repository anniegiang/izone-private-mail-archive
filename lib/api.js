const axios = require('axios');

class Api {
  constructor(apiConfig) {
    this.httpClient = axios.create(apiConfig);
  }

  async get(path, options) {
    try {
      const response = await this.httpClient(path, options);
      if (response.status === 200) {
        return this.respond(response);
      }
      return this.errorResponse(null);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  respond(response) {
    return { data: response.data, headers: response.headers, error: false };
  }

  errorResponse(error) {
    const { response } = error;
    const result = {
      error: true,
      status: null,
      statusText: null,
      data: null,
      fullError: error,
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
