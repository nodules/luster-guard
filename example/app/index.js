var http = require('http'),
    luster = require('luster');

var logger = require('./lib/logger').createLogger('l1');

var app = http.createServer(function(req, res) {
    res.statusCode = 200;
    res.end('done!');
});

app.on('listening', function() {
    if (luster.wid === 1) {
        logger('server is running on http://localhost:%d', app.address().port);
    }
});

exports = module.exports = app;
