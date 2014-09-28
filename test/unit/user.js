/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    User      = require('../../server/models/user'),
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
      done();
    });
  });

  describe('constructor', function(){
    it('should create a new User object', function(){
      var u = new User();
      expect(u).to.be.instanceof(User);
    });
  });

  describe('.findById', function(){
    it('should find a user object in database', function(done){
      User.findById('000000000000000000000002', function(err, u){
        expect(u.alias).to.equal('sue');
        done();
      });
    });
  });

  describe('.register', function(){
    it('should create a new user in the database', function(done){
      var obj = {alias: 'Test', email:'a@b.com', password:'1234'};
      User.register(obj, function(err, u){
        expect(u).to.be.ok;
        expect(u._id).to.be.instanceof(Mongo.ObjectID);
        done();
      });
    });
  });

  describe('.login', function(){
    it('should log a user in (valid info)', function(done){
      var obj = {email:'bob@aol.com', password:'1234'};
      User.login(obj, function(err, u){
        expect(u).to.be.ok;
        done();
      });
    });
    it('should not log a user in (wrong password)', function(done){
      var obj = {email:'bob@aol.com', password:'1238'};
      User.login(obj, function(err, u){
        expect(u).to.not.be.ok;
        done();
      });
    });
  });

});

