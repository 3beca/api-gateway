const packageJson = require("../package.json");
const debug = require("debug")(packageJson.name);
export default debug;
