if(null == NodeList){
  document.body.write('<script type = "text/javascript" src = ""></script>');
}
var Game = function(window, undefined){
  var _instance;
  return function(){
    if(!_instance){
      _instance = this;
      var listeners = {};
      this.bind = function(){};
      this.unbind = function(){};
      this.raise = function(){};
    }
  }
}();
