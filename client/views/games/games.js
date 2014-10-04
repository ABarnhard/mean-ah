(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('GamesCtrl', ['$scope', '$location', '$localForage', 'Socket', 'Game', function($scope, $location, $localForage, Socket, Game){

    // Register game events to be forwarded from Socket.IO to Angulars event system
    Socket.forward(['player-joined', 'game-start', 'deal-hand', 'round-start', 'player-left']);

    // Get player from Nav (could look up alias with $localForage)
    $scope.player = $scope.$$prevSibling.alias;

    // load game from database into memory
    $localForage.getItem('gameId').then(function(gameId){
      Game.load(gameId).then(function(res){
        // TODO Add error Handler for games that are over but still in local storage
        // TODO Add localForage.remove for hand & gameId if game is over, and add a $location.path change to lobby
        Socket.emit('player-connect', {roomId:gameId, player:$scope.player}, function(err, data){
          $localForage.getItem('hand').then(function(hand){
            $scope.game = res.data.game;
            $scope.game.hand = hand || [];
            $scope.game.play = _.findWhere($scope.game.round.answers || [], {player:$scope.player});
            $scope.game.answers = $scope.game.play ? $scope.game.play.answers : [];
            $scope.game.isOwner = ($scope.game.owner === $scope.player);
          });
        });
      });
    });

    $scope.startGame = function(id){
      // console.log('startGame Fired');
      Socket.emit('start-game', {gameId:id});
    };

    $scope.leaveGame = function(id){
      // console.log('leaveGame Fired');
      Socket.emit('leave-game', {gameId:id, player:$scope.player}, function(err, data){
        $location.path('/lobby');
      });
    };

    $scope.selectAnswer = function(card){
      // If you've already played this round, do nothing
      if($scope.game.play){return;}
      // If this card is already in answers, do nothing
      if(_.findWhere($scope.game.answers, {id:card.id})){return;}

      if($scope.game.answers.length < $scope.game.round.qcard.numAnswers){
        $scope.game.answers.push(card);
      }else{
        $scope.game.answers.shift();
        $scope.game.answers.push(card);
      }
    };

    // register Angular event handlers
    $scope.$on('socket:player-joined', function(event, player){
      // console.log('I Fired');
      $scope.game.players.push(player);
    });

    $scope.$on('socket:player-left', function(event, player){
      // console.log('socket:player-left fired');
      $scope.game.players = $scope.game.players.filter(function(p){return p !== player;});
    });

    $scope.$on('socket:game-start', function(event, data){
      // console.log('game started');
      $scope.game.status = 'in-progress';
      $scope.game.isOpen = 'false';
      $scope.isWaiting = $scope.game.status === 'open';
      Socket.emit('draw-hand', {gameId:$scope.game._id}, function(){
        Socket.emit('start-round', {gameId:$scope.game._id});
      });
    });

    $scope.$on('socket:deal-hand', function(event, data){
      $localForage.setItem('hand', data.hand).then(function(){
        $scope.game.hand = data.hand;
      });
    });

    $scope.$on('socket:round-start', function(event, data){
      $scope.game.round = data.round;
    });

    // FOR TESTING
    $scope.drawHand = function(){
      Socket.emit('draw-hand', {gameId:$scope.game._id});
    };
    $scope.startRound = function(){
      Socket.emit('start-round', {gameId:$scope.game._id});
    };
    // END TESTING

  }]);
})();
