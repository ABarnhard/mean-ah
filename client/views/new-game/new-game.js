(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('NewGameCtrl', ['$scope', '$location', '$localForage', 'Socket', 'Game', function($scope, $location, $localForage, Socket, Game){
    $scope.game = {};
    $scope.expansions = {base:true};

    $scope.createGame = function(){
      var expansions = [];
      Object.keys($scope.expansions).forEach(function(key){
        // console.log(key);
        if($scope.expansions[key]){
          expansions.push(key);
        }
      });
      $scope.game.decks = expansions;
      $localForage.getItem('alias').then(function(alias){
        $scope.game.player = alias;
        // console.log($scope.game);
        var data = angular.toJson($scope.game);
        Socket.emit('create-game', data, function(err, gameInfo){
          // console.log(gameInfo);
          gameInfo = angular.fromJson(gameInfo);
          $localForage.setItem('gameId', gameInfo.gameId).then(function(){
            Game.register(gameInfo.gameId);
            $location.path('/game');
          });
        });
      });
    };

  }]);
})();

