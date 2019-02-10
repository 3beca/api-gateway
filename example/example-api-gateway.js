import apiGateway from "../src/index";
import corsMiddleware from "./cors-middleware";
import express from "express";

const appBehindApiGateway = express();
appBehindApiGateway.get("/test", function(req, res) {
    res.json({
        ts: new Date(),
        xApiGateway: req.get("X-Api-Gateway")
    });
});
appBehindApiGateway.listen(3001, function() {
    console.log("Server listening at port 3001");
    
    const app = apiGateway();
    
    app.registerMiddleware("cors", corsMiddleware);

    const listen = app.initialize({
        mappingFilePath: "./example/mapping.json"
    });

    const port = process.PORT || 3000;
    listen(port, function() {
        console.log(`Api Gateway listening at port ${port}`);
    });
});
