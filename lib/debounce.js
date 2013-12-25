/**
 * @param {Number} threshold
 * @param {Function} func
 * @returns {Function}
 */
module.exports = function(threshold, func) {
    var timeout;

    return function() {
        function delayed () {
            func.apply(this, arguments);
            timeout = null;
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(delayed.bind(this), threshold || 100);
    };

};