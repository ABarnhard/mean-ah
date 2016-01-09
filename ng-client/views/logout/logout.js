(function(){
  'use strict';

  angular.module('mean-ah')
  .controller('LogoutCtrl', ['$location', '$localForage', 'User', 'Game', 'Socket', function($location, $localForage, User, Game, Socket){

    $localForage.getItem('gameId').then(function(gameId){
      if(gameId){
        $localForage.getItem('alias').then(function(alias){
          Socket.emit('leave-game', angular.toJson({gameId:gameId, player:alias}), function(err, data){
            logout();
          });
        });
      }else{
        logout();
      }
    });

    function logout(){
      User.logout().then(function(){
        Game.cleanLocalStorage('Successful logout.').then(function(msg){
          toastr.success(msg);
          $location.path('/');
        });
      });
    }

  }]);
})();

