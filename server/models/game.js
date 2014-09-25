'use strict';

var Mongo  = require('mongodb'),
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
  // console.log(g);
  Game.collection.save(g, function(err, count){
    cb(err, g.roomId);
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

module.exports = Game;

