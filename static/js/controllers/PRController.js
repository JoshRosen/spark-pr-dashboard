// jscs:disable
define([
    "jquery",
    "underscore",
    "react",
    "views/SubnavView",
    "views/PRTableView"],
  function($, _, React, SubnavView, PRTableView) {
  // jscs:enable
  var Controller = function(prURL, navbarDomContainer, prTableDomContainer) {
    this.selectedComponent = "All";
    this.prURL = prURL;
    this.navbarDomContainer = navbarDomContainer;
    this.prTableDomContainer = prTableDomContainer;
    this.prs = [];
  };

  Controller.prototype.onSelectComponent = function(component) {
    this.selectedComponent = component;
    this.render();
  };

  Controller.prototype.render = function() {
    // The response is a flat list of pull requests.
    // Each pull request may be associated with multiple components, so flatMap them out:
    var flattenedwithComponents = _.flatten(_.map(this.prs, function(pr) {
      var arr = _.map(pr.components, function(component) {
        return {component: component, pr: pr}
      });

      arr.push({component: "All", pr: pr});
      return arr;
    }));

    // Group by component:
    var groupedByComponent = _.groupBy(flattenedwithComponents, function(x) {
      return x.component;
    });
    // Map the group values so that we're left with a map from component names
    // to pull requests in those components
    var groups = _.map(groupedByComponent, function(groupValues, component) {
      return [component, _.map(groupValues, function(v) {
        return v.pr
      })];
    });

    React.render(
      React.createElement(SubnavView, {
        elems: groups,
        active: this.selectedComponent,
        onSelect: this.onSelectComponent.bind(this)}),
      this.navbarDomContainer
    );

    groups = _.object(groups);
    React.render(
      React.createElement(PRTableView, {prs: groups[this.selectedComponent]}),
      this.prTableDomContainer
    );
  };

  Controller.prototype.refreshPrs = function() {
    var controller = this;
    $.ajax({
      url: this.prURL,
      dataType: 'json',
      async: false,
      success: function(newPrs) {
        controller.prs = newPrs;
        controller.render();
      }
    });
  };

  return Controller;

  });
