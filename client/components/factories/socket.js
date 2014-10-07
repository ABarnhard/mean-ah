/* global io */

/*
* Rewritten from angular-socket-io for my education
* @license
* angular-socket-io v0.6.0
* (c) 2014 Brian Ford http://briantford.com
* License: MIT
*/

(function(){
  'use strict';

  angular.module('mean-ah')
  .factory('Socket', ['$rootScope', '$timeout', function($rootScope, $timeout){
    var socket = io.connect(),
        asyncAngularify = function(socket, callback){
          return callback ? function(){
            var args = arguments;
            $timeout(function(){
              callback.apply(socket, args);
            }, 0);
          } : angular.noop;
        };

    function on(eventName, callback){
      socket.on(eventName, callback.__ng = asyncAngularify(socket, callback));
    }

    function removeListener(ev, fn){
      if (fn && fn.__ng) {
        arguments[1] = fn.__ng;
      }
      return socket.removeListener.apply(socket, arguments);
    }

    function emit(eventName, data, callback){
      var lastIndex = arguments.length - 1;
      callback = arguments[lastIndex];
      if(typeof callback === 'function'){
        callback = asyncAngularify(socket, callback);
        arguments[lastIndex] = callback;
      }
      return socket.emit.apply(socket, arguments);
    }

    function forward(events, scope){
      if(events instanceof Array === false){
        events = [events];
      }
      if(!scope){
        scope = $rootScope;
      }
      events.forEach(function(eventName){
        var prefixedEvent = 'socket:' + eventName,
            forwardBroadcast = asyncAngularify(socket, function(data){
              scope.$broadcast(prefixedEvent, data);
            });
        scope.$on('$destroy', function(){
          socket.removeListener(eventName, forwardBroadcast);
        });
        socket.on(eventName, forwardBroadcast);
      });
    }

    return {on:on, removeListener:removeListener, emit:emit, forward:forward};
  }]);
})();

