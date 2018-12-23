import express from "express";
import fs from "fs";

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

            const mappingFilePath = options && options.mappingFilePath || "./mapping.json";
            if (!fs.existsSync(mappingFilePath)) {
                throw new Error(`Cannot find json mapping file at path ${mappingFilePath}`);
            }
            const mappingFile = fs.readFileSync(mappingFilePath, "utf8");
            try {
                JSON.parse(mappingFile);
            }
 catch (error) {
                throw new Error(`Cannot parse mapping.json file: ${error}`);
            }
            initialized = true;
            return function listen(port, callbackDone) {
                return app.listen(port, callbackDone);
            };
        }
    };
}
export default apiGateway;
