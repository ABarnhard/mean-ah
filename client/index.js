(function(){
  'use strict';

  angular.module('mean-ah', ['ngRoute', 'LocalForageModule', 'abPlayerModule', 'abQuestionModule', 'abAnswerModule'])
  .config(['$routeProvider', '$httpProvider', '$localForageProvider', function($routeProvider, $httpProvider, $localForageProvider){
    $routeProvider
    .when('/',         {templateUrl:'/views/home/home.html',         controller:'HomeCtrl'})
    .when('/register', {templateUrl:'/views/register/register.html', controller:'RegisterCtrl'})
    .when('/login',    {templateUrl:'/views/login/login.html',       controller:'LoginCtrl'})
    .when('/logout',   {templateUrl:'/views/logout/logout.html',     controller:'LogoutCtrl'})
    .when('/lobby',    {templateUrl:'/views/lobby/lobby.html',       controller:'LobbyCtrl'})
    .when('/newgame',  {templateUrl:'/views/new-game/new-game.html', controller:'NewGameCtrl'})
    .when('/game',     {templateUrl:'/views/games/games.html',       controller:'GamesCtrl'})
    .otherwise({redirectTo:'/'});

    $httpProvider.interceptors.push('HttpInterceptor');
    $localForageProvider.config({name:'mean-ah', storeName:'cache', version:1.0});
  }]);
})();

