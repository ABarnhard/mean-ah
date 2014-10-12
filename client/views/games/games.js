(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('GamesCtrl', ['$scope', '$location', '$localForage', 'Socket', 'Game', function($scope, $location, $localForage, Socket, Game){

    // Register game events to be forwarded from Socket.IO to Angulars event system
    var socketEvents = [
      'player-joined',
      'game-start',
      'deal-hand',
      'round-start',
      'player-left',
      'play-made',
      'answers-submitted',
      'winner',
      'deal-cards',
      'new-czar',
      'game-over',
      'replace-czar',
      'player-voted',
      'final-round-start'
    ];
    Socket.forward(socketEvents, $scope);

    $localForage.getItem('alias').then(function(alias){
      // Get logged in player
      $scope.alias = alias;
      $localForage.getItem('gameId').then(function(gameId){
        if(!!!gameId){return Game.errorToLobby('Hey there jackwagon, try joining a game first');}
        // check if gameId exists and return to lobby if it doesn't
        Game.load(gameId).then(function(res){
        // load game from database into memory
          if(!!!res.data.game){
            // if no game was returned, kick out to lobby
            Game.cleanLocalStorage('Game Has Ended, Choose Another Game').then(Game.errorToLobby);
          }else{
            // emit the connect event to make sure player's socket connection is in the game room
            Socket.emit('player-connect', angular.toJson({roomId:gameId, player:$scope.alias}), function(err, data){
              $localForage.getItem('hand').then(function(hand){
                // look up hand saved in local storage
                $scope.game = res.data.game;
                $scope.game.answers = [];
                $scope.game.hand = hand || [];
                $scope.game.play = _.findWhere($scope.game.round.answers || [], {player:$scope.alias});
                $scope.game.isOwner = ($scope.game.owner === $scope.alias);
                $scope.isLoaded = true;
              });
            });
          }
        });
      });
    });

    $scope.startGame = function(id){
      // console.log('startGame Fired');
      Socket.emit('start-game', angular.toJson({gameId:id}), function(){
        Socket.emit('draw-hand', angular.toJson({gameId:id}), function(){
          Socket.emit('start-round', angular.toJson({gameId:id}));
        });
      });
    };

    $scope.leaveGame = function(id){
      // console.log('leaveGame Fired');
      Socket.emit('leave-game', angular.toJson({gameId:id, player:$scope.alias}), function(err, data){
        Game.cleanLocalStorage('You have quit the game').then(Game.goToLobby);
      });
    };

    // define the 3 css options for cards selection
    var css  = {};
    css.base = {};
    css.sel  = {};

    css.base['border-width'] = '1px';
    css.base['border-color'] = '#777';
    css.sel['border-width'] = '4px';
    css.sel['border-color'] = '#111111';

    $scope.selectAnswer = function(card){
      // If you've already played this round, do nothing
      if($scope.game.play){return;}
      // If this card is already in answers, remove it and clear the badge;
      if(_.findWhere($scope.game.answers, {id:card.id})){
        $scope.game.answers = $scope.game.answers.filter(function(c){return c.id !== card.id;});
        angular.element('div[data-id='+card._id+']').children('.card-badge').remove();
        angular.element('div[data-id='+card._id+']').css(css.base);
      }

      if($scope.game.answers.length < $scope.game.round.qcard.numAnswers){
        $scope.game.answers.push(card);
      }else{
        var oldCard = $scope.game.answers.shift();
        angular.element('div[data-id='+oldCard._id+']').css(css.base);
        $scope.game.answers.push(card);
      }
      // set css and badges based on cards position in answer array
      angular.element('.card-badge').remove();
      $scope.game.answers.forEach(function(c, i){
        var $card = angular.element('div[data-id='+c._id+']'),
            num   = i + 1,
            $badge = angular.element('<span></span>').addClass('badge card-badge').text(num);
        $card.css(css.sel);
        $card.append($badge);
      });
    };

    $scope.playAnswers = function(){
      var answers = [];
      $scope.game.answers.forEach(function(ans){
        answers.push(_.findWhere($scope.game.hand, {id:ans.id}));
        $scope.game.hand = $scope.game.hand.filter(function(card){return card.id !== ans.id;});
      });
      $localForage.setItem('hand', $scope.game.hand).then(function(){
        var play = {player:$scope.alias, answers:answers};
        $scope.game.play = play;
        $scope.game.answers = [];
        var data = {gameId:$scope.game._id, play:play};
        data = angular.toJson(data);
        Socket.emit('play-cards', data);
      });
    };

    $scope.pickWinner = function(play){
      $scope.winner = play;
    };

    $scope.submitWinner = function(){
      var data = {gameId:$scope.game._id, winner:$scope.winner, gameOver:$scope.game.finalRound};
      data = angular.toJson(data);
      Socket.emit('winner-selected', data);
      $scope.winner = null;
    };

    $scope.voteGameEnd = function(id){
      var data = {gameId:id, player:$scope.alias};
      data = angular.toJson(data);
      Socket.emit('vote-to-end', data);
      $scope.voted = true;
    };

    // register Angular event handlers
    $scope.$on('socket:player-joined', function(event, data){
      data = angular.fromJson(data);
      $scope.game.players.push(data.player);
    });

    $scope.$on('socket:player-left', function(event, data){
      // console.log('socket:player-left fired');
      data = angular.fromJson(data);
      $scope.game.players = $scope.game.players.filter(function(p){return p !== data.player;});
    });

    $scope.$on('socket:game-start', function(event, data){
      // console.log('game started');
      $scope.game.status = 'in-progress';
      $scope.game.isOpen = false;
      $scope.isWaiting = $scope.game.status === 'open';
      $scope.$apply();
    });

    $scope.$on('socket:deal-hand', function(event, data){
      data = angular.fromJson(data);
      $localForage.setItem('hand', data.hand).then(function(){
        $scope.game.hand = data.hand;
      });
    });

    $scope.$on('socket:round-start', function(event, data){
      data = angular.fromJson(data);
      $scope.game.round = data.round;
      $scope.game.play = null;
    });

    $scope.$on('socket:final-round-start', function(event, data){
      data = angular.fromJson(data);
      $scope.game.round = data.round;
      $scope.game.play = null;
      $scope.game.finalRound = true;
    });

    $scope.$on('socket:answers-submitted', function(event, data){
      // Send it to the card-display modal while it's still a JSON string to avoid cloneing the object later
      Game.displayRound(data);
      data = angular.fromJson(data);
      if($scope.alias === data.cardCzar){
        $scope.playedAnswers = data.round;
      }
    });

    $scope.$on('socket:play-made', function(event, data){
      data = angular.fromJson(data);
      console.log('socket:play-made', data.player);
    });

    $scope.$on('socket:winner', function(event, play){
      play = angular.fromJson(play);
      Game.displayWinner(angular.toJson({question:$scope.game.round.qcard.text, play:play}));
      $scope.playedAnswers = null;
      if(play.gameOver){
        Game.cleanLocalStorage('The Game Has Ended').then(Game.goToLobby);
      }
    });

    $scope.$on('socket:deal-cards', function(event, data){
      data = angular.fromJson(data);
      var newHand = $scope.game.hand.concat(data.cards);
      $localForage.setItem('hand', newHand).then(function(){
        $scope.game.hand = newHand;
      });
    });

    $scope.$on('socket:new-czar', function(event, data){
      data = angular.fromJson(data);
      // toastr.success(data.cardCzar + ' is now the Card Czar.');
      $scope.game.cardCzar = data.cardCzar;
    });

    $scope.$on('socket:game-over', function(event, data){
      // TODO Add somthing so that users can view the final results stored in data.gameData
      Game.cleanLocalStorage('The Game Has Ended').then(Game.goToLobby);
    });

    $scope.$on('socket:replace-czar', function(event, data){
      data = angular.fromJson(data);
      toastr.success(data.cardCzar + ' is now the Card Czar.');
      $scope.game.cardCzar = data.cardCzar;
      if($scope.alias === $scope.game.cardCzar){
        // If player has become card czar, return any played cards to their hand
        if($scope.game.play){
          $scope.game.hand = $scope.game.hand.concat($scope.game.play.answers);
          $scope.game.play.answers = null;
          $localForage.setItem('hand', $scope.game.hand).then(function(){
            toastr.success('Your Played Cards have been returned to your hand');
          });
        }
      }
    });

    $scope.$on('socket:player-voted', function(event, data){
      data = angular.fromJson(data);
      toastr.success(data.player + ' voted to end the game');
    });

  }]);

})();
