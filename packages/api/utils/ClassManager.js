// → Create classes for Error handling
// https://www.w3schools.com/tags/ref_httpmessages.asp

class CreateError {
  constructor(status = 500, message = 'Bad Request') {
    this.status = status;
    this.message = message;
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