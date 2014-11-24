// jscs:disable
define([],
  function() {
    "use strict";

    // jscs:enable
    var BookmarkMixin = {
      getAnchor: function(component) {
        //remove whitespaces and convert to lower case
        return component.replace(/ /g,'').toLowerCase();
      },

      pushComponent: function(component) {
        var anchor = this.getAnchor(component);
        window.location.hash = anchor;
      }
    };

    return BookmarkMixin;
  }
);
