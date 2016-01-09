(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('LobbyCtrl', ['$scope', '$location', '$localForage', 'Socket', 'Game', function($scope, $location, $localForage, Socket, Game){

    $localForage.getItem('gameId').then(function(gameId){
      // Need better method. Should look up game and kick out if already in one
      $scope.inGame = !!gameId;
      if(!$scope.inGame){findGames();}
    });

    $scope.joinGame = function(gameId){
      $localForage.getItem('alias').then(function(alias){
        var data = {gameId:gameId, player:alias};
        Socket.emit('join-game', angular.toJson(data), function(err, jsonGameData){
          if(err){
            toastr.error('Error Joining Game, try again.');
            return findGames();
          }
          Game.registerAndJoin(jsonGameData);
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

