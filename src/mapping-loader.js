import fs from "fs";

function getMappingFile(mappingFilePath) {
    if (!fs.existsSync(mappingFilePath)) {
        throw new Error(`Cannot find json mapping file at path ${mappingFilePath}`);
    }
    return fs.readFileSync(mappingFilePath, "utf8");
}

function parseMappingFile(mappingFile) {
    try {
        return JSON.parse(mappingFile);
    }
    catch (error) {
        throw new Error(`Cannot parse mapping.json file: ${error}`);
    }
}

const mappingLoader = {
    load(options) {
        const mappingFilePath = options && options.mappingFilePath || "./mapping.json";
        const mappingFile = getMappingFile(mappingFilePath);
        return parseMappingFile(mappingFile);
    }
};
export default mappingLoader;
