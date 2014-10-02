'use strict';

function Io(){
}

Object.defineProperty(Io, 'sio', {
  get: function(){return global.sio;}
});

Io.to = function(roomId){
  return Io.sio.to(roomId);
};

module.exports = Io;
