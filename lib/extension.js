var chokidar = require('chokidar'),
    debounce = require('debounce'),
    extension = {},

    DEFAULT_EVENTS = ['add', 'change', 'unlink'],
    DEFAULT_DEBOUNCE = 300,
    DEFAULT_INTERVAL = 300,
    DEFAULT_PATTERN = '**/*';

/**
 * Call `console.log` if `silent` option is not set.
 * @param {...String} args
 */
extension.log = function() {
    if ( ! this.silent) {
        /* eslint-disable no-console */
        return console.log.apply(console, arguments);
        /* eslint-enable no-console */
    }
};

/**
 * @private
 * @type {Boolean}
 */
extension._restarting = false;

/**
 * @private
 */
extension._restartWorkers = function() {
    if (this.useSoftRestart) {
        this.master.softRestart();
    } else if (this._restarting) {
        // schedule restarting if one in process already
        this.master.once('restarted', function() {
            extension._restartWorkers();
        });
    } else {
        this.log('restarting workers...');
        this._restarting = true;
        this.master.once('restarted', function() {
            extension._restarting = false;
        });
        this.master.restart();
    }
};

/* eslint-disable no-unused-vars */
/**
 * FS events callback.
 * @param {String} event
 * @param {String} path
 * @param {fs.Stats} stat
 */
extension.onMonitorEvent = function(event, path, stat) {
    if (this.events.indexOf(event) > -1) {
        this.log('FS event <%s> on file "%s"', event, path);
        this.restartWorkers();
    }
};
/* eslint-enable no-unused-vars */

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
        ignoreInitial: true,
        interval: this.config.get('interval', DEFAULT_INTERVAL)
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
        this.useSoftRestart = this.config.get('softRestart', true);
        this.initMaster(proc);
    }
};

module.exports = extension;
