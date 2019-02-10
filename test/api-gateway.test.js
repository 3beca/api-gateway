import "./express-mock";
import "./request-handler-mock";
import apiGateway from "../src/index";
import express from "express";
import requestHandler from "../src/request-handler";

describe("api-gateway", () => {

    beforeEach(() => {
        jest.clearAllMocks()
            .resetModules();
    });

    describe("registerMiddleware()", () => {

        it("should throw an error if name is undefined", () => {
            const app = apiGateway();
            const act = () => app.registerMiddleware(undefined, () => {});
            expect(act).toThrowError("name must be a string");
        });

        it("should throw an error if name if is not a string", () => {
            const app = apiGateway();
            const act = () => app.registerMiddleware(2, () => {});
            expect(act).toThrowError("name must be a string");
        });

        it("should throw an error if middleware is undefined", () => {
            const app = apiGateway();
            const act = () => app.registerMiddleware("test", undefined);
            expect(act).toThrowError("middleware must be a function");
        });

        it("should throw an error if middleware is already registered", () => {
            const app = apiGateway();
            app.registerMiddleware("test", () => {});
            const act = () => app.registerMiddleware("test", () => {});
            expect(act).toThrowError("Middleware test is already registered");
        });
    });

    describe("initialize()", () => {

        it("should throw an error if called twice", () => {
            const app = apiGateway();
            const options = {
                mappingFilePath: "./test/fixture/mapping.json"
            };
            app.initialize(options);
            const act = () => app.initialize(options);
            expect(act).toThrowError("Initialize cannot be executed more than once");
        });

        it("should throw an error if json mapping file does not exist", () => {
            const app = apiGateway();
            const options = {
                mappingFilePath: "./no-existing-mapping-file.json"
            };
            const act = () => app.initialize(options);
            expect(act).toThrowError("Cannot find json mapping file at path ./no-existing-mapping-file.json");
        });
        
        it("should use mappingFilePath ./mapping.json as convention if not provided in options object", () => {
            const app = apiGateway();
            const act = () => app.initialize();
            expect(act).toThrowError("Cannot find json mapping file at path ./mapping.json");
        });

        it("should throw an error if mapping file cannot be parsed to a valid json", () => {
            const app = apiGateway();
            const options = {
                mappingFilePath: "./test/fixture/invalid-json-mapping.txt"
            };
            const act = () => app.initialize(options);
            expect(act).toThrowError("Cannot parse mapping.json file: SyntaxError: Unexpected token I in JSON at position 0");
        });

        it("should call express app.use to register global middlewares if defined", () => {
            const expressApp = express();
            const app = apiGateway(expressApp);
            const a = () => {};
            const b = () => {};
            const c = () => {};
            
            app.registerMiddleware("a", a);
            app.registerMiddleware("b", b);
            app.registerMiddleware("c", c);
            
            const options = {
                mappingFilePath: "./test/fixture/mapping-with-global-middlewares.json"
            };
            app.initialize(options);

            expect(expressApp.use.mock.calls).toEqual([
                [a], // first call
                [b], // second call,
                [c] // third call
            ]);
        });

        it("should call express app.use to register service level middlewares if defined", () => {
            const expressApp = express();
            const app = apiGateway(expressApp);
            const a = () => {};
            const b = () => {};
            const c = () => {};
            
            app.registerMiddleware("a", a);
            app.registerMiddleware("b", b);
            app.registerMiddleware("c", c);
            
            const options = {
                mappingFilePath: "./test/fixture/mapping-with-service-middlewares.json"
            };
            app.initialize(options);

            expect(expressApp.use.mock.calls).toEqual([
                ["/auth", b], // first call
                ["/auth", a], // second call
                ["/todo", c], // second call
            ]);
        });

        it("should call express app.options/get/post/put/path to register mapped methods with its middlewares if defined", () => {
            const expressApp = express();
            const app = apiGateway(expressApp);
            const a = () => {};
            const b = () => {};
            const c = () => {};
            
            app.registerMiddleware("a", a);
            app.registerMiddleware("b", b);
            app.registerMiddleware("c", c);
            
            const options = {
                mappingFilePath: "./test/fixture/mapping-with-all-methods.json"
            };
            app.initialize(options);

            const postCalls = expressApp.post.mock.calls;
            expect(postCalls.length).toEqual(2, "post calls should be 2");
            const [ firstPostCallFirstParameter, firstPostCallSecondParameter] = postCalls[0];
            expect(firstPostCallFirstParameter).toEqual("/auth/login");
            expect(firstPostCallSecondParameter).toEqual([a]);
            const [ secondPostCallFirstParameter, secondPostCallSecondParameter] = postCalls[1];
            expect(secondPostCallFirstParameter).toEqual("/todo/items");
            expect(secondPostCallSecondParameter).toEqual([]);

            const getCalls = expressApp.get.mock.calls;
            expect(getCalls.length).toEqual(1, "get calls should be 1");
            const [ firstGetCallFirstParameter, firstGetCallSecondParameter] = getCalls[0];
            expect(firstGetCallFirstParameter).toEqual("/todo/items");
            expect(firstGetCallSecondParameter).toEqual([b, c]);

            const putCalls = expressApp.put.mock.calls;
            expect(putCalls.length).toEqual(1, "put calls should be 1");
            const [ firstPutCallFirstParameter, firstPutCallSecondParameter] = putCalls[0];
            expect(firstPutCallFirstParameter).toEqual("/todo/items/:id");
            expect(firstPutCallSecondParameter).toEqual([a, b, c]);
            
            const patchCalls = expressApp.patch.mock.calls;
            expect(patchCalls.length).toEqual(1, "patch calls should be 1");
            const [ firstPatchCallFirstParameter, firstPatchCallSecondParameter] = patchCalls[0];
            expect(firstPatchCallFirstParameter).toEqual("/todo/items/:id");
            expect(firstPatchCallSecondParameter).toEqual([c]);
            
            const deleteCalls = expressApp.delete.mock.calls;
            expect(deleteCalls.length).toEqual(1, "delete calls should be 1");
            const [ firstDeleteCallFirstParameter, firstDeleteCallSecondParameter] = deleteCalls[0];
            expect(firstDeleteCallFirstParameter).toEqual("/todo/items/:id");
            expect(firstDeleteCallSecondParameter).toEqual([c, a]);
            
            const optionsCalls = expressApp.options.mock.calls;
            expect(optionsCalls.length).toEqual(1, "options calls should be 1");
            const [ firstOptionsCallFirstParameter, firstOptionsCallSecondParameter] = optionsCalls[0];
            expect(firstOptionsCallFirstParameter).toEqual("/todo/items");
            expect(firstOptionsCallSecondParameter).toEqual([]);

            expect(requestHandler.mock.calls).toEqual([
                [{
                    customHeaders: {
                        "X-Api-Gateway": "api-gateway"
                    },
                    method: "POST",
                    basePath: "/auth",
                    uri: "http://127.0.0.1:3000"
                }],
                [{
                    customHeaders: {
                        "X-Api-Gateway": "api-gateway"
                    },
                    method: "POST",
                    basePath: "/todo",
                    uri: "http://127.0.0.1:3001"
                }],
                [{
                    customHeaders: {
                        "X-Api-Gateway": "api-gateway"
                    },
                    method: "GET",
                    basePath: "/todo",
                    uri: "http://127.0.0.1:3001"
                }],
                [{
                    customHeaders: {
                        "X-Api-Gateway": "api-gateway"
                    },
                    method: "PUT",
                    basePath: "/todo",
                    uri: "http://127.0.0.1:3001"
                }],
                [{
                    customHeaders: {
                        "X-Api-Gateway": "api-gateway"
                    },
                    method: "PATCH",
                    basePath: "/todo",
                    uri: "http://127.0.0.1:3001"
                }],
                [{
                    customHeaders: {
                        "X-Api-Gateway": "api-gateway"
                    },
                    method: "DELETE",
                    basePath: "/todo",
                    uri: "http://127.0.0.1:3001"
                }],
                [{
                    customHeaders: {
                        "X-Api-Gateway": "api-gateway"
                    },
                    method: "OPTIONS",
                    basePath: "/todo",
                    uri: "http://127.0.0.1:3001"
                }]
            ]);
        });

        it("should call request handler with host and port resolved from ENV variables", () => {
            process.env.AUTH_PROTOCOL = "https";
            process.env.AUTH_HOST = "auth.com";
            process.env.AUTH_PORT = "443";
            
            const expressApp = express();
            const app = apiGateway(expressApp);

            const options = {
                mappingFilePath: "./test/fixture/mapping-with-env-in-host-and-port.json"
            };
            app.initialize(options);

            const getCalls = expressApp.get.mock.calls;
            expect(getCalls.length).toEqual(1, "get calls should be 1");
            const [ firstGetCallFirstParameter, firstGetCallSecondParameter] = getCalls[0];
            expect(firstGetCallFirstParameter).toEqual("/auth/login");
            expect(firstGetCallSecondParameter).toEqual([]);
            expect(requestHandler).toBeCalledWith({
                customHeaders: {
                    "X-Api-Gateway": "api-gateway"
                },
                method: "GET",
                basePath: "/auth",
                uri: "https://auth.com:443"
            });
        });

        it("should throw an error if mapping an unsupported method", () => {
            const app = apiGateway();
            const options = {
                mappingFilePath: "./test/fixture/mapping-with-unsupported-method.json"
            };
            const act = () => app.initialize(options);
            expect(act).toThrowError("Api Gateway does not support HEAD method");
        });

        it("should return listen function to start server", (done) => {
            const app = apiGateway();
            const options = {
                mappingFilePath: "./test/fixture/mapping.json"
            };
            const listen = app.initialize(options);
            expect(typeof listen).toBe("function");
            const server = listen(3000, () => {
                expect(server.address().port).toBe(3000);
                server.close(() => done());
            });
        });
    });
});
