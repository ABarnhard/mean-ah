'use strict';

function Card(){
}

Object.defineProperty(Card, 'collection', {
  get: function(){return global.mongodb.collection('cards');}
});

Card.getCards = function(expansions, cb){
  Card.collection.find({expansion:{$in:expansions}}).toArray(cb);
};

module.exports = Card;

