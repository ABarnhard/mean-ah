'use strict';

module.exports = function(socket){
  socket.on('test', function(data){
    socket.emit('test');
  });

  socket.on('data-test', function(data){
    socket.emit('data-test', data);
  });

};
