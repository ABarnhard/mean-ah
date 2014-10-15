/* global describe, before, beforeEach, it */

'use strict';

process.env.DB = 'mean-ah-test';

var expect    = require('chai').expect,
    cp        = require('child_process'),
    app       = require('../../server/index'),
    io        = require('socket.io-client'),
    request   = require('supertest'),
    socketUrl = 'http://localhost:',
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
          console.log(app.address());
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

  describe('event player-connect', function(){
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

  describe('event join-game', function(){
    it('should alert everone in game room that another player joined', function(done){
      var client1 = io.connect(socketUrl, options),
          json1   = '{"gameId":"200000000000000000000001", "player":"bob"}';

      client1.on('connect', function(data){

        client1.on('player-joined', function(data){
          data = JSON.parse(data);
          expect(data.player).to.equal('bob');
          client1.disconnect();
          done();
        });

        client1.emit('player-connect', json1, function(err, roomId){
          var json2 = '{"gameId":"200000000000000000000001", "player":"bob"}',
              client2 = io.connect(socketUrl, options);
          client2.on('connect', function(data){
            client2.emit('join-game', json2, function(err, data){
              data = JSON.parse(data);
              expect(data.gameId).to.equal('200000000000000000000001');
              client2.disconnect();
            });
          });
        });
      });

    });
  });

  describe('event start-game', function(){
    it('should alert all users that game has begun', function(done){
      var client1 = io.connect(socketUrl, options),
          json1   = '{"gameId":"200000000000000000000001", "player":"bob"}',
          json2   = '{"gameId":"200000000000000000000001"}';

      client1.on('connect', function(data){
        client1.on('game-start', function(){
          done();
        });

        client1.emit('join-game', json1, function(){
          client1.emit('start-game', json2, function(){
            // do nothing
          });
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
