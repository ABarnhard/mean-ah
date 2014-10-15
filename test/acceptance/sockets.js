/* global describe, before, beforeEach, it */

'use strict';

process.env.DB = 'mean-ah-test';

var expect    = require('chai').expect,
    cp        = require('child_process'),
    app       = require('../../server/index'),
    io        = require('socket.io-client'),
    request   = require('supertest'),
    socketUrl = 'http://192.168.200.201:',
    portFound = false,
    options   = {transports: ['websocket'], 'force new connection': true};

describe('sockets', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app).get('/').end(function(err, res){
        if(!portFound){
          socketUrl += app.address().port;
          portFound = true;
        }
        done();
      });
    });
  });

  describe('event create-game', function(){
    it('should create a new game and return that games id', function(done){
      var client = io.connect(socketUrl, options),
          json   = '{"name":"Game","player":"Player1","decks":["base"]}';
      client.on('connect', function(data){
        client.emit('create-game', json, function(err, retJson){
          var data = JSON.parse(retJson);
          expect(typeof data.gameId).to.equal('string');
          client.disconnect();
          done();
        });
      });
    });
  });

  describe('player-connect', function(){
    it('Should add the player to the game room', function(done){
      var client1 = io.connect(socketUrl, options),
          json   = '{"gameId":"200000000000000000000001", "player":"john"}';
      client1.on('connect', function(data){
        client1.emit('player-connect', json, function(err, roomId){
          expect(roomId).to.equal('200000000000000000000001');
          client1.disconnect();
          done();
        });
        client1.on('confirm-connect', function(data){
          expect(data).to.equal('200000000000000000000001');
        });
      });
    });
  });

});

/*
  describe('', function(){
    it('', function(done){});
  });

*/
