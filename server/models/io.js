'use strict';

function Io(){
}

Object.defineProperty(Io, 'sio', {
  get: function(){return global.sio;}
});

module.exports = Io;
