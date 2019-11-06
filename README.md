# api-gateway
Api Gateway library package

[![Npm Version](https://badge.fury.io/js/%40tribeca%2Fapi-gateway.svg)](https://www.npmjs.com/package/@tribeca/api-gateway)
[![Actions Status](https://github.com/3beca/api-gateway/workflows/Node%20CI/badge.svg)](https://github.com/3beca/api-gateway/actions)
[![CodeFactor](https://www.codefactor.io/repository/github/3beca/api-gateway/badge)](https://www.codefactor.io/repository/github/3beca/api-gateway)
[![codecov](https://codecov.io/gh/3beca/api-gateway/branch/master/graph/badge.svg)](https://codecov.io/gh/3beca/api-gateway) 
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=3beca/api-gateway)](https://dependabot.com)

A simple api gateway built on the top of expressJs.

## Installation

```
$ npm install @tribeca/api-gateway --save
```

## Example

```js
const apiGateway = require("@tribeca/api-gateway");
const corsMiddleware = require("./cors-middleware");

const app = apiGateway();

app.registerMiddleware("cors", corsMiddleware);

const listen = app.initialize({
    mappingFilePath: "./mapping.json"
});

const port = process.PORT || 3000;
listen(port, function() {
    console.log(`Server listening at port ${port}`);
});
```

Where mapping.json is

```json
{
    "version": 1,
    "headers": {
        "X-Api-Gateway": "api-gateway"
    },
    "middlewares": ["cors"],
    "services": [
        {
            "name": "test",
            "protocol": "http",
            "host": "127.0.0.1",
            "port": "3001",
            "basePath": "/subpath",
            "middlewares": [],
            "mappings": [
                {
                    "path": "/test",
                    "method": "GET",
                    "middlewares": []
                }
            ]
        }
    ]
}
```

## License
Licensed under [MIT](./LICENSE).