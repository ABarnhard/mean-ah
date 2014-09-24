'use strict';

var Game = require('../models/game');

exports.index = function(req, res){
  Game.findAllOpen(function(err, games){
    res.send({games:games});
  });
};

exports.show = function(req, res){
  Game.findById(req.params.id, function(err, game){
    res.send({game:game});
  });
};
