(function(){
  'use strict';

  angular.module('abAnswerModule', [])
  .directive('abAcard', [function(){
    var o = {};
    o.restrict = 'A';
    o.scope = {atext:'@'};
    o.templateUrl = '/components/directives/ab-acard/ab-acard.html';
    o.link = function(scope, element, attrs){
      var css = {
        position: 'absolute',
        display: 'none',
        top: -10000,
        left: -10000,
        color: '#111111',
        width: '144px',
        height: 'auto',
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

      var $shadow = angular.element('<div></div>').css(css).text(attrs.atext);
      angular.element(document.body).append($shadow);

      var height     = $shadow.css('height').replace('px', '') * 1,
          fsize      = $shadow.css('font-size').replace('px', '') * 1,
          cardHeight = 211;

      if(height > cardHeight){
        css = {};
        css['font-size'] = Math.floor(((cardHeight / height) * fsize) + 1) + 'px';
        element.css(css);
      }

      scope.$on('$destroy', function(){
        $shadow.remove();
      });
    };

    return o;
  }]);

})();
