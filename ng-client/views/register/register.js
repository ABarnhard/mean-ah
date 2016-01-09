(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('RegisterCtrl', ['$scope', '$location', 'User', function($scope, $location, User){
    $scope.user = {};
    $scope.formIsValid = false;

    $scope.$watch('userForm.$valid', function(){
      $scope.formIsValid = !$scope.formIsValid;
    });

    function success(response){
      $location.path('/lobby');
    }

    function failure(response){
      toastr.error('Error during user registration, email/alias is taken, try again.');
      $scope.user = {};
    }

    $scope.register = function(){
      if(!$scope.formIsValid){
        toastr.error('All fields are required');
      }else{
        User.register($scope.user).then(success, failure);
      }
    };

  }]);
})();

