import apiGateway from "../src/api-gateway";

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
            app.initialize();
            const act = () => app.initialize();
            expect(act).toThrowError("Initialize cannot be executed more than once");
        });

        it("should return listen function to start server", () => {
            const app = apiGateway();
            const listen = app.initialize();
            const server = listen(3000, () => {
                expect(server.address().port).toBe(3000);
                server.close(() => {
                    expect(true).toBe(true);
                });
            });
        });
    });
});
