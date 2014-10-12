(function(){
  'use strict';

  angular.module('mean-ah')
  .factory('Game', ['$http', '$rootScope', '$localForage', '$q', '$location', function($http, $rootScope, $localForage, $q, $location){
    function findAllOpen(){
      return $http.get('/games');
    }

    function load(id){
      return $http.get('/games/' + id);
    }

    function cleanLocalStorage(msg){
      var deferred = $q.defer();
      // deferred.resolve, deferred.reject
      $localForage.setItem('gameId', null).then(function(){
        $localForage.setItem('hand', null).then(function(){
          // event updates navbar to remove Game Room Link
          $rootScope.$broadcast('game-over', null);
          deferred.resolve(msg);
        });
      });
      return deferred.promise;
    }

    function errorToLobby(msg){
      toastr.error(msg);
      $location.path('/lobby');
    }

    function goToLobby(msg){
      toastr.success(msg);
      $location.path('/lobby');
    }

    function displayRound(jsonString){
      $rootScope.$broadcast('display-round', jsonString);
    }

    function displayWinner(jsonString){
      $rootScope.$broadcast('display-winner', jsonString);
    }

    function create(scope){
      var expansions = [],
          deferred = $q.defer();
      $localForage.getItem('alias').then(function(alias){
        scope.game.player = alias;
        Object.keys(scope.expansions).forEach(function(key){
          // console.log(key);
          if(scope.expansions[key]){
            expansions.push(key);
          }
        });
        scope.game.decks = expansions;
        // console.log($scope.game);
        deferred.resolve(angular.toJson(scope.game));
      });
      return deferred.promise;
    }

    function registerAndJoin(gameInfo){
      // console.log(gameInfo);
      gameInfo = angular.fromJson(gameInfo);
      $localForage.setItem('gameId', gameInfo.gameId).then(function(){
        $rootScope.$broadcast('game-joined', gameInfo.gameId);
        $location.path('/game');
      });
    }

    function parseRound(jsonRound){
      var roundInfo = angular.fromJson(jsonRound),
          responses = roundInfo.round.answers.map(function(play){
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
            return fullText.trim().replace('..', '.').replace('  ', ' ');
          });
      return responses;
    }

    function parseWinner(jsonWinnerInfo){
      var winnerInfo = angular.fromJson(jsonWinnerInfo),
          answers = winnerInfo.play.answers.map(function(card){return card.text;}),
          qParts = winnerInfo.question.split('_'),
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
      return [fullText.trim().replace('..', '.').replace('  ', ' ')];
    }

    return {
      parseWinner:parseWinner,
      parseRound:parseRound,
      registerAndJoin:registerAndJoin,
      create:create,
      displayWinner:displayWinner,
      displayRound:displayRound,
      findAllOpen:findAllOpen,
      load:load,
      cleanLocalStorage:cleanLocalStorage,
      errorToLobby:errorToLobby,
      goToLobby:goToLobby
    };
  }]);
})();

