(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('LoginCtrl', ['$scope', '$location', 'User', function($scope, $location, User){
    $scope.user = {};
    $scope.formIsValid = false;

    $scope.$watch('userForm.$valid', function(){
      $scope.formIsValid = !$scope.formIsValid;
    });

    function success(response){
      $location.path('/lobby');
    }

    function failure(response){
      $scope.user = {};
    }

    $scope.login = function(){
      if(!$scope.formIsValid){
        toastr.error('Enter your username & password to login');
      }else{
        User.login($scope.user).then(success, failure);
      }
    };

  }]);
})();

