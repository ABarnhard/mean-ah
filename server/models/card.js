'use strict';

function Card(){
}

Object.defineProperty(Card, 'collection', {
  get: function(){return global.mongodb.collection('cards');}
});

Card.getCards = function(expansions, cb){
  Card.collection.find({expansion:{$in:expansions}}).toArray(cb);
};

Card.getFinalQCard = function(cb){
  // Set id of the final card
  var makeAHaikuId = 533;
  Card.collection.findOne({id:makeAHaikuId}, cb);
};

module.exports = Card;

