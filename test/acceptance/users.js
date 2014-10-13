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

  describe('post /register', function(){
    it('should return an alias in the res header', function(done){
      request(app)
      .post('/register')
      .send('alias=jhon&email=john%40gmail.com&password=1234')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.headers['x-authenticated-user']).to.equal('jhon');
        done();
      });
    });
    it('should return a 400 error(duplicate email in system)', function(done){
      request(app)
      .post('/register')
      .send('email=bob%40aol.com&password=1234')
      .end(function(err, res){
        expect(res.status).to.equal(400);
        done();
      });
    });
  });

  describe('post /login', function(){
    it('should return the user alias in the headers', function(done){
      request(app)
      .post('/login')
      .send('email=bob%40aol.com&password=1234')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.headers['x-authenticated-user']).to.equal('bob');
        done();
      });
    });
    it('should return a 401 error (incorrect credentials)', function(done){
      request(app)
      .post('/login')
      .send('email=bob%40aol.com&password=12345')
      .end(function(err, res){
        expect(res.status).to.equal(401);
        done();
      });
    });
  });

  describe('bounce (redirect  /login)', function(){
    it('should return a 401 error if cookie isn\'t set', function(done){
      request(app)
      .post('/logout')
      .send('_method=delete')
      .end(function(err, res){
        expect(res.status).to.equal(401);
        done();
      });
    });
  });

  describe('delete /logout', function(){
    it('should return an anonymous alias in header', function(done){
      request(app)
      .post('/logout')
      .set('cookie', cookie)
      .send('_method=delete')
      .end(function(err, res){
        expect(res.status).to.equal(200);
        expect(res.headers['x-authenticated-user']).to.equal('anonymous');
        done();
      });
    });
  });

});

