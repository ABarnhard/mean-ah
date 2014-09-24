'use strict';

var Mongo  = require('mongodb');

function Game(o){
  this._id    = Mongo.ObjectID();
  this.roomId = this._id.toString();
  this.name   = o.name;
  this.owner  = o.player;
  this.cardCzar = o.player;
  this.players = [o.player];
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
  console.log(g);
  Game.collection.save(g, function(err, count){
    cb(err, g.roomId);
  });
};

Game.join = function(data, cb){
  console.log('Game.join Model Raw Data', data);
  Game.findById(data.gameId, function(err, g){
    g.players.push(data.player);
    Game.collection.save(g, function(err, count){
      console.log('Game.join Model Game', g);
      cb(err, g.roomId);
    });
  });
};

module.exports = Game;

