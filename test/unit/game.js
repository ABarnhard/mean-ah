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
        expect(g.name).to.equal('Test Game');
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

});

/*
  describe('', function(){
    it('', function(done){});
  });
*/
