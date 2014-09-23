(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('RegisterCtrl', ['$scope', '$location', 'User', function($scope, $location, User){
    $scope.user = {};

    function success(response){
      toastr.success('User successfully registered.');
      $location.path('/lobby');
    }

    function failure(response){
      toastr.error('Error during user registration, email/alias is taken, try again.');
      $scope.user = {};
    }

    $scope.register = function(){
      User.register($scope.user).then(success, failure);
    };
  }]);
})();

