import express from "express";
import mappingLoader from "./mapping-loader";
import middlewaresContainer from "./middlewares-container";

function apiGateway(expressApp) {

    let initialized = false;
    const middlewares = middlewaresContainer();

    return {
        registerMiddleware(name, middleware) {
            middlewares.set(name, middleware);
        },
        initialize(options) {
            if (initialized) {
                throw new Error("Initialize cannot be executed more than once");
            }

            const mapping = mappingLoader.load(options);

            // TODO: validate mapping json file

            const app = expressApp || express();
            if (mapping.middlewares) {
                mapping.middlewares.forEach(middleware => {
                    app.use(middlewares.get(middleware));       
                });
            }

            mapping.services.forEach(service => {
                service.middlewares.forEach(middleware => {
                    app.use(service.basePath, middlewares.get(middleware));       
                });
            });

            initialized = true;
            return app.listen;
        }
    };
}
export default apiGateway;
