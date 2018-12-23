import apiGateway from "../src/api-gateway";
import request from "request";

describe("api-gateway", () => {

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

        it.skip("should register global middleware", (done) => {
            const app = apiGateway();
            app.registerMiddleware("410", (req, res) => {
                res.status(410).end();
            });
            const options = {
                mappingFilePath: "./test/fixture/mapping-with-middleware.json"
            };
            const listen = app.initialize(options);
            const server = listen(3001, () => {
                console.log('ready');
                setTimeout(() => request.get("http://localhost:3001/some-url", (err, response) => {
                    console.log('server response');
                    expect(response.status).toBe(404);
                    server.close(() => done());
                }), 1000);
            });
        });

        it("should return listen function to start server", (done) => {
            const app = apiGateway();
            const options = {
                mappingFilePath: "./test/fixture/mapping.json"
            };
            const listen = app.initialize(options);
            const server = listen(3000, () => {
                expect(server.address().port).toBe(3000);
                server.close(() => done());
            });
        });
    });
});
