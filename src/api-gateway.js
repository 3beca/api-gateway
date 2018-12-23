import express from "express";
import mappingLoader from "./mapping-loader";
import middlewaresContainer from "./middlewares-container";

function apiGateway() {

    const app = express();
    let initialized = false;

    return {
        registerMiddleware(name, middleware) {
            middlewaresContainer.set(name, middleware);
        },
        initialize(options) {
            if (initialized) {
                throw new Error("Initialize cannot be executed more than once");
            }

            mappingLoader.load(options);

            initialized = true;
            return app.listen;
        }
    };
}
export default apiGateway;
