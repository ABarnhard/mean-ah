'use strict';

var Game = require('../models/game'),
    Deck = require('../models/deck'),
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
    Deck.create(gameInfo, function(err, deck){
      roomId = gameInfo.roomId;
      socket.join(roomId);
      socket.join(data.player);
      cb(err, roomId);
    });
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

exports.startGame = function(data){
  // console.log('socked recieved start-game');
  Game.start(data.gameId, function(err, count){
    Io.sio.to(roomId).emit('game-start');
  });
};

exports.playerConnect = function(data, cb){
  roomId = data.roomId;
  this.join(roomId);
  this.join(data.player);
  cb();
};

exports.disconnect = function(){
  console.log('user disconnected');
};

