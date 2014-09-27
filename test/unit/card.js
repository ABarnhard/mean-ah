/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    Card      = require('../../server/models/card'),
    dbConnect = require('../../server/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'mean-ah-test';

describe('Card', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      console.log(err, stdout, stderr);
      done();
    });
  });

  describe('.getCards', function(){
    it('should return an array of cards from selected deck', function(done){
      Card.getCards(['base'], function(err, cards){
        expect(cards).to.have.length(4);
        done();
      });
    });
  });

});

