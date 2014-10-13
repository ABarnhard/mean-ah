/* jshint expr:true */
/* global describe, it, before, beforeEach */

'use strict';

var expect    = require('chai').expect,
    Game      = require('../../server/models/game'),
    Deck      = require('../../server/models/deck'),
    dbConnect = require('../../server/lib/mongodb'),
    cp        = require('child_process'),
    db        = 'mean-ah-test';

describe('Game', function(){
  before(function(done){
    dbConnect(db, function(){
      done();
    });
  });

  beforeEach(function(done){
    cp.execFile(__dirname + '/../scripts/clean-db.sh', [db], {cwd:__dirname + '/../scripts'}, function(err, stdout, stderr){
      // console.log(err, stdout, stderr);
      done();
    });
  });

  describe('.findById', function(){
    it('should find a game by it\'s ID', function(done){
      Game.findById('200000000000000000000001', function(err, g){
        expect(g).to.be.ok;
        expect(g.name).to.equal('Game 1');
        done();
      });
    });
  });

  describe('.findAllOpen', function(){
    it('should return all open games', function(done){
      Game.findAllOpen(function(err, games){
        expect(games).to.have.length(1);
        done();
      });
    });
  });

  describe('.create', function(){
    it('should create a new game', function(done){
      var data = {name:'test', player:'player', decks:['base']};
      Game.create(data, function(err, gameInfo){
        expect(Object.keys(gameInfo)).to.have.length(2);
        expect(gameInfo.decks).to.have.length(1);
        done();
      });
    });
  });

  describe('.join', function(){
    it('should add another player to the game', function(done){
      var id = '200000000000000000000001',
          data = {gameId:id, player:'NewPlayer'};
      Game.join(data, function(err, gameInfo){
        Game.findById(id, function(err, g){
          expect(g.players).to.have.length(3);
          expect(g.players[2]).to.equal('NewPlayer');
          done();
        });
      });
    });
  });

  describe('.load', function(){
    it('should load game (open and waiting)', function(done){
      var data = {id:'200000000000000000000001', alias:'bob'};
      Game.load(data, function(err, g){
        expect(g.players).to.have.length(1);
        done();
      });
    });
    it('should initialize a new game', function(done){
      var data = {id:'200000000000000000000003', alias:'bob'};
      Game.load(data, function(err, g){
        expect(g.status).to.equal('open');
        expect(g.isOpen).to.equal(true);
        done();
      });
    });
    it('should return an error from a completed game', function(done){
      var data = {id:'200000000000000000000004', alias:'bob'};
      Game.load(data, function(err, g){
        expect(err).to.be.ok;
        expect(g).to.be.not.ok;
        done();
      });
    });
  });

  describe('.start', function(){
    it('should begin a game and set it to closed', function(done){
      var id = '200000000000000000000001';
      Game.start(id, function(err, count){
        Game.findById(id, function(err, g){
          expect(g.status).to.equal('in-progress');
          expect(g.isOpen).to.equal(false);
          done();
        });
      });
    });
  });

  describe('.startRound', function(){
    it('should deal a question card & initialize round object in game', function(done){
      var data = {gameId:'200000000000000000000002'};
      Game.startRound(data.gameId, function(err, round){
        Game.findById(data.gameId, function(err, g){
          expect(round).to.be.ok;
          expect(round.qcard.id).to.equal(14);
          expect(g.round.answers).to.have.length(0);
          expect(g.roundNum).to.equal(5);
          done();
        });
      });
    });
  });

  describe('.finalRound', function(){
    it('should deal the final Make a Haiku card & initialize round object in game', function(done){
      var data = {gameId:'200000000000000000000002'};
      Game.finalRound(data.gameId, function(err, round){
        Game.findById(data.gameId, function(err, g){
          expect(round).to.be.ok;
          expect(round.qcard.id).to.equal(533);
          expect(g.round.answers).to.have.length(0);
          expect(g.roundNum).to.equal(5);
          done();
        });
      });
    });
  });

  describe('.makePlay', function(){
    it('Should add a play object to the rounds answers array and trigger end of round (all players have played)', function(done){
      var data = {gameId:'200000000000000000000005', play:{player:'sue', answers:[{_id: '100000000000000000000001', id:1, cardType:'A', text:'Flying sex snakes.', numAnswers:0, expansion:'base'}]}};
      Game.makePlay(data, function(err, obj){
        Game.findById(data.gameId, function(err, g){
          expect(g.round.answers).to.have.length(1);
          expect(obj.player).to.equal('sue');
          expect(obj.round).to.be.ok;
          expect(obj.round.answers[0].player).to.equal('sue');
          expect(obj.cardCzar).to.equal('john');
          done();
        });
      });
    });
    it('Should add a play object to the rounds answers array', function(done){
      var data = {gameId:'200000000000000000000006', play:{player:'sue', answers:[{_id: '100000000000000000000001', id:1, cardType:'A', text:'Flying sex snakes.', numAnswers:0, expansion:'base'}]}};
      Game.makePlay(data, function(err, obj){
        Game.findById(data.gameId, function(err, g){
          expect(g.round.answers).to.have.length(1);
          expect(obj.player).to.equal('sue');
          expect(obj.round).to.not.be.ok;
          expect(obj.cardCzar).to.not.be.ok;
          done();
        });
      });
    });
  });

  describe('.leave', function(){
    it('should remove a player from the game (who is not the card Czar)', function(done){
      var data = {gameId:'200000000000000000000002', player:'sue'};
      Game.leave(data, function(err, info){
        Game.findById(data.gameId, function(err, g){
          expect(info.player).to.equal('sue');
          expect(g.players).to.have.length(2);
          expect(g.round.answers).to.have.length(0);
          expect(g.endGameVotes).to.have.length(0);
          done();
        });
      });
    });
    it('should remove a player from the game (who is the card Czar)', function(done){
      var data = {gameId:'200000000000000000000002', player:'bob'};
      Game.leave(data, function(err, info){
        Game.findById(data.gameId, function(err, g){
          expect(info.player).to.equal('bob');
          expect(info.cardCzar).to.equal('sue');
          expect(g.players).to.have.length(2);
          expect(g.cardCzar).to.equal('sue');
          expect(g.round.answers).to.have.length(0);
          expect(g.endGameVotes).to.have.length(1);
          done();
        });
      });
    });
    it('should remove players and signal game over if only one player left', function(done){
      var data = {gameId:'200000000000000000000002', player:'sue'};
      Game.leave(data, function(err, info){
        data = {gameId:'200000000000000000000002', player:'john'};
        Game.leave(data, function(err, info){
          Game.findById(data.gameId, function(err, g){
            expect(info.player).to.equal('john');
            expect(info.cardCzar).to.not.be.ok;
            expect(info.gameOver).to.be.ok;
            expect(g.players).to.have.length(1);
            expect(g.cardCzar).to.equal('bob');
            expect(g.round.answers).to.have.length(0);
            expect(g.endGameVotes).to.have.length(0);
            done();
          });
        });
      });
    });
  });

  describe('.dealCards', function(){
    it('should return cards from the deck ((num players - 1) * num answers of current qcard)', function(done){
      var data = {gameId:'200000000000000000000005'};
      Game.dealCards(data.gameId, function(err, players, cards, numCards){
        Deck.findById('300000000000000000000003', function(err, deck){
          expect(numCards).to.equal(1);
          expect(players).to.have.length(1);
          expect(cards).to.have.length(1);
          expect(deck.answers).to.have.length(36);
          done();
        });
      });
    });
  });

  describe('.nextCzar', function(){
    it('should assign the next player to be the card czar', function(done){
      var data = {gameId:'200000000000000000000005'};
      Game.nextCzar(data.gameId, function(err, cardCzar){
        Game.findById(data.gameId, function(err, g){
          expect(cardCzar).to.equal('sue');
          expect(g.cardCzar).to.equal('sue');
          done();
        });
      });
    });
  });

  describe('.findForUpdate', function(){
    it('should return the game object with an updated timestamp', function(done){
      var data = {gameId:'200000000000000000000002'};
      Game.findForUpdate(data.gameId, function(err, g1){
        Game.lastUpdate(data.gameId, function(err, timeStamp){
          expect(timeStamp).to.not.equal(12345);
          expect(g1.lastUpdate).to.equal(timeStamp);
          done();
        });
      });
    });
  });

  describe('.lastUpdate', function(){
    it('should return the timestamp of the last time the record was accessed by findForUpdate', function(done){
      var data = {gameId:'200000000000000000000002'};
      Game.lastUpdate(data.gameId, function(err, timeStamp){
        expect(timeStamp).to.equal(12345);
        done();
      });
    });
  });

  describe('.dealHand', function(){
    it('should return 10 cards for each player and all players in the game', function(done){
      Game.dealHand('200000000000000000000005', function(err, players, cards){
        expect(players).to.have.length(2);
        expect(cards).to.have.length(20);
        done();
      });
    });
  });

  describe('.logWin', function(){
    it('should increase a players wins in the gamedata object', function(done){
      Game.logWin('200000000000000000000005', 'john', function(err, count){
        Game.findById('200000000000000000000005', function(err, g){
          expect(g.gameData.john.wins).to.equal(1);
          done();
        });
      });
    });
  });

  describe('.logVote', function(){
    it('should add the players name to the end game votes array', function(done){
      Game.logVote('200000000000000000000005', 'john', function(err, count){
        Game.findById('200000000000000000000005', function(err, g){
          expect(g.endGameVotes).to.have.length(1);
          done();
        });
      });
    });
  });

});

/*
  describe('', function(){
    it('', function(done){});
  });

*/
