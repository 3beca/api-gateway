import express from "express";
import mappingLoader from "./mapping-loader";
import middlewaresContainer from "./middlewares-container";
import debug from "./debug";
import requestHandler from "./request-handler";

function apiGateway(expressApp) {

    let initialized = false;
    const middlewares = middlewaresContainer();

    return {
        registerMiddleware(name, middleware) {
            middlewares.set(name, middleware);
            debug(`Registered middleware ${name}`);
        },
        initialize(options) {
            if (initialized) {
                throw new Error("Initialize cannot be executed more than once");
            }

            const mapping = mappingLoader.load(options);

            // TODO: validate mapping json file

            const app = expressApp || express();
            
            initializeMiddlewares(app, mapping);
            initializeRoutingMethods(app, mapping);

            initialized = true;
            return app.listen;
        }
    };

    function initializeMiddlewares(app, mapping) {
        if (mapping.middlewares) {
            mapping.middlewares.forEach(middleware => {
                app.use(middlewares.get(middleware));
                debug(`Registered global middleware ${middleware}`);    
            });
        }

        mapping.services.forEach(service => {
            if (service.middlewares) {
                service.middlewares.forEach(middleware => {
                    app.use(service.basePath, middlewares.get(middleware));
                    debug(`Registered service middleware ${middleware} - route ${service.basePath}`);       
                }); 
            }
        });
    }

    function initializeRoutingMethods(app, mapping) {
        const services = mapping.services || [];
        const customHeaders = mapping.headers;
        services.forEach(service => {
            const mappings = service.mappings || [];
            mappings.forEach(mapping => {
                const { host, port, basePath } = service;
                const { path, method } = mapping;
                const proxyUri = `${host}:${port}${path}`;
                const routePath = basePath + path;
                const middlewaresNames = mapping.middlewares || [];
                const middlewaresFuncs = middlewaresNames.map(m => middlewares.get(m));
                switch (method) {
                    case "GET":
                    case "POST":
                    case "DELETE":
                    case "PUT":
                    case "PATCH":
                    case "OPTIONS":
                        app[method.toLowerCase()](
                            routePath, 
                            middlewaresFuncs, 
                            requestHandler({
                                proxyUri,
                                method,
                                customHeaders
                            }));
                        break;
                    default:
                        console.warn("method " + method + " it is not supported");
                }
                debug(`Registered route ${method} ${routePath} - ${middlewaresNames}`);
                
            });
        });
    }
}
export default apiGateway;
