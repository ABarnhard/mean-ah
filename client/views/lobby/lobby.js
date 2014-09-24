(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('LobbyCtrl', ['$scope', '$location', '$localForage', 'Socket', 'Game', function($scope, $location, $localForage, Socket, Game){

    Game.findAllOpen().then(function(res){
      $scope.games = res.data.games;
    });

    $scope.joinGame = function(gameId){
      var data = {gameId:gameId};
      data.player = $scope.$$prevSibling.alias;
      // console.log(data);
      Socket.emit('join-game', data, function(err, gameId){
        // console.log(gameId);
        $localForage.setItem('gameId', gameId).then(function(){
          $location.path('/game');
        });
      });
    };

  }]);
})();

