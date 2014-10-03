(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('GamesCtrl', ['$scope', '$location', '$localForage', 'Socket', 'Game', function($scope, $location, $localForage, Socket, Game){

    $localForage.getItem('gameId').then(function(gameId){
      Game.load(gameId).then(function(res){
        // TODO Add error Handler for games that are over but still in local storage
        // TODO Add localForage.remove for hand & gameId if game is over, and add a $location.path change to lobby
        Socket.emit('player-connect', {roomId:gameId, player:$scope.$$prevSibling.alias}, function(err, data){
          $localForage.getItem('hand').then(function(hand){
            $scope.game = res.data.game;
            $scope.game.hand = hand || [];
            $scope.game.isOwner = $scope.game.owner === $scope.$$prevSibling.alias;
          });
        });
      });
    });

    Socket.forward(['player-joined', 'game-start', 'deal-hand', 'round-start', 'player-left']);

    $scope.$on('socket:player-joined', function(event, player){
      // console.log('I Fired');
      $scope.game.players.push(player);
    });

    $scope.$on('socket:player-left', function(event, player){
      console.log('socket:player-left fired');
      $scope.game.players = $scope.game.players.filter(function(p){return p !== player;});
    });

    $scope.$on('socket:game-start', function(event, data){
      console.log('game started');
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
      // console.log('socket:round-start fired');
      $localForage.setItem('qcard', data.qcard).then(function(){
        $scope.game.question = data.qcard;
      });
    });

    $scope.startGame = function(id){
      // console.log('startGame Fired');
      Socket.emit('start-game', {gameId:id});
    };

    $scope.leaveGame = function(id){
      // console.log('leaveGame Fired');
      Socket.emit('leave-game', {gameId:id, player:$scope.$$prevSibling.alias}, function(err, data){
        $location.path('/lobby');
      });
    };

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
