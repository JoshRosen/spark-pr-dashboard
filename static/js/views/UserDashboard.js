// jscs:disable
define([
    'react',
    'jquery',
    'underscore',
    'views/PRTableView'
  ],
  function(React, $, _, PRTableView) {
    "use strict";

    // jscs:enable
    var UserDashboard = React.createClass({displayName: 'UserDashboard',
      getInitialState: function() {
        return {prsAuthored: [], prsCommentedOn: []};
      },

      componentWillMount: function() {
        if (this.props.username !== '') {
          this._prepareData(this.props.prs);
        }
      },

      componentWillReceiveProps: function(nextProps) {
        if (nextProps.username !== '') {
          this._prepareData(nextProps.prs);
        }
      },

      _prepareData: function(prs) {
        var username = this.props.username;
        var prsAuthored = [], prsCommentedOn = [];
        for (var i = 0; i < prs.length; i++) {
          if (prs[i].user === username) {
            prsAuthored.push(prs[i]);
          } else {
            var commenters = prs[i].commenters;
            for (var j = 0; j < commenters.length; j++) {
              if (commenters[j].username === username) {
                prsCommentedOn.push(prs[i]);
                break;
              }
            }
          }
        }

        this.setState({prsAuthored: prsAuthored, prsCommentedOn: prsCommentedOn});
      },

      render: function() {
        var viewAuthored, viewCommentedOn;
        if (this.state.prsAuthored.length > 0) {
          viewAuthored = (
            React.createElement("div", null, 
              React.createElement("h3", null, "PRs authored by ", this.props.username), 
              React.createElement(PRTableView, {prs: this.state.prsAuthored})
            )
          );
        }

        if (this.state.prsCommentedOn.length > 0) {
          viewCommentedOn = (
            React.createElement("div", null, 
              React.createElement("h3", null, "PRs commented on by ", this.props.username), 
              React.createElement(PRTableView, {prs: this.state.prsCommentedOn})
            )
          );
        }
        return (
          React.createElement("div", {className: "container-fluid"}, 
            viewAuthored, 
            viewCommentedOn
          )
        );
      }
    });

    return UserDashboard;
  }
);
