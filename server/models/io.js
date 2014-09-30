'use strict';

function Io(){
}

Object.defineProperty(Io, 'sio', {
  get: function(){return global.sio;}
});

Object.defineProperty(Io, 'to', {
  get: function(){return global.sio.to;}
});

module.exports = Io;
