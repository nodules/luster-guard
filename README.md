luster-guard [![NPM version][npm-image]][npm-link]
============

[![Dependency status][deps-image]][deps-link]
[![Development Dependency status][devdeps-image]][devdeps-link]

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
            // fs events handler debounce timeout (ms)
            debounce : 2000,

            // chokidar fs polling interval (ms)
            interval : 300,

            // don't log events, default: false
            silent : true,

            // if not defined, all files will be included in monitoring
            patterns: [ '**/*.js', '!**/node_modules/**' ],
        }
    }
};
```

Have fun!

[npm-image]: https://img.shields.io/npm/v/luster-guard.svg?style=flat
[npm-link]: https://npmjs.org/package/luster-guard
[deps-image]: https://img.shields.io/david/nodules/luster-guard.svg?style=flat
[deps-link]: https://david-dm.org/nodules/luster-guard
[devdeps-image]: https://img.shields.io/david/dev/nodules/luster-guard.svg?style=flat
[devdeps-link]: https://david-dm.org/nodules/luster-guard#info=devDependencies
