var chokidar = require('chokidar'),
    debounce = require('debounce'),
    extension = {},

    DEFAULT_EVENTS = [ 'add', 'change', 'unlink' ],
    DEFAULT_DEBOUNCE = 300,
    DEFAULT_INTERVAL = 300,
    DEFAULT_PATTERN = '**/*';

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
 * @private
 */
extension._restartWorkers = function() {
    this.log('restarting workers...');
    this.master.softRestart();
};

/**
 * FS events callback.
 * @param {String} event
 * @param {String} path
 * @param {fs.Stats} stat
 */
extension.onMonitorEvent = function(event, path, stat) {
    /* jshint unused:false */
    if (this.events.indexOf(event) > -1) {
        this.log('FS event <%s> on file "%s"', event, path);
        this.restartWorkers();
    }
};

/**
 * Remove FS events listeners.
 */
extension.unwatch = function() {
    this.watcher.close();
};

/**
 * @param {Master} master
 */
extension.initMaster = function(master) {
    this.master = master;

    this.restartWorkers = debounce(
        this._restartWorkers.bind(this),
        this.config.get('debounce', DEFAULT_DEBOUNCE));

    this.watcher = chokidar.watch(this.patterns, {
        ignoreInitial : true,
        interval : this.config.get('interval', DEFAULT_INTERVAL)
    });

    // register events listeners
    this.events.forEach(function(event) {
        this.watcher.on(event, this.onMonitorEvent.bind(this, event));
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
        this.events = DEFAULT_EVENTS;

        // don't write events to log if `true`
        this.silent = this.config.get('silent');

        this.patterns = this.config.get('patterns', DEFAULT_PATTERN);

        this.initMaster(proc);
    }
};

module.exports = extension;
