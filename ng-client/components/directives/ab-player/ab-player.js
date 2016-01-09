(function(){
  'use strict';

  angular.module('abPlayerModule', [])
  .directive('abPlayer', [function(){
    var o = {};

    o.restrict = 'A';
    o.templateUrl = '/components/directives/ab-player/ab-player.html';

    o.scope = {player:'@', wins:'@'};

    o.controller = ['$scope', '$element', '$attrs', function($scope, $element, $attrs){
      $scope.$on('player-won', function(event, player){
        if($scope.player === player){
          $scope.wins = parseInt($scope.wins) + 1;
        }
      });

    }];

    return o;
  }]);

})();
