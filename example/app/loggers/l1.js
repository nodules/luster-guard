module.exports = function log() {
    console.error.apply(console, arguments);
};
