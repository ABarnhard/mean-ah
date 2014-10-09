(function(){
  'use strict';
  angular.module('mean-ah')
  .controller('ResultsCtrl', ['$scope', function($scope){
    $scope.title = 'Display the final results of the game';
    $scope.showModal = function(){
      $('#results').modal();
    };
  }]);
})();

