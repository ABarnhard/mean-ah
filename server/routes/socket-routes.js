'use strict';

var sockets = require('../controllers/sockets');

module.exports = function(socket){
  global.sio = this;
  // console.log('user connected');

  socket.on('create-game',    sockets.createGame);
  socket.on('join-game',      sockets.joinGame);
  socket.on('start-game',     sockets.startGame);
  socket.on('leave-game',     sockets.leaveGame);
  socket.on('player-connect', sockets.playerConnect);
  socket.on('draw-hand',      sockets.drawHand);
  socket.on('start-round',    sockets.startRound);
  socket.on('disconnect',     sockets.disconnect);

};
