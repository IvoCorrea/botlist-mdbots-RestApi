const { HttpStatusCode } = require('axios');

module.exports = class HttpError extends Error {
  static Status = HttpStatusCode;
  /**
   * @param {number} statusCode
   * @param {string} message
   */
  constructor(statusCode, message) {
    super(message || HttpError.Status[statusCode]);
    this.status = statusCode || 500;
  }
};
