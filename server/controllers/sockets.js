'use strict';

var Game = require('../models/game'),
    Io   = require('../models/io'),
    roomId;

exports.createGame = function(data, cb){
  var socket = this;
  data = JSON.parse(data);
  // console.log('raw in', data);
  Game.create(data, function(err, gameInfo){
    // console.log('gameInfo', gameInfo);
    roomId = gameInfo.roomId;
    socket.join(roomId);
    socket.join(data.player);
    cb(err, JSON.stringify({gameId:roomId}));
  });
};

exports.joinGame = function(data, cb){
  var socket = this;
  data = JSON.parse(data);
  // console.log('I Fired', 'socket.on join-game');
  Game.join(data, function(err, id){
    // console.log('I Fired', 'Game.join CB');
    if(!err){
      roomId = id;
      socket.join(roomId);
      socket.join(data.player);
      socket.broadcast.to(roomId).emit('player-joined', JSON.stringify({player:data.player}));
    }
    cb(err, JSON.stringify({gameId:id}));
  });
};

exports.startGame = function(data, cb){
  // console.log('socked recieved start-game');
  data = JSON.parse(data);
  Game.start(data.gameId, function(err, count){
    Io.to(roomId).emit('game-start');
    cb();
  });
};

exports.playerConnect = function(data, cb){
  data = JSON.parse(data);
  roomId = data.roomId;
  this.join(roomId);
  this.join(data.player);
  cb();
};

// data = {gameId:'roomId of game'}
exports.drawHand = function(data, cb){
  data = JSON.parse(data);
  Game.dealHand(data.gameId, function(err, players, cards){
    dealCards(players, cards, cb);
  });
};

// data = {gameId:'roomId of game'}
exports.startRound = function(data){
  data = JSON.parse(data);
  Game.startRound(data.gameId, function(err, round){
    Io.to(roomId).emit('round-start', JSON.stringify({round:round}));
  });
};

// data = {gameId:, player:}
exports.leaveGame = function(data, cb){
  var socket = this;
  data = JSON.parse(data);
  Game.leave(data, function(err, obj){
    console.log(obj);
    socket.broadcast.to(roomId).emit('player-left', JSON.stringify({player:obj.player}));
    if(obj.gameOver){
      Io.to(roomId).emit('game-over', JSON.stringify({gameData:obj.gameData}));
    }else if(obj.cardCzar){
      Io.to(roomId).emit('replace-czar', JSON.stringify({cardCzar:obj.cardCzar}));
    }
    socket.leave(roomId);
    if(cb){cb(err);}
  });
};

// data = {gameId:'', play:{player:'', answers:[{}]}}
exports.playCards = function(data){
  var socket = this;
  data = JSON.parse(data);
  Game.makePlay(data, function(err, obj){
    socket.broadcast.to(roomId).emit('play-made', JSON.stringify({player:obj.player}));
    if(obj.round){
      Io.to(roomId).emit('answers-submitted', JSON.stringify({round:obj.round, cardCzar:obj.cardCzar}));
    }
  });
};

// data = {gameId:'', winner:{player:'alias', answers:[{card obj(s)}]}, gameOver:}
exports.nextRound = function(data){
  // console.log('Next Round Fired');
  data = JSON.parse(data);
  Game.logWin(data.gameId, data.winner.player, function(err, count){
    // notify players of win, and end game if final round
    data.winner.gameOver = data.gameOver;
    Io.to(roomId).emit('winner', JSON.stringify(data.winner));
    // if game over, break;
    // TODO Add cleanup logic for deck
    if(data.gameOver){return;}
    Game.dealCards(data.gameId, function(err, players, cards, count){
      // deal players back up to 10 cards
      // doesn't include Card Czar in players array
      players.forEach(function(player){
        var newCards = cards.splice(0, count);
        Io.to(player).emit('deal-cards', JSON.stringify({cards:newCards}));
      });
      // Assing a new Card Czar
      Game.nextCzar(data.gameId, function(err, cardCzar){
        Io.to(roomId).emit('new-czar', JSON.stringify({cardCzar:cardCzar}));
        // Start next Round
        Game.startRound(data.gameId, function(err, round){
          Io.to(roomId).emit('round-start', JSON.stringify({round:round}));
        });
      });
    });
  });
};

// data = {gameId:id, player:$scope.alias};
exports.tallyVote = function(data){
  var socket = this;
  data = JSON.parse(data);
  Game.logVote(data.gameId, data.player, function(err, gameState){
    if(gameState.forceQuit){
      exports.leaveGame.call(socket, JSON.stringify(data));
    }else{
      socket.broadcast.to(roomId).emit('player-voted', JSON.stringify({player:data.player}));
      if(gameState.gameOver){
        Game.dealHand(data.gameId, function(err, players, cards){
          dealCards(players, cards, function(){
            Game.finalRound(data.gameId, function(err, round){
              Io.to(roomId).emit('final-round-start', JSON.stringify({round:round}));
            });
          });
        });
      }
    }
  });
};

exports.disconnect = function(){
  console.log('user disconnected');
};

// HELPER FUNCTIONS
function dealCards(players, cards, cb){
  players.forEach(function(player){
    var hand = cards.splice(0, 10);
    Io.to(player).emit('deal-hand', JSON.stringify({hand:hand}));
  });
  if(cb){cb();}
}
