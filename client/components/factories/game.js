(function(){
  'use strict';

  angular.module('mean-ah')
  .factory('Game', ['$http', '$rootScope', function($http, $rootScope){
    function findAllOpen(){
      return $http.get('/games');
    }

    return {findAllOpen:findAllOpen};
  }]);
})();

