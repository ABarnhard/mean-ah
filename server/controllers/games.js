'use strict';

var Game = require('../models/game');

exports.index = function(req, res){
  Game.findAllOpen(function(err, games){
    res.send({games:games});
  });
};

exports.show = function(req, res){
  req.params.alias = req.user.alias;
  Game.load(req.params, function(err, game){
    res.send({game:game});
  });
};

