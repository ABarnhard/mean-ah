(function(){
  'use strict';

  angular.module('mean-ah')
  .factory('Game', ['$http', '$rootScope', '$localForage', '$q', '$location', function($http, $rootScope, $localForage, $q, $location){
    function findAllOpen(){
      return $http.get('/games');
    }

    function load(id){
      return $http.get('/games/' + id);
    }

    function cleanLocalStorage(msg){
      var deferred = $q.defer();
      // deferred.resolve, deferred.reject
      $localForage.setItem('gameId', null).then(function(){
        $localForage.setItem('hand', null).then(function(){
          // event updates navbar to remove Game Room Link
          $rootScope.$broadcast('game-over', null);
          deferred.resolve(msg);
        });
      });
      return deferred.promise;
    }

    function errorToLobby(msg){
      toastr.error(msg);
      $location.path('/lobby');
    }

    function goToLobby(msg){
      toastr.success(msg);
      $location.path('/lobby');
    }

    function displayRound(jsonString){
      $rootScope.$broadcast('display-round', jsonString);
    }

    function displayWinner(jsonString){
      $rootScope.$broadcast('display-winner', jsonString);
    }

    function create(scope){
      var expansions = [],
          deferred = $q.defer();
      $localForage.getItem('alias').then(function(alias){
        scope.game.player = alias;
        Object.keys(scope.expansions).forEach(function(key){
          // console.log(key);
          if(scope.expansions[key]){
            expansions.push(key);
          }
        });
        scope.game.decks = expansions;
        // console.log($scope.game);
        deferred.resolve(angular.toJson(scope.game));
      });
      return deferred.promise;
    }

    function registerAndJoin(gameInfo){
      // console.log(gameInfo);
      gameInfo = angular.fromJson(gameInfo);
      $localForage.setItem('gameId', gameInfo.gameId).then(function(){
        $rootScope.$broadcast('game-joined', gameInfo.gameId);
        $location.path('/game');
      });
    }

    return {registerAndJoin:registerAndJoin, create:create, displayWinner:displayWinner, displayRound:displayRound, findAllOpen:findAllOpen, load:load, cleanLocalStorage:cleanLocalStorage, errorToLobby:errorToLobby, goToLobby:goToLobby};
  }]);
})();

