function middlewaresContainer() {
    const middlewares = [];
    return {
        set(name, middleware) {
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
        get(name) {
            return middlewares[name];
        }
    }
};
export default middlewaresContainer;
