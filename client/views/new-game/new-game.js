(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('NewGameCtrl', ['$scope', '$location', '$localForage', 'Socket', function($scope, $location, $localForage, Socket){
    Socket.forward(['game-created']);

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
      $scope.game.owner = {alias:$scope.$$prevSibling.alias};
      // console.log($scope.game);
      Socket.emit('create-game', $scope.game);
    };

    $scope.$on('socket:game-created', function(event, data){
      // console.log(data);
      $localForage.setItem('gameInfo', data).then(function(){
        $location.path('/game');
      });
    });

  }]);
})();

