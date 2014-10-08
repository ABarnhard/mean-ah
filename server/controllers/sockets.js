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
      socket.broadcast.to(roomId).emit('player-joined', {player:data.player});
    }
    cb(err, id);
  });
};

exports.startGame = function(data, cb){
  // console.log('socked recieved start-game');
  Game.start(data.gameId, function(err, count){
    Io.to(roomId).emit('game-start');
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
  Game.leave(data, function(err, obj){
    socket.leave(roomId);
    socket.broadcast.to(roomId).emit('player-left', {player:obj.player});
    if(obj.gameOver){
      Io.to(roomId).emit('game-over', {gameData:obj.gameData});
    }else if(obj.cardCzar){
      Io.to(roomId).emit('replace-czar', {cardCzar:obj.cardCzar});
    }
    cb(err);
  });
};

// data = {gameId:'', play:{player:'', answers:[]}}
exports.playCards = function(data){
  var socket = this;
  data = JSON.parse(data);
  Game.makePlay(data, function(err, obj){
    socket.broadcast.to(roomId).emit('play-made', {player:obj.player});
    if(obj.round){
      Io.to(obj.cardCzar).emit('answers-submitted', {round:obj.round});
    }
  });
};

// data = {gameId:'', winner:{player:'alias', answers:[{card obj(s)}]}}
exports.nextRound = function(data){
  console.log('Next Round Fired');
  data = JSON.parse(data);
  Game.logWin(data.gameId, data.winner.player, function(err, count){
    // notify players of win
    Io.to(roomId).emit('winner', data.winner);
    Game.dealCards(data.gameId, function(err, players, cards, count){
      // deal players back up to 10 cards
      // doesn't include Card Czar in players array
      players.forEach(function(player){
        var newCards = cards.splice(0, count);
        Io.to(player).emit('deal-cards', {cards:newCards});
      });
      // Assing a new Card Czar
      Game.nextCzar(data.gameId, function(err, cardCzar){
        Io.to(roomId).emit('new-czar', {cardCzar:cardCzar});
        // Start next Round
        Game.startRound(data.gameId, function(err, round){
          Io.to(roomId).emit('round-start', {round:round});
        });
      });
    });
  });
};

exports.disconnect = function(){
  console.log('user disconnected');
};

