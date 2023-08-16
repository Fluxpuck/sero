/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Create classes for Error handling
// https://www.w3schools.com/tags/ref_httpmessages.asp

class createError {
  constructor(status = 500, message = 'Bad Request') {
    this.status = status;
    this.message = message;
  }
}

// → Export the Error Classes
module.exports = {
  createError
};