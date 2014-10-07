(function(){
  'use strict';

  angular.module('mean-ah')
  .factory('Game', ['$http', '$rootScope', function($http, $rootScope){
    function findAllOpen(){
      return $http.get('/games');
    }

    function load(id){
      return $http.get('/games/' + id);
    }

    return {findAllOpen:findAllOpen, load:load};
  }]);
})();

