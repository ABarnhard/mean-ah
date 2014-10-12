(function(){
  'use strict';

  angular.module('abPlayerModule', [])
  .directive('abPlayer', [function(){
    var o = {};

    o.restrict = 'A';
    o.templateUrl = '/components/directives/ab-player/ab-player.html';

    o.scope = {player:'@', wins:'@', playedRound:'@', cardczar:'@'};

    o.controller = ['$scope', function($scope){
      $scope.hasPlayed = false;

      $scope.$watch('playedRound', function(newVal, oldVal){
        $scope.hasPlayed = !!$scope.playedRound;
      });

    }];

    return o;
  }]);

})();
