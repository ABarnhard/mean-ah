'use strict';

module.exports = function(app){
  app.set('port', process.env.PORT);
  console.log('Express: Port', app.get('port'));
};

