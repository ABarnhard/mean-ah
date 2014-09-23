(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('LobbyCtrl', ['$scope', 'Socket', 'Game', function($scope, Socket, Game){
    Game.findAllOpen().then(function(res){
      $scope.games = res.data.games;
    });

  }]);
})();

