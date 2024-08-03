// → Create classes for Error handling
// https://www.w3schools.com/tags/ref_httpmessages.asp

class CreateError {
  constructor(status = 500, message = 'Bad Request', success = false) {
    this.status = status;
    this.message = message;
    this.success = success;
  }
}

class RequestError extends CreateError {
  constructor(status = 500, message = 'Bad Request', { method, path } = {}) {
    super(status, message);
    this.method = method;
    this.path = path;
  }
}

// → Export the Error Classes
module.exports = {
  CreateError,
  RequestError
};