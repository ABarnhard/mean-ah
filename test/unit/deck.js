/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    Deck      = require('../../server/models/deck'),
    Mongo     = require('mongodb'),
    dbConnect = require('../../server/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'mean-ah-test';

describe('User', function(){
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
    it('should find a deck by it\'s ID', function(done){
      Deck.findById('300000000000000000000002', function(err, d){
        expect(d).to.be.ok;
        expect(d.questions[0].id).to.equal(14);
        done();
      });
    });
  });

  describe('.create', function(){
    it('should create a new game deck', function(done){
      var data = {decks:['base'], roomId:'200000000000000000000001'};
      Deck.create(data, function(err, d){
        expect(d.gameId).to.be.instanceof(Mongo.ObjectID);
        expect(d.questions).to.have.length(2);
        expect(d.answers).to.have.length(2);
        done();
      });
    });
  });

});

