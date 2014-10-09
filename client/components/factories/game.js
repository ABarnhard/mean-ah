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
          // event updates navbar to remove Rejoin Game Link
          $rootScope.$broadcast('gameOver', null);
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

    return {findAllOpen:findAllOpen, load:load, cleanLocalStorage:cleanLocalStorage, errorToLobby:errorToLobby, goToLobby:goToLobby};
  }]);
})();

