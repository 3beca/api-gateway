import express from "express";

function apiGateway() {

    const app = express();
    const middlewares = {};
    let initialized = false;

    return {
        registerMiddleware(name, middleware) {
            if (typeof name !== "string") {
                throw new Error("name must be a string");
            }
            if (typeof middleware !== "function") {
                throw new Error("middleware must be a function");
            }
            if (middlewares[name]) {
                throw new Error(`Middleware ${name} is already registered`);
            }
            middlewares[name] = middleware;
        },
        initialize(options) {
            if (initialized) {
                throw new Error("Initialize cannot be executed more than once");
            }
            initialized = true;
            return function listen(port, callbackDone) {
                return app.listen(port, callbackDone);
            };
        }
    };
};
export default apiGateway;