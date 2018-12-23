jest.mock("express", () => () => {
    return {
        listen: (port, callback) => {
            setTimeout(callback, 0);
            return {
                address: () => { return { port } },
                close: (callback) => {
                    setTimeout(callback, 0);
                } 
            }
        }
    }
});