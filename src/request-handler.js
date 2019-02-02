import request from "request";

function requestHandler(options) {
    const { uri, method, customHeaders} = options;
    return function onRequest(req, res, next) {
        const rreq = request({
            uri,
            method,
            headers: getHeaders(req, customHeaders),
            body: req.body
        });
        req.pipe(rreq).pipe(res);
    };
}

function getHeaders(req, customHeaders) {
    const headers = { ...req.headers, ...customHeaders };
    // host header must be set as undefined, otherwise
    // provokes issues with https calls
    headers.host = undefined;
    return headers;
}
export default requestHandler;
