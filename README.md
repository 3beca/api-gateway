# api-gateway
Api Gateway library package

[ ![Npm Version](https://badge.fury.io/js/%40tribeca%2Fapi-gateway.svg)](https://www.npmjs.com/package/@tribeca/api-gateway)
[ ![Codeship Status for 3beca/api-gateway](https://app.codeship.com/projects/9753ffc0-e720-0136-de2b-368d39e2d392/status?branch=master)](https://app.codeship.com/projects/319504)
[ ![CodeFactor](https://www.codefactor.io/repository/github/3beca/api-gateway/badge)](https://www.codefactor.io/repository/github/3beca/api-gateway)
[![codecov](https://codecov.io/gh/3beca/api-gateway/branch/master/graph/badge.svg)](https://codecov.io/gh/3beca/api-gateway) [![Greenkeeper badge](https://badges.greenkeeper.io/3beca/api-gateway.svg)](https://greenkeeper.io/)

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
            "host": "http://127.0.0.1",
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