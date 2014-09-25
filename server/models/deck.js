'use strict';

var Mongo = require('mongodb'),
    Card  = require('./card');

function Deck(gameId, cards){
}

Object.defineProperty(Deck, 'collection', {
  get: function(){return global.mongodb.collection('decks');}
});

Deck.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Deck.collection.findOne({_id:_id}, cb);
};

Deck.create = function(data, cb){
  Card.getCards(data.deck, function(err, cards){
    var d = new Deck(data.gameId, cards);
    Deck.collection.save(d, cb);
  });
};

module.exports = Deck;

