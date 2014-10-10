(function(){
  'use strict';
  angular.module('mean-ah')
  .controller('CardsDispCtrl', ['$scope', '$interval', function($scope, $interval){

    $scope.title = 'Display the Answers To the Question';

    $scope.showModal = function(){
      $('#card-display').modal();
    };

    angular.element(document).ready(function(){
      $('#card-display').on('hidden.bs.modal', function(e){
        $scope.round = $scope.winner = undefined;
      });
    });

    // roundInfo.round = {qcard:{cardObj}, answers:[{player:'', answers:[{cardObj}]}]}
    $scope.$on('display-round', function(event, roundInfo){
      roundInfo = angular.fromJson(roundInfo);
      $scope.fullSentence = '';
      var qParts = roundInfo.round.qcard.text.split('_'),
          words = [];

      if(qParts.length === 1){
        // check # of answers and display accordingly (either 1 or make a haiku)
      }else{
        // There should be as many question parts as answers
        qParts.forEach(function(segment, index){
          segment = segment.trim();
          words.concat(segment.split(' '));
          var ans = roundInfo.round.answers[index].answers[index].text.trim();
          words.concat(ans.split(' '));
        });
      }
      words.forEach(function(word){
        $scope.fullSentence = $scope.fullSentence + ' ' + word;
      });
      $scope.round = roundInfo.round;
      $('#card-display').modal();
    });

    // winnerInfo = {question:text of qcard, play:{player:'', answers:[{cardObj}], gameOver:boolean}}
    $scope.$on('display-winner', function(event, winnerInfo){
      winnerInfo = angular.fromJson(winnerInfo);
      $scope.winner = winnerInfo.play;
      $('#card-display').modal();
    });

  }]);
})();
