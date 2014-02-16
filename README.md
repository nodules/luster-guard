# luster-guard

Restart workers on file system changes.

## Usage

Install extension module to application:

```console
$ npm install --save luster-guard
```

Add `"luster-guard"` to `"extensions"` section in the luster configuration:

```javascript
module.exports = {
    // ...

    extensions : {
        "luster-guard" : {
            // path of the monitoring root
            // absolute or relative to config
            path : '../..',

            // fs events handler debounce timeout (ms)
            debounce : 2000,

            // don't log events, default: false
            silent : true,

            // events to listen to
            // be careful, some events can be fired without any visible reason
            events : [ 'added', 'changed', 'deleted' ],

            // if not defined, all files will be included in monitoring
            patterns: [ '**/*.js', '!**/node_modules/**' ],
        }
    }
};
```

Have fun!
