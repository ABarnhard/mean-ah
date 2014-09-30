/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    Hand      = require('../../server/models/hand'),
    Mongo     = require('mongodb'),
    dbConnect = require('../../server/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'mean-ah-test';

describe('Hand', function(){
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

  describe('.create', function(){
    it('should create a new hand object', function(done){
      var obj = {gameId:'200000000000000000000002'};
      obj.qcard = {_id: Mongo.ObjectID('100000000000000000000012'), id:12, cardType:'Q', text:'What\'s a girl\'s best friend?', numAnswers:1, expansion: 'base'};
      Hand.create(obj, function(err, hand){
        expect(hand.gameId).to.be.instanceof(Mongo.ObjectID);
        expect(hand.qcard.id).to.equal(12);
        expect(hand.answers).to.have.length(0);
        done();
      });
    });
  });

});

