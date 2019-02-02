jest.mock("express", () => () => {
    return {
        listen: (port, callback) => {
            setTimeout(callback, 0);
            return {
                address: () => { return { port }; },
                close: (callback) => {
                    setTimeout(callback, 0);
                } 
            };
        },
        use: jest.fn(),
        post: jest.fn(),
        get: jest.fn(),
        options: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn()
    };
});
