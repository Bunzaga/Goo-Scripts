if(null == NodeList){
  document.body.write('<script type = "text/javascript" src = ""></script>');
}
window.em = null;
var EventManager = function() {
    if (em) {
    } else {
        this.bind = function(){};
        this.unbind = function(){};
        this.raise = function(){};
        window.em = this;
    }
    return window.em;
};
