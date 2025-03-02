// → Create classes for Error handling
// https://www.w3schools.com/tags/ref_httpmessages.asp

class CreateError {
    constructor(status = 500, message = 'Bad Request', success = false) {
        this.status = status;
        this.message = message;
        this.success = success;
    }

    toJSON() {
        return {
            status: this.status,
            message: this.message,
            success: this.success
        };
    }
}

class RequestError extends CreateError {
    constructor(status = 500, message = 'Bad Request', { method, path } = {}) {
        super(status, message);
        this.method = method;
        this.path = path;
    }

    toJSON() {
        return {
            status: this.status,
            message: this.message,
            data: this.data,
            request: this.request,
            stack: this.stack
        };
    }
}

// → Export the Error Classes
module.exports = {
    CreateError,
    RequestError
};