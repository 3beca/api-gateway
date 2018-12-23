import express from "express";
import mappingLoader from "./mapping-loader";
import middlewaresContainer from "./middlewares-container";

function apiGateway() {

    let initialized = false;

    return {
        registerMiddleware(name, middleware) {
            middlewaresContainer.set(name, middleware);
        },
        initialize(options) {
            if (initialized) {
                throw new Error("Initialize cannot be executed more than once");
            }

            const mapping = mappingLoader.load(options);

            const app = express();
            if (mapping.middlewares) {
                mapping.middlewares.forEach(middleware => {
                    app.use(middlewaresContainer.get(middleware));       
                });
            }
            // TODO: validate mapping json file

            initialized = true;
            return app.listen;
        }
    };
}
export default apiGateway;
