import "./express-mock";
import apiGateway from "../src/index";
import requestHandler from "../src/request-handler";
import express from "express";

describe("api-gateway", () => {

    beforeEach(() => {
        jest.resetModules();
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

            expect(JSON.stringify(expressApp.post.mock.calls)).toEqual(
                JSON.stringify([
                ["/auth/login", [a], requestHandler()],
                ["/todo/items", [], requestHandler()]
            ]));
            expect(JSON.stringify(expressApp.get.mock.calls)).toEqual(
                JSON.stringify([
                ["/todo/items", [b, c], requestHandler()]
            ]));
            expect(JSON.stringify(expressApp.put.mock.calls)).toEqual(
                JSON.stringify([
                ["/todo/items/:id", [a, b, c], requestHandler()]
            ]));
            expect(JSON.stringify(expressApp.patch.mock.calls)).toEqual(
                JSON.stringify([
                ["/todo/items/:id", [c], requestHandler()]
            ]));
            expect(JSON.stringify(expressApp.delete.mock.calls)).toEqual(
                JSON.stringify([
                ["/todo/items/:id", [c, a], requestHandler()]
            ]));
            expect(JSON.stringify(expressApp.options.mock.calls)).toEqual(
                JSON.stringify([
                ["/todo/items", [], requestHandler()]
            ]));
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
