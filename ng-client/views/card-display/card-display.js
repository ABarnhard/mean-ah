(function(){
  'use strict';
  angular.module('mean-ah')
  .controller('CardsDispCtrl', ['$scope', '$interval', 'Game', function($scope, $interval, Game){

    $scope.title = 'Display the Answers To the Question';

    $scope.showModal = function(){
      $('#card-display').modal();
    };

    angular.element(document).ready(function(){
      $('#card-display').on('show.bs.modal', setFirstResponse);
      $('#card-display').on('shown.bs.modal', displayResponses);
      $('#card-display').on('hidden.bs.modal', clear);
    });

    function setFirstResponse(e){
      $scope.response = $scope.responses[0];
      $scope.$apply();
    }

    function displayResponses(e){
      var i = 1,
          timer = $interval(function(){
            if(i < $scope.responses.length){
              $scope.response = $scope.responses[i];
            }else{
              $interval.cancel(timer);
              $('#card-display').modal('hide');
            }
            i++;
          }, 3200);
    }

    function clear(e){
      $scope.responses = $scope.winner = $scope.response = undefined;
      $scope.$apply();
    }

    // roundInfo.round = {qcard:{cardObj}, answers:[{player:'', answers:[{cardObj}]}]}
    $scope.$on('display-round', function(event, roundInfo){
      $scope.responses = Game.parseRound(roundInfo);
      $('#card-display').modal({backdrop:'static'});
    });

    // winnerInfo = {question:text of qcard, play:{player:'', answers:[{cardObj}], gameOver:boolean}}
    $scope.$on('display-winner', function(event, winnerInfo){
      $scope.winner = angular.fromJson(winnerInfo).play.player;
      $scope.responses = Game.parseWinner(winnerInfo);
      $('#card-display').modal();
    });

  }]);
})();
