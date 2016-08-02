(function() {
  var Stage = require("stage"), 
      Prism = require("prismjs");

  Stage.defineView("home", function(AppStage, viewUi) {
    
    function highlightCodeBlocks() {
      var blocks = viewUi.getElementsByTagName("code");
      Array.prototype.forEach.call(blocks, function(elem) {
        Prism.highlightElement(elem);
      });
    }

    return {
      initialize: function(opts) {
        highlightCodeBlocks();
      }
    };
  });

})();