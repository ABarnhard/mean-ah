'use strict';

var Mongo = require('mongodb'),
    Card  = require('./card'),
    _     = require('underscore');

function Deck(gameId, cards){
  this.gameId = Mongo.ObjectID(gameId);
  this.questions = filter('Q', cards);
  this.answers = filter('A', cards);
}

Object.defineProperty(Deck, 'collection', {
  get: function(){return global.mongodb.collection('decks');}
});

Deck.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Deck.collection.findOne({_id:_id}, cb);
};

Deck.create = function(data, cb){
  Card.getCards(data.decks, function(err, cards){
    var d = new Deck(data.roomId, cards);
    Deck.collection.save(d, cb);
  });
};

module.exports = Deck;

// Helper Functions
function filter(type, cards){
  return _.filter(cards, function(c){return c.cardType === type;});
}
