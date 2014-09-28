'use strict';

var Mongo = require('mongodb'),
    Card  = require('./card'),
    _     = require('underscore');

function Deck(gameId, cards){
  this.gameId    = Mongo.ObjectID(gameId);
  this.questions = filterAndShuffle('Q', cards);
  this.answers   = filterAndShuffle('A', cards);
}

Object.defineProperty(Deck, 'collection', {
  get: function(){return global.mongodb.collection('decks');}
});

Deck.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Deck.collection.findOne({_id:_id}, cb);
};

Deck.findByGameId = function(gameId, cb){
  gameId = Mongo.ObjectID(gameId);
  Deck.collection.findOne({gameId:gameId}, cb);
};

Deck.create = function(data, cb){
  Card.getCards(data.decks, function(err, cards){
    var d = new Deck(data.roomId, cards);
    Deck.collection.save(d, cb);
  });
};

Deck.remove = function(gameId, cb){
  var id = Mongo.ObjectID(gameId);
  Deck.collection.remove({gameId:id}, cb);
};

Deck.draw = function(data, cb){
};

module.exports = Deck;

// Helper Functions
function filterAndShuffle(type, cards){
  cards = _.filter(cards, function(c){return c.cardType === type;});
  return _.shuffle(cards);
}
