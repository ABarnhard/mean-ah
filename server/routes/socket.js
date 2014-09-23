'use strict';

var Game = require('../models/game');

module.exports = function(socket){
  var roomId,
      // save off reference to io object
      // io = this,
      // console.log('io test', io);
      socketId = socket.id;

  socket.on('test', function(data){
    socket.emit('test');
  });

  socket.on('data-test', function(data){
    socket.emit('data-test', data);
  });

  socket.on('create-game', function(data){
    data.owner.socketId = socketId;
    console.log('raw in', data);
    Game.create(data, function(err, gameInfo){
      console.log('gameInfo', gameInfo);
      roomId = gameInfo.roomId;
      socket.join(roomId);
      socket.emit('game-created', gameInfo);
    });
  });

  socket.on('join-game', function(data){
    data.player.socketId = socketId;
    Game.join(data, function(err, gameInfo){
      socket.emit('game-joined', gameInfo);
    });
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

};
