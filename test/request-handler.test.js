import "./request-mock";
import requestHandler from "../src/request-handler";
import request from "request";

describe("request-handler", () => {

    it("should proxy request", () => {
        const onRequest = requestHandler({
            uri: "http://example.org",
            method: "POST",
            customHeaders: {
                "X-Api-Gateway": "1.0"
            }
        });
        const pipe = jest.fn();
        const req = { 
            headers: {
                "Content-Type": "application/json",
                "host": "api-gateway"
            },
            body: "body",
            pipe: jest.fn()
        };
        req.pipe.mockImplementation(function() { 
            return { pipe }; 
        });
        const rreq = { rreq: "object" };
        const res = { res: "object" };
        request.mockImplementation(function() {
            return rreq;
        });

        onRequest(req, res, () => {});

        expect(request).toBeCalledWith({
            uri: "http://example.org",
            method: "POST",
            headers: {
                "X-Api-Gateway": "1.0",
                "Content-Type": "application/json",
                "host": undefined
            },
            body: "body",
        });
        expect(req.pipe).toBeCalledWith(rreq);
        expect(pipe).toBeCalledWith(res);
    });
});
