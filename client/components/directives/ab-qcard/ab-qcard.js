(function(){
  'use strict';

  angular.module('abQuestionModule', [])
  .directive('abQcard', [function(){
    var o = {};

    o.restrict = 'A';
    o.templateUrl = '/components/directives/ab-qcard/ab-qcard.html';

    o.scope = {qtext:'@'};

    o.controller = ['$scope', function($scope){
      $scope.$watch('qtext', function(newVal, oldVal){
        $scope.text = $scope.qtext.replace('_', '___________');
      });

    }];

    return o;
  }]);

})();
