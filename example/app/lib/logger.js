exports.createLogger = function createLogger(name) {
    return require('../loggers/' + name);
};
