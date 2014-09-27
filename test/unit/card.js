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

  describe('constructor', function(){
    it('should create a new User object', function(){
      var c = new Card();
      expect(c).to.be.instanceof(Card);
    });
  });
});

