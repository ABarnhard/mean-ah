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
        $scope.responses = $scope.winner = undefined;
      });
    });

    // roundInfo.round = {qcard:{cardObj}, answers:[{player:'', answers:[{cardObj}]}]}
    $scope.$on('display-round', function(event, roundInfo){
      roundInfo = angular.fromJson(roundInfo);
      $scope.typeAnswer = '';
      $scope.responses = roundInfo.round.answers.map(function(play){
          //var question = roundInfo.round.qcard.text,
          var answers = play.answers.map(function(card){return card.text;}),
              qParts = roundInfo.round.qcard.text.split('_'),
              fullText;
          if(answers.length > qParts.length){
            fullText = qParts[0] + ' ' + answers.join(' ');
          }else{
            fullText = qParts.map(function(q, index){
              var ans = answers.length > index ? answers[index] : '';
              if(index < qParts.length - 1){
                ans = ans.replace('.', '');
              }
              return qParts[index] + ' ' + ans;
            }).join('');
          }
          return fullText.trim().replace('..', '.');
      });
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
