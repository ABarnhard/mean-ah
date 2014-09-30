(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('GamesCtrl', ['$scope', '$localForage', 'Socket', 'Game', function($scope, $localForage, Socket, Game){

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

    Socket.forward(['player-joined', 'game-start', 'deal-hand', 'deal-question']);

    $scope.$on('socket:player-joined', function(event, data){
      // console.log('I Fired');
      $scope.game.players.push(data);
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

    $scope.$on('socket:deal-question', function(event, data){
      $localForage.setItem('qcard', data.qcard).then(function(){
        $scope.game.question = data.qcard;
      });
    });

    $scope.startGame = function(id){
      // console.log('startGame Fired');
      Socket.emit('start-game', {gameId:id});
    };

    // FOR TESTING
    $scope.drawHand = function(){
      Socket.emit('draw-hand', {gameId:$scope.game._id});
    };
    // END TESTING

  }]);
})();
