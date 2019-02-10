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
            return app.listen.bind(app);
        }
    };

    function initializeMiddlewares(app, mapping) {
        if (mapping.middlewares) {
            mapping.middlewares.forEach(middleware => {
                app.use(middlewares.get(middleware));
                debug(`Registered global middleware ${middleware}`);    
            });
        }

        const services = mapping.services || [];
        services.forEach(service => {
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
                const { protocol, host, port, basePath } = service;
                const { path, method } = mapping;
                const proxyUri = `${resolveProtocol(protocol)}://${resolveHost(host)}:${resolvePort(port)}${path}`;
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
                                uri: proxyUri,
                                method,
                                customHeaders
                            }));
                        break;
                    default:
                        throw new Error(`Api Gateway does not support ${method} method`);
                }
                debug(`Registered route ${method} ${routePath} - ${middlewaresNames} - ${proxyUri}`);
                
            });
        });
    }

    function resolvePort(port) {
        if (isNaN(port)) {
            return process.env[port];
        }
        return port;
    }

    function resolveHost(host) {
        const hostEnvVariable = process.env[host]; 
        if (hostEnvVariable) {
            return hostEnvVariable;
        }
        return host;
    }

    function resolveProtocol(protocol) {
        if (!["http", "https", "tcp"].includes(protocol)) {
            return process.env[protocol];
        }
        return protocol;
    }
}
export default apiGateway;
