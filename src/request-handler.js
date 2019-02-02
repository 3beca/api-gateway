function requestHandler(options) {
    //const { uri, method, customHeaders} = options;
    return function onRequest(req, res, next) {
        console.log(req, res, next);
    };
}
export default requestHandler;
