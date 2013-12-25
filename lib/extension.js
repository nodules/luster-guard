var minimatch = require('minimatch'),
    Gaze = require('gaze').Gaze,
    debounce = require('./debounce'),
    extension = {},

    DEFAULT_EVENTS = [ 'added', 'changed', 'deleted' ],
    DEFAULT_DEBOUNCE = 300,
    DEFAULT_INCLUDE = '**/*';

/**
 * @see {@link https://github.com/isaacs/minimatch}
 * @param {String} path
 */
extension.filter = function(path) {
    if (this.exclude && this.exclude.length > 0) {
        return ! this.exclude.some(function(pattern) {
            return minimatch(path, pattern);
        });
    }
    return true;
};

/**
 * Call `console.log` if `silent` option is not set.
 * @param {String} ...args
 */
extension.log = function() {
    if ( ! this.silent) {
        return console.log.apply(console, arguments);
    }
};

/**
 * FS events callback.
 * @param {String} event
 * @param {String} path
 * @param {fs.Stats} stat
 */
extension.onMonitorEvent = function(event, path, stat) {
    /* jshint unused:false */
    if (this.events.indexOf(event) > -1 && this.filter(path)) {
        this.log('FS event <%s> on file "%s"', event, path);

        this.restartWorkers();
    }
};

/**
 * Remove fs events listeners.
 */
extension.unwatch = function() {
    this.gaze.close();
};

/**
 * @param {Master} master
 */
extension.initMaster = function(master) {
    this.master = master;

    this.restartWorkers = debounce(
        this.config.get('debounce', DEFAULT_DEBOUNCE),
        function() {
            this.log('restarting workers...');
            this.master.softRestart();
        }.bind(this)
    );

    this.gaze = new Gaze(this.include);

    // register events listeners
    this.events.forEach(function(event) {
        this.gaze.on(event, this.onMonitorEvent.bind(this, event));
    }, this);

    this.master.on('shutdown', this.unwatch.bind(this));
};

/**
 * @param {Configuration} config
 * @param {Master|Worker} proc luster Master or Worker
 * @see {@link "https://github.com/nodules/luster#plugins-development"}
 */
extension.configure = function(config, proc) {
    if (proc.isMaster) {
        this.config = config;

        // events to monitor
        this.events = this.config.get('events', DEFAULT_EVENTS);

        // don't write events to log if `true`
        this.silent = this.config.get('silent');

        this.include = this.config.get('include', DEFAULT_INCLUDE);
        this.exclude = this.config.get('exclude', null);

        this.initMaster(proc);
    }
};

module.exports = extension;
