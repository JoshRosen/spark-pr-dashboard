// jscs:disable
define([
    'react',
    'jquery',
    'underscore',
    'views/MainNavigation',
    'views/SubNavigation',
    'views/PRTableView'
  ],
  function(React, $, _) {
    "use strict";

    var MainNavigation = require('views/MainNavigation');
    var SubNavigation = require('views/SubNavigation');
    var PRTableView = require('views/PRTableView');
    var _ = require('underscore');

    // jscs:enable
    var Dashboard = React.createClass({
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
        var prsByComponent = {};
        for (var i = 0; i < prs.length; i++) {
          var pr = prs[i];
          if (!prsByComponent.hasOwnProperty('All')) {
            prsByComponent['All'] = [];
          }
          for (var j = 0; j < pr.components.length; j++) {
            var component = pr.components[j];
            if (!prsByComponent.hasOwnProperty(component)) {
              prsByComponent[component] = [];
            }
            prsByComponent[component].push(pr);
            prsByComponent['All'].push(pr);
          }
        }

        var result = _.map(prsByComponent, function(prs, component) {
          return {component: component, prs: prs, count: prs.length}
        });

        this.setState({prs: result, active: 'All'});
      },

      render: function() {
        var subNavigation, mainView;
        if (this.state.prs.length > 0) {
          subNavigation = <SubNavigation prs={this.state.prs} active={this.state.active} onClick={this._filterPrsByComponent}/>;
          mainView = (<div className="container-fluid">
            <PRTableView prs={this.state.currentPrs}/>
          </div>);
        }

        return (
          <div>
            <MainNavigation/>
            {subNavigation}
            {mainView}
          </div>
        );
      }
    });


    return Dashboard;
  }
);