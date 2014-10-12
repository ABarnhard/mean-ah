(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('NewGameCtrl', ['$scope', 'Socket', 'Game', function($scope, Socket, Game){
    $scope.game = {};
    $scope.expansions = {base:true};
    $scope.formIsValid = false;

    $scope.$watch('gameForm.$valid', function(oldVal, newVal){
      $scope.formIsValid = !$scope.formIsValid;
    });

    $scope.createGame = function(){
      if(!$scope.formIsValid){
        toastr.error('Games have names, get your shit together...');
      }else{
        Game.create($scope).then(function(jsonGame){
          Socket.emit('create-game', jsonGame, function(err, jsonGameInfo){
            Game.registerAndJoin(jsonGameInfo);
          });
        });
      }
    };

  }]);
})();

