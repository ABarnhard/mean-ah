'use strict';

var User = require('../models/user');

exports.register = function(req, res){
  User.register(req.body, function(err, user){
    if(user){
      logUserIn(user, req, res);
    }else{
      res.status(400).end();
    }
  });
};

exports.login = function(req, res){
  User.login(req.body, function(err, user){
    if(user){
      logUserIn(user, req, res);
    }else{
      res.status(401).end();
    }
  });
};

exports.logout = function(req, res){
  req.session.destroy(function(){
    res.setHeader('X-Authenticated-User', 'anonymous');
    res.status(200).end();
  });
};

// HELPER FUNCTIONS
function logUserIn(user, req, res){
  req.session.regenerate(function(){
    req.session.userId = user._id;
    req.session.save(function(){
      res.setHeader('X-Authenticated-User', user.alias);
      res.status(200).end();
    });
  });
}

