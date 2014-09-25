(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('GamesCtrl', ['$scope', '$localForage', 'Socket', 'Game', function($scope, $localForage, Socket, Game){

    $localForage.getItem('gameId').then(function(gameId){
      Game.load(gameId).then(function(res){
        // TODO Add error Handler for games that are over but still in local storage
        Socket.emit('player-connect', {roomId:gameId, player:$scope.$$prevSibling.alias}, function(err, data){
          $scope.game = res.data.game;
          $scope.isOwner = $scope.game.owner === $scope.$$prevSibling.alias;
          $scope.isWaiting = $scope.game.status === 'open';
        });
      });
    });

    Socket.forward(['player-joined', 'game-start']);

    $scope.$on('socket:player-joined', function(event, data){
      // console.log('I Fired');
      $scope.game.players.push(data);
    });

    $scope.$on('socket:game-start', function(event, data){
      console.log('game started');
      $scope.game.status = 'in-progress';
      $scope.game.isOpen = 'false';
    });

    $scope.startGame = function(id){
      // console.log('startGame Fired');
      Socket.emit('start-game', {gameId:id});
    };

  }]);
})();
