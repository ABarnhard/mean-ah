'use strict';

var Game = require('../models/game');

exports.index = function(req, res){
  Game.findAllOpen(function(err, games){
    res.send({games:games});
  });
};
