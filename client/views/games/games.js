(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('GamesCtrl', ['$scope', '$localForage', 'Socket', 'Game', function($scope, $localForage, Socket, Game){

    $localForage.getItem('gameId').then(function(gameId){
      Game.findById(gameId).then(function(res){
        $scope.game = res.data.game;
      });
    });

    Socket.forward(['player-joined']);

    $scope.$on('socket:player-joined', function(event, data){
      // console.log('I Fired');
      $scope.game.players.push(data);
    });

  }]);
})();
