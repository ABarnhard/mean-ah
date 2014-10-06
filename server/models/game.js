'use strict';

var Mongo  = require('mongodb'),
    Deck   = require('./deck'),
    _      = require('underscore');

function Game(o){
  this._id        = Mongo.ObjectID();
  this.roomId     = this._id.toString();
  this.name       = o.name;
  this.owner      = o.player;
  this.cardCzar   = o.player;
  this.players    = [o.player];
  this.decks      = o.decks;
  this.status     = 'new';
  this.isOpen     = false;
  this.roundNum   = 0;
  this.round      = {};
  this.lastUpdate = null;
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
    var gameInfo = {roomId:g.roomId, decks:g.decks};
    Deck.create(gameInfo, function(err, deck){
      cb(err, gameInfo);
    });
  });
};

Game.join = function(data, cb){
  Game.findForUpdate(data.gameId, function(err, g){
    if(!g){return cb('ERROR: Requested game is closed');}
    g.players.push(data.player);
    g.isOpen = g.players.length < 7;
    Game.lastUpdate(g._id, function(err, timeStamp){
      if(g.lastUpdate === timeStamp){
        g.save(function(err, count){
          cb(err, g.roomId);
        });
      }else{
        Game.join(data, cb);
      }
    });
  });
};

Game.leave = function(data, cb){
  Game.findForUpdate(data.gameId, function(err, game){
    game.players = _.reject(game.players, function(player){return player === data.player;});
    if(game.round.answers){
      game.round.answers = _.reject(game.round.answers, function(ans){return ans.player === data.player;});
    }
    Game.lastUpdate(game._id, function(err, timeStamp){
      if(game.lastUpdate === timeStamp){
        game.save(function(err, count){
          cb(err, data.player);
        });
      }else{
        Game.leave(data, cb);
      }
    });
  });
};

Game.startRound = function(id, cb){
  Game.findForUpdate(id, function(err, game){
    var data = {gameId:id, cardType:'questions', count:1};
    Deck.deal(data, function(err, cards){
      game.round = {qcard:cards[0], answers:[]};
      game.roundNum += 1;
      Game.lastUpdate(game._id, function(err, timeStamp){
        if(game.lastUpdate === timeStamp){
          game.save(function(err, count){
            cb(err, game.round);
          });
        }else{
          Game.startRound(id, cb);
        }
      });
    });
  });
};

Game.makePlay = function(data, cb){
  // console.log('game.makePlay', data);
  Game.findForUpdate(data.gameId, function(err, game){
    game.round.answers.push(data.play);
    Game.lastUpdate(data.gameId, function(err, timeStamp){
      if(game.lastUpdate === timeStamp){
        game.updateRound(data.play, function(err, count){
          var obj = {player:data.play.player};
          if((game.players.length - 1) === game.round.answers.length){
            obj.round = game.round;
            obj.cardCzar = game.cardCzar;
          }
          cb(err, obj);
        });
      }else{
        Game.makePlay(data, cb);
      }
    });
  });
};

Game.nextCzar = function(gameId, cb){
  Game.findForUpdate(gameId, function(err, game){
    var index = game.players.indexOf(game.cardCzar);
    index = (index + 1) < game.players.length ? (index + 1) : 0;
    game.cardCzar = game.players[index];
    Game.lastUpdate(gameId, function(err, timeStamp){
      if(game.lastUpdate === timeStamp){
        game.save(function(err, count){
          cb(err, game.cardCzar);
        });
      }else{
        Game.nextCzar(gameId, cb);
      }
    });
  });
};

Game.findForUpdate = function(id, cb){
  var timeStamp = new Date().valueOf(),
      _id = mongofy(id);

  Game.collection.findAndModify({_id:_id}, [['_id', 1]], {$set:{lastUpdate:timeStamp}}, {new:true}, function(err, obj){
    var game = reproto(Game.prototype, obj);
    cb(err, game);
  });
};

Game.lastUpdate = function(id, cb){
  id = mongofy(id);
  Game.collection.findOne({_id:id}, {fields:{lastUpdate:1}}, function(err, obj){
    var timeStamp = obj ? obj.lastUpdate : null;
    cb(err, timeStamp);
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
      // remove user from the games player list so they are not displayed on screen
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

Game.getPlayers = function(id, cb){
  var _id = mongofy(id);
  Game.collection.findOne({_id:_id}, {players:1}, function(err, obj){
    cb(err, obj.players);
  });
};

Game.prototype.save = function(cb){
  Game.collection.save(this, cb);
};

Game.prototype.updateRound = function(play, cb){
  var round = {};
  round['round.answers'] = play;
  Game.collection.update({_id:this._id}, {$push: round}, cb);
};

module.exports = Game;

// HELPER FUNCTIONS

function reproto(proto, obj){
  var tempObj = Object.create(proto);
  return _.extend(tempObj, obj);
}

function mongofy(id){
  id = (typeof id === 'string') ? Mongo.ObjectID(id) : id;
  return id;
}
