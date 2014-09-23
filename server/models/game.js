'use strict';

var Mongo  = require('mongodb');

function Game(){
}

Object.defineProperty(Game, 'collection', {
  get: function(){return global.mongodb.collection('games');}
});

Game.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Game.collection.findOne({_id:_id}, cb);
};

Game.findAllOpen = function(cb){
  Game.collection.find({isOpen:true}).toArray(cb);
};

module.exports = Game;

