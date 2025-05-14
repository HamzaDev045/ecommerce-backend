class apiError {
    constructor(code, message, from, params) {
        this.code = code;
        this.message = message;
        this.from = from;
        this.params = params;
    }

    static forbidden(msg, from, params) {
        return new apiError(403, msg, from, params);
    }

    static unauthorized(msg, from, params) {
        return new apiError(401, msg, from, params);
    }

    static badRequest(msg, from, params) {
        return new apiError(400, msg, from, params);
    }

    static notFound(msg, from, params) {
        return new apiError(404, msg, from, params);
    }

    static internal(msg, from) {
        return new apiError(500, msg, from);
    }
}

export default apiError