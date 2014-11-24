// jscs:disable
define([
    'react',
    'jquery',
    'underscore',
    'views/MainNavigation',
    'views/SubNavigation',
    'views/PRTableView',
    'mixins/BookmarkMixin'
  ],
  function(React, $, _, MainNavigation, SubNavigation, PRTableView, BookmarkMixin) {
    "use strict";

    // jscs:enable
    var Dashboard = React.createClass({displayName: 'Dashboard',
      mixins: [BookmarkMixin],
      getInitialState: function() {
        return {prs: [], active: '', currentPrs: []};
      },

      componentDidMount: function() {
        var _this = this;

        $.ajax({
          url: '/search-open-prs',
          dataType: 'json',
          success: function(data) {
            _this._prepareData(data);
          }
        });
      },

      componentDidUpdate: function(prevProps, prevState) {
        if (prevState.active !== this.state.active) {
          this._filterPrsByComponent(this.state.active);
        }
      },

      _filterPrsByComponent: function(component) {
        var neededPrs = [],
            prs = this.state.prs;

        for (var i = 0; i < prs.length; i++) {
          if (prs[i].component == component) {
            neededPrs = prs[i].prs;
            break;
          }
        }

        this.setState({active: component, currentPrs: neededPrs});
      },

      _prepareData: function(prs) {
        var prsByComponent = {}, mainTab = "All";
        for (var i = 0; i < prs.length; i++) {
          var pr = prs[i];
          if (!prsByComponent.hasOwnProperty(mainTab)) {
            prsByComponent[mainTab] = [];
          }
          for (var j = 0; j < pr.components.length; j++) {
            var component = pr.components[j];
            if (!prsByComponent.hasOwnProperty(component)) {
              prsByComponent[component] = [];
            }
            prsByComponent[component].push(pr);
            prsByComponent[mainTab].push(pr);
          }
        }

        var result = _.map(prsByComponent, function(prs, component) {
          return {component: component, prs: prs, count: prs.length}
        });

        var tab = this._checkTabAvailability(prsByComponent);

        this.setState({prs: result, active: tab ? tab : mainTab});
      },

      _checkTabAvailability: function(prsByComponent) {
        var hash = window.location.hash.split('#');
        var anchor = hash.pop();

        for (var component in prsByComponent) {
          if (this.getAnchor(component) === anchor) {
            return component;
          }
        }
      },

      render: function() {
        var subNavigation, mainView;
        if (this.state.prs.length > 0) {
          subNavigation = (
            React.createElement(SubNavigation, {
              prs: this.state.prs, 
              active: this.state.active, 
              onClick: this._filterPrsByComponent}));
          mainView = (
            React.createElement("div", {className: "container-fluid"}, 
              React.createElement(PRTableView, {prs: this.state.currentPrs})
            ));
        }

        return (
          React.createElement("div", null, 
            React.createElement(MainNavigation, null), 
            subNavigation, 
            mainView
          )
        );
      }
    });


    return Dashboard;
  }
);
