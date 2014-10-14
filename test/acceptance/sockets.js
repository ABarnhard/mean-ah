/* global describe, before, beforeEach, it */

'use strict';

process.env.DB = 'mean-ah-test';

var expect    = require('chai').expect,
    cp        = require('child_process'),
    app       = require('../../server/index'),
    io        = require('socket.io-client'),
    cookie    = null,
    request   = require('supertest'),
    socketUrl = 'http://192.168.200.201:',
    options   = {transports: ['websocket'], 'force new connection': true};

describe('sockets', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app).get('/').end(function(err, res){
        socketUrl += app.address().port;
        done();
      });
      /*
      request(app)
      .post('/login')
      .send('email=bob@aol.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
      */
    });
  });

  describe('event create-game', function(){
    it('should create a new game and return that games id', function(done){
      var client = io.connect(socketUrl, options),
          json   = '{"name":"Game","player":"Player1","decks":["base"]}';
      client.on('connect', function(data){
        client.emit('create-game', json, function(err, retJson){
          var data = JSON.parse(retJson);
          expect(data.gameId).to.be.ok;
          done();
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
