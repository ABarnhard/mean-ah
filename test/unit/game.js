/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    Game      = require('../../server/models/game'),
    dbConnect = require('../../server/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'mean-ah-test';

describe('Game', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      // console.log(err, stdout, stderr);
      done();
    });
  });

  describe('.findById', function(){
    it('should find a game by it\'s ID', function(done){
      Game.findById('200000000000000000000001', function(err, g){
        expect(g).to.be.ok;
        expect(g.name).to.equal('Game 1');
        done();
      });
    });
  });

  describe('.findAllOpen', function(){
    it('should return all open games', function(done){
      Game.findAllOpen(function(err, games){
        expect(games).to.have.length(1);
        done();
      });
    });
  });

  describe('.create', function(){
    it('should create a new game', function(done){
      var data = {name:'test', player:'player', decks:['base']};
      Game.create(data, function(err, gameInfo){
        expect(Object.keys(gameInfo)).to.have.length(2);
        expect(gameInfo.decks).to.have.length(1);
        done();
      });
    });
  });

  describe('.join', function(){
    it('should add another player to the game', function(done){
      var id = '200000000000000000000001',
          data = {gameId:id, player:'NewPlayer'};
      Game.join(data, function(err, gameInfo){
        Game.findById(id, function(err, g){
          expect(g.players).to.have.length(3);
          expect(g.players[2]).to.equal('NewPlayer');
          done();
        });
      });
    });
  });

  describe('.load', function(){
    it('should load game (open and waiting)', function(done){
      var data = {id:'200000000000000000000001', alias:'bob'};
      Game.load(data, function(err, g){
        expect(g.players).to.have.length(1);
        done();
      });
    });
    it('should initialize a new game', function(done){
      var data = {id:'200000000000000000000003', alias:'bob'};
      Game.load(data, function(err, g){
        expect(g.status).to.equal('open');
        expect(g.isOpen).to.equal(true);
        done();
      });
    });
    it('should return an error from a completed game', function(done){
      var data = {id:'200000000000000000000004', alias:'bob'};
      Game.load(data, function(err, g){
        expect(err).to.be.ok;
        expect(g).to.be.not.ok;
        done();
      });
    });
  });

  describe('.start', function(){
    it('should begin a game and set it to closed', function(done){
      var id = '200000000000000000000001';
      Game.start(id, function(err, count){
        Game.findById(id, function(err, g){
          expect(g.status).to.equal('in-progress');
          expect(g.isOpen).to.equal(false);
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
