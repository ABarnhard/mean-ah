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

Deck.getCards = function(data, cb){
  var gameId = Mongo.ObjectID(data.gameId),
      filter = {};
  filter[data.cardType] = 1;
  Deck.collection.findOne({gameId:gameId}, filter, function(err, obj){
    var deck = Object.create(Deck.prototype);
        deck = _.extend(deck, obj);
    cb(err, deck);
  });
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

// data = {
//  gameId:'_id/roomId',
//  cardType:'questions/answers',
//  count:'num cards needed'
// }
Deck.deal = function(data, cb){
  Deck.getCards(data, function(err, d){
    var cards = d.draw(data);
    d.update(data, function(err, count){
      cb(err, cards);
    });
  });
};

Deck.prototype.draw = function(data){
  return this[data.cardType].splice(0, data.count * 1);
};

Deck.prototype.update = function(data, cb){
  var setField = {};
  setField[data.cardType] = this[data.cardType];
  Deck.collection.update({_id:this._id}, {$set:setField}, cb);
};

module.exports = Deck;

// Helper Functions
function filterAndShuffle(type, cards){
  cards = _.filter(cards, function(c){return c.cardType === type;});
  return _.shuffle(cards);
}
