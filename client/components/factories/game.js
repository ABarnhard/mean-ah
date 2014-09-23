(function(){
  'use strict';

  angular.module('mean-ah')
  .factory('Game', ['$http', '$rootScope', function($http, $rootScope){
    function findAllOpen(){
      return $http.get('/games');
    }

    function create(game, scope){
      return $http.post('/games', game);
    }

    return {findAllOpen:findAllOpen, create:create};
  }]);
})();

