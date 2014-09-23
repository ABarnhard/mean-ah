'use strict';

var db      = process.env.DB,
    express = require('express'),
    app     = module.exports = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server);

require('./lib/config')(app);
require('./routes/routes')(app, express);
io.sockets.on('connection', require('./routes/socket'));

require('./lib/mongodb')(db, function(){
  server.listen(app.get('port'), function(){
    console.log('Express server listening on port', app.get('port'));
  });
});

module.exports = server;

