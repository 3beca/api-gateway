import express from "express";
import mappingLoader from "./mapping-loader";
import middlewaresContainer from "./middlewares-container";

function apiGateway() {

    let initialized = false;
    let expressApp;

    return {
        registerMiddleware(name, middleware) {
            middlewaresContainer.set(name, middleware);
        },
        initialize(options) {
            if (initialized) {
                throw new Error("Initialize cannot be executed more than once");
            }

            const mapping = mappingLoader.load(options);

            // TODO: validate mapping json file

            expressApp = express();
            if (mapping.middlewares) {
                mapping.middlewares.forEach(middleware => {
                    expressApp.use(middlewaresContainer.get(middleware));       
                });
            }

            initialized = true;
            return expressApp.listen;
        },
        getInternalExpressApp() {
            return expressApp;
        }
    };
}
export default apiGateway;
