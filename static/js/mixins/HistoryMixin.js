// jscs:disable
define([],
  function() {
    "use strict";

    // jscs:enable
    var HistoryMixin = {
      getPath: function(component) {
        return component.replace(/ /g,'').toLowerCase();
      },

      pushComponent: function(component) {
        var path = this.getPath(component);
        window.history.pushState({item: 'submenu'}, component, '/' + path);
      }
    };

    return HistoryMixin;
  }
);
