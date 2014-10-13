/* global describe, before, beforeEach, it */

'use strict';

process.env.DB   = 'mean-ah-test';

var expect  = require('chai').expect,
    cp      = require('child_process'),
    app     = require('../../server/index'),
    cookie  = null,
    request = require('supertest');

describe('users', function(){
  before(function(done){
    request(app).get('/').end(done);
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [process.env.DB], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      request(app)
      .post('/login')
      .send('email=bob@aol.com')
      .send('password=1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'][0];
        done();
      });
    });
  });

  describe('get /games', function(){
    it('should return a JSON object of open games', function(done){
      request(app)
      .get('/games')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('"roomId":"200000000000000000000001"');
        done();
      });
    });
  });

  describe('get /games/:id', function(){
    it('should return a JSON object of a specific game', function(done){
      request(app)
      .get('/games/200000000000000000000001')
      .set('cookie', cookie)
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.text).to.include('"roomId":"200000000000000000000001"');
        done();
      });
    });
  });

});

