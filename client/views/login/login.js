(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('LoginCtrl', ['$scope', '$location', 'User', function($scope, $location, User){
    $scope.user = {};

    function success(response){
      toastr.success('Successful login.');
      $location.path('/lobby');
    }

    function failure(response){
      toastr.error('Error during login, try again.');
      $scope.user = {};
    }

    $scope.login = function(){
      User.login($scope.user).then(success, failure);
    };
  }]);
})();

