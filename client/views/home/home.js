(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('HomeCtrl', ['$scope', 'Home', 'Socket', function($scope, Home, Socket){
    Socket.forward(['test', 'data-test']);

    $scope.$on('socket:test', function(event, data){
      $scope.test = 'Test Passed!';
    });
    $scope.$on('socket:data-test', function(event, data){
      $scope.dataTest = data;
    });

    Socket.emit('test');
    Socket.emit('data-test', {data:'test data'});


  }]);
})();

