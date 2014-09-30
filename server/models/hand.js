'use strict';

var Mongo = require('mongodb');

function Hand(o){
  this.gameId  = Mongo.ObjectID(o.gameId);
  this.qcard   = o.qcard;
  this.answers = [];
}

Object.defineProperty(Hand, 'collection', {
  get: function(){return global.mongodb.collection('hands');}
});

// data.gameId = string representing the _id of a game
// data.qcard = the question card that was drawn for the hand (full object)
Hand.create = function(data, cb){
  var h = new Hand(data);
  Hand.collection.save(h, cb);
};

Hand.findOne = function(gameId, cb){
  var id = Mongo.ObjectID(gameId);
  Hand.collection.findOne({gameId:id}, cb);
};

module.exports = Hand;

