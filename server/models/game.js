'use strict';

var Mongo  = require('mongodb');

function Game(o){
  this._id    = Mongo.ObjectID();
  this.roomId = this._id.toString();
  this.name   = o.name;
  this.owner  = o.owner;
  this.cardCzar = o.owner;
  this.players = [o.owner];
  this.decks = o.decks;
  this.dealtQs = [];
  this.dealtAs = [];
  this.isOpen = true;
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

Game.create = function(data, cb){
  var g = new Game(data);
  Game.collection.save(g, function(err, count){
    cb(err, g);
  });
};

Game.join = function(data, cb){
  console.log(data);
  Game.findById(data.gameId, function(err, game){
    game.players.push(data.player);
    Game.collection.save(game, function(err, count){
      cb(err, game);
    });
  });
};

module.exports = Game;

