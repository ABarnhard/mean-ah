(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('LobbyCtrl', ['$scope', '$location', '$localForage', 'Socket', 'Game', function($scope, $location, $localForage, Socket, Game){

    findGames();

    $scope.joinGame = function(gameId){
      var data = {gameId:gameId};
      data.player = $scope.$$prevSibling.alias;
      // console.log(data);
      Socket.emit('join-game', data, function(err, gameId){
        // console.log(gameId);
        if(err){
          toastr.error('Error Joining Game, try again.');
          return findGames();
        }

        $localForage.setItem('gameId', gameId).then(function(){
          $location.path('/game');
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

