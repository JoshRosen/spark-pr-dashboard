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
    var UserDashboard = React.createClass({
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
            <div>
              <h3>PRs authored by {this.props.username}</h3>
              <PRTableView prs={this.state.prsAuthored}/>
            </div>
          );
        }

        if (this.state.prsCommentedOn.length > 0) {
          viewCommentedOn = (
            <div>
              <h3>PRs commented on by {this.props.username}</h3>
              <PRTableView prs={this.state.prsCommentedOn}/>
            </div>
          );
        }
        return (
          <div className="container-fluid">
            {viewAuthored}
            {viewCommentedOn}
          </div>
        );
      }
    });

    return UserDashboard;
  }
);
