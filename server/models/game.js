'use strict';

var Mongo  = require('mongodb'),
    Deck   = require('./deck'),
    Hand   = require('./hand'),
    _      = require('underscore');

function Game(o){
  this._id      = Mongo.ObjectID();
  this.roomId   = this._id.toString();
  this.name     = o.name;
  this.owner    = o.player;
  this.cardCzar = o.player;
  this.players  = [o.player];
  this.decks    = o.decks;
  this.status   = 'new';
  this.isOpen   = false;
  this.handNum  = 0;
}

Object.defineProperty(Game, 'collection', {
  get: function(){return global.mongodb.collection('games');}
});

Game.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Game.collection.findOne({_id:_id}, cb);
};

Game.getPlayers = function(id, cb){
  var _id = Mongo.ObjectID(id);
  Game.collection.findOne({_id:_id}, {players:1}, function(err, obj){
    cb(err, obj.players);
  });
};

Game.incHandNum = function(gameId, cb){
  var id = Mongo.ObjectID(gameId);
  Game.collection.update({_id:id}, {$inc:{handNum:1}}, cb);
};

Game.findAllOpen = function(cb){
  Game.collection.find({isOpen:true}).toArray(cb);
};

Game.create = function(data, cb){
  var g = new Game(data);
  // console.log(g);
  Game.collection.save(g, function(err, count){
    var gameInfo = {roomId:g.roomId, decks:g.decks};
    Deck.create(gameInfo, function(err, deck){
      cb(err, gameInfo);
    });
  });
};

Game.join = function(data, cb){
  // console.log('Game.join Model Raw Data', data);
  var id = Mongo.ObjectID(data.gameId);
  Game.collection.findAndModify({_id:id, isOpen:true}, [], {$set:{isOpen:false}}, function(err, g){
    if(!g){return cb('ERROR: Requested Game Not Found');}
    g.players.push(data.player);
    g.isOpen = g.players.length < 7;
    Game.collection.save(g, function(err, count){
      cb(err, g.roomId);
    });
  });
};

Game.load = function(data, cb){
  Game.findById(data.id, function(err, g){

    if(g.status === 'new'){
      // open a new game so other users can join
      if(data.alias === g.owner){
        g.status = 'open';
        g.isOpen = true;
        Game.collection.save(g, function(err, count){
          // remove user from games player list
          g.players = _.reject(g.players, function(player){return player === data.alias;});
          cb(err, g);
        });
       }
     }else if(g.status === 'done'){
      // reject requests for ended games, trigger to clear localForage cache
      cb('ERROR: Requested Game has ended');
     }else{
      // all is good, load game data
      // remove user from games player list
      g.players = _.reject(g.players, function(player){return player === data.alias;});
      cb(err, g);
     }
  });
};

Game.start = function(gameId, cb){
  var id = Mongo.ObjectID(gameId);
  Game.collection.update({_id:id}, {$set:{isOpen:false, status:'in-progress'}}, cb);
};

Game.dealHand = function(gameId, cb){
  Game.getPlayers(gameId, function(err, players){
    var count = players.length * 10,
        data = {
          gameId:gameId,
          cardType:'answers',
          count:count
        };
    Deck.deal(data, function(err, cards){
      cb(err, players, cards);
    });
  });
};

Game.dealQuestion = function(gameId, cb){
  Game.getPlayers(gameId, function(err, players){
    var data = {
          gameId:gameId,
          cardType:'questions',
          count:1
        };
    Deck.deal(data, function(err, cards){
      Game.incHandNum(gameId, function(err, recordsUpdated){
        var obj = {gameId:gameId, qcard:cards[0]};
        Hand.create(obj, function(err, hand){
          cb(err, players, cards[0]);
        });
      });
    });
  });
};

module.exports = Game;

