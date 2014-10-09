(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('LobbyCtrl', ['$scope', '$location', '$localForage', 'Socket', 'Game', function($scope, $location, $localForage, Socket, Game){

    $localForage.getItem('gameId').then(function(gameId){
      // Need better method. Should look up game and kick out if already in one
      $scope.inGame = !!gameId;
    });

    findGames();

    $scope.joinGame = function(gameId){
      $localForage.getItem('alias').then(function(alias){
        var data = {gameId:gameId, player:alias};
        // console.log(data);
        data = angular.toJson(data);
        Socket.emit('join-game', data, function(err, gameData){
          // console.log(gameId);
          if(err){
            toastr.error('Error Joining Game, try again.');
            return findGames();
          }
          gameData = angular.fromJson(gameData);
          $localForage.setItem('gameId', gameData.gameId).then(function(){
            $location.path('/game');
          });
        });
      });
    };

    function findGames(){
      Game.findAllOpen().then(function(res){
        $scope.games = res.data.games;
      });
    }

  }]);
})();

