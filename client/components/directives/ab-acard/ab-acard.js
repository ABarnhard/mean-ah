(function(){
  'use strict';

  angular.module('abAnswerModule', [])
  .directive('abAcard', [function(){
    var o = {};
    o.restrict = 'A';
    o.scope = {atext:'@', playNum:'@'};

    o.link = function(scope, element, attrs){
      var css = {
        position: 'absolute',
        display: 'none',
        //top: -10000,
        //left: -10000,
        top: 0,
        left: 0,
        color: '#111111',
        width: '144px',
        height: 'auto',
        //height: '211px',
        // float: 'left',
        padding: '10px',
        margin: '5px'
      };
      css['word-wrap'] = 'break-word';
      css['background-color'] = '#FFFFFF';
      css['font-size'] = '15px';
      css['font-weight'] = 800;
      css['border-radius'] = '15px';
      css['-moz-border-radius'] = '15px';
      css['border-width'] = '1px';
      css['border-style'] = 'solid';
      css['border-color'] = '#777';
      // css['-webkit-box-shadow'] = '0 0 8px #D0D0D0';

      var $shadow = angular.element('<div></div>').css(css).text(attrs.atext);
      angular.element(document.body).append($shadow);

      var height = $shadow.css('height'),
          fsize  = $shadow.css('font-size');
      console.log(height, fsize);
      // element.css({height:'10px'});
      scope.$watch('attrs.playNum', function(newVal, oldVal){
        scope.pick = attrs.playNum * 1;
      });

      scope.$on('$destroy', function(){
        $shadow.remove();
      });
    };

    return o;
  }]);

})();
