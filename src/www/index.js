var Stage = require("stage"),
    Routes = require("./routes"),
    RouteHandler = require("./components/route-handler"),
    AppStage;


var viewInfo;
for(var route in Routes) {
  viewInfo = Routes[route];
  Stage.view(viewInfo.view, viewInfo.template);
}

AppStage = Stage({
  viewport: "#viewPort",
  transition: "lollipop"
});

var routeHandler = RouteHandler(AppStage);


function Nav() {
  var navigation = document.getElementById("nav"),
      items = Array.prototype.slice.call(navigation.getElementsByTagName("a"), 0);
      selectedItem = null;

  function selectItem() {
    if(selectedItem) {
      selectedItem.className = "";
    }
    var path = location.hash;
    items.some(function(a) {
      if(a.href.endsWith(path)) {
        selectedItem = a;
        return true;
      }
      return false;
    });
    if(selectedItem) {
      selectedItem.className = "active";
    }
  }

  window.addEventListener("hashchange", selectItem);

  return {
    selectItem: selectItem,
    clear: function() {
      if(!selectedItem) return;
      selectedItem.className = "";
      selectedItem = null;
    }
  };
}


var navigation = Nav();

module.exports = window.App = {
  run: function() {
    var currPath = routeHandler.getPath(location.href), 
        route = Routes[currPath];
    if(route) {
      routeHandler.route(currPath);
    }else {
      console.log('Defaulting to /home');
      routeHandler.route("/home");
    }
    // Select item at curent path
    navigation.selectItem();
  }
};
