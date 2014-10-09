(function(){
  'use strict';
  angular.module('mean-ah')
  .controller('CardsDispCtrl', ['$scope', function($scope){

    $scope.title = 'Display the Answers To the Question';

    $scope.showModal = function(){
      $('#card-display').modal();
    };

    $scope.$on('display-round', function(event, roundInfo){
      roundInfo = angular.fromJson(roundInfo);
      $scope.round = roundInfo.round;
      $('#card-display').modal();
    });

  }]);
})();
