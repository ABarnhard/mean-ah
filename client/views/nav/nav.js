(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('NavCtrl', ['$scope', '$localForage', 'Socket', 'Game', function($scope, $localForage, Socket, Game){
    $localForage.getItem('alias').then(function(alias){
      $scope.alias = alias;
    });

    $localForage.getItem('gameId').then(function(gameId){
      $scope.gameId = gameId;
    });

    $scope.leaveGame = function(){
      // console.log('leaveGame Fired');
      Socket.emit('leave-game', angular.toJson({gameId:$scope.gameId, player:$scope.alias}), function(err, data){
        Game.cleanLocalStorage('You have quit the game').then(Game.goToLobby);
      });
    };

    $scope.voteGameEnd = function(){
      var data = {gameId:$scope.gameId, player:$scope.alias};
      data = angular.toJson(data);
      Socket.emit('vote-to-end', data);
      $scope.voted = true;
    };

    $scope.$on('authenticated', function(event, alias){
      if(alias === 'anonymous'){alias = null;}
      $localForage.setItem('alias', alias).then(function(){
        $scope.alias = alias;
      });
    });

    $scope.$on('game-over', function(event, gameId){
      // gameId is null from gameover event emitted from Game.cleanLocalStorage
      $scope.gameId = gameId;
    });

    $scope.$on('game-joined', function(event, gameId){
      // Game id from new-game & lobby controllers emitted by Game.registerAndJoin
      $scope.gameId = gameId;
    });

  }]);
})();

