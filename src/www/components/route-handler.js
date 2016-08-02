var ruta3 = require("ruta3");


module.exports = function RouteHandler(StageInstance) {
  var AppStage = StageInstance,
      router = ruta3(),
      routes = require("../routes"),
      paused = false,
      instance;



  // Add views (also routes) to router
  for(var route in routes) {
    router.addRoute(route, routes[route]);
  }


  function getPath(url) {
    var href = url || window.location.href, hashIdx = href.indexOf("#"), path = "";
    if(hashIdx !== -1) {
      path = href.substring(hashIdx + 1);
    }
    return path;
  }

  function isPaused() {
    return paused;
  }

  function pause() {
    paused = true;
  }

  function handleRouteChange() {
    var path, match, viewInfo, viewId;
    if(isPaused()) {
      return;
    }
    path = getPath();
    match = router.match(path);
    if(!match) {
      console.log("View not found,", path);
      return;
    }

    viewInfo = match.action;
    viewId = viewInfo.view;

    if(AppStage.previousView() === viewId) {
      AppStage.popView();
    }else {
      AppStage.pushView(viewId, {
        route: {
          params: match.params,
          splats: match.splats,
        } 
      });
    }
  }

  instance =  {
    isPaused: isPaused,
    pause: pause,
    getPath: getPath,
    route: function(path) {
      if(getPath() !== path) {
        location.assign("#" + path);
      }else {
        handleRouteChange();
      }
    }
  };

  window.addEventListener("hashchange", handleRouteChange);

  return instance;

};
