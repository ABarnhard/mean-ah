(function(){
  'use strict';

  angular.module('abQuestionModule', [])
  .directive('abQcard', [function(){
    var o = {};

    o.restrict = 'A';
    o.templateUrl = '/components/directives/ab-qcard/ab-qcard.html';

    o.scope = {qtext:'@'};

    o.controller = ['$scope', function($scope){
      var re = /_/g;
      $scope.$watch('qtext', function(newVal, oldVal){
        $scope.text = $scope.qtext.replace(re, '___________');
      });

    }];

    return o;
  }]);

})();
