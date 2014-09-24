(function(){
  'use strict';

  angular.module('mean-ah')
  .factory('Game', ['$http', '$rootScope', function($http, $rootScope){
    function findAllOpen(){
      return $http.get('/games');
    }

    function findById(id){
      return $http.get('/games/' + id);
    }

    return {findAllOpen:findAllOpen, findById:findById};
  }]);
})();

