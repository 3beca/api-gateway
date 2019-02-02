import express from "express";
import mappingLoader from "./mapping-loader";
import middlewaresContainer from "./middlewares-container";
import debug from "./debug";

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

            initialized = true;
            return app.listen;
        }
    };

    function initializeMiddlewares(app, mapping) {
        if (mapping.middlewares) {
            mapping.middlewares.forEach(middleware => {
                app.use(middlewares.get(middleware));
                debug(`use global middleware ${middleware}`);    
            });
        }

        mapping.services.forEach(service => {
            if (service.middlewares) {
                service.middlewares.forEach(middleware => {
                    app.use(service.basePath, middlewares.get(middleware));
                    debug(`use service middleware ${middleware} - ${service.basePath}`);       
                }); 
            }

            if (!service.mappings) { 
                return;
            }
            service.mappings.forEach(mapping => {
                if (!mapping.middlewares) { 
                    return;
                }
                mapping.middlewares.forEach(middleware => {
                    const path = service.basePath + mapping.path; 
                    app.use(path, middlewares.get(middleware));  
                    debug(`use service middleware ${middleware} - ${path}`);
                });                      
            });
        });
    }
}
export default apiGateway;
