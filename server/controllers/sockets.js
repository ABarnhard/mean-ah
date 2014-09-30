'use strict';

var Game = require('../models/game'),
    roomId;

function Io(){
}

Object.defineProperty(Io, 'sio', {
  get: function(){return global.sio;}
});

exports.createGame = function(data, cb){
  var socket = this;
  // console.log('raw in', data);
  Game.create(data, function(err, gameInfo){
    // console.log('gameInfo', gameInfo);
    roomId = gameInfo.roomId;
    socket.join(roomId);
    socket.join(data.player);
    cb(err, roomId);
  });
};

exports.joinGame = function(data, cb){
  var socket = this;
  // console.log('I Fired', 'socket.on join-game');
  Game.join(data, function(err, id){
    // console.log('I Fired', 'Game.join CB');
    if(!err){
      roomId = id;
      socket.join(roomId);
      socket.join(data.player);
      socket.broadcast.to(roomId).emit('player-joined', data.player);
    }
    cb(err, id);
  });
};

exports.startGame = function(data, cb){
  // console.log('socked recieved start-game');
  Game.start(data.gameId, function(err, count){
    Io.sio.to(roomId).emit('game-start');
    cb();
  });
};

exports.playerConnect = function(data, cb){
  roomId = data.roomId;
  this.join(roomId);
  this.join(data.player);
  cb();
};

// data = {gameId:'roomId of game'}
exports.drawHand = function(data){
  Game.dealHand(data.gameId, function(err, players, cards){
    players.forEach(function(player){
      var hand = cards.splice(0, 10);
      Io.sio.to(player).emit('deal-hand', {hand:hand});
    });
  });
};

// data = {gameId:'roomId of game'}
exports.drawQCard = function(data){
  Game.dealQuestion(data.gameId, function(err, players, qcard){
    players.forEach(function(player){
      Io.sio.to(player).emit('deal-question', {qcard:qcard});
    });
  });
};

exports.disconnect = function(){
  console.log('user disconnected');
};

