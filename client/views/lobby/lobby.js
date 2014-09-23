(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('LobbyCtrl', ['$scope', '$location', '$localForage', 'Socket', 'Game', function($scope, $location, $localForage, Socket, Game){
    Socket.forward(['game-joined']);

    Game.findAllOpen().then(function(res){
      $scope.games = res.data.games;
    });

    $scope.joinGame = function(gameId){
      var data = {gameId:gameId};
      data.player = {alias:$scope.$$prevSibling.alias};
      console.log(data);
      Socket.emit('join-game', data);
    };

    $scope.$on('socket:game-joined', function(event, gameInfo){
      console.log(gameInfo);
      $localForage.setItem('gameInfo', gameInfo).then(function(){
        $location.path('/game');
      });
    });

  }]);
})();

