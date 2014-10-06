'use strict';

var Game = require('../models/game'),
    Io   = require('../models/io'),
    roomId;

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

exports.startGame = function(data){
  // console.log('socked recieved start-game');
  Game.start(data.gameId, function(err, count){
    Io.to(roomId).emit('game-start');
  });
};

exports.playerConnect = function(data, cb){
  roomId = data.roomId;
  this.join(roomId);
  this.join(data.player);
  cb();
};

// data = {gameId:'roomId of game'}
exports.drawHand = function(data, cb){
  Game.dealHand(data.gameId, function(err, players, cards){
    players.forEach(function(player){
      var hand = cards.splice(0, 10);
      Io.to(player).emit('deal-hand', {hand:hand});
    });
    if(cb){cb();}
  });
};

// data = {gameId:'roomId of game'}
exports.startRound = function(data){
  Game.startRound(data.gameId, function(err, round){
    Io.to(roomId).emit('round-start', {round:round});
  });
};

// data = {gameId:, player:}
exports.leaveGame = function(data, cb){
  var socket = this;
  Game.leave(data, function(err, player){
    socket.broadcast.to(roomId).emit('player-left', player);
    cb(err, player);
  });
};

// data = {gameId:'', play:{player:'', answers:[]}}
exports.playCards = function(data){
  console.log('sockets.playCards', data);
  var socket = this;
  data = JSON.parse(data);
  Game.makePlay(data, function(err, obj){
    socket.broadcast.to(roomId).emit('play-made', obj.player);
    if(obj.round){
      Io.to(obj.cardCzar).emit('answers-submitted', obj.round);
    }
  });
};

exports.disconnect = function(){
  console.log('user disconnected');
};

