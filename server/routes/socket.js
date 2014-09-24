'use strict';

var Game = require('../models/game');

module.exports = function(socket){
  var roomId;
      // save off reference to io object
      // io = this,
      // console.log('io test', io);
      // socketId = socket.id;

  socket.on('create-game', function(data, cb){
    // console.log('raw in', data);
    Game.create(data, function(err, gameInfo){
      // console.log('gameInfo', gameInfo);
      roomId = gameInfo.roomId;
      socket.join(roomId);
      socket.join(data.player);
      cb(err, gameInfo);
    });
  });

  socket.on('join-game', function(data, cb){
    console.log('I Fired', 'socket.on join-game');
    Game.join(data, function(err, gameInfo){
      console.log('I Fired', 'Game.join CB');
      roomId = gameInfo.roomId;
      socket.join(roomId);
      socket.join(data.player);
      socket.broadcast.to(roomId).emit('player-joined', data.player);
      cb(err, gameInfo);
    });
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

};
