const path = require('path');

const ROOT_PATH = path.resolve(__dirname, '..');
const CODE_PATH = path.resolve(__dirname);
const CONFIG_PATH = path.join(ROOT_PATH, 'config');

module.exports = {
    ROOT_PATH, CODE_PATH, CONFIG_PATH,
};
