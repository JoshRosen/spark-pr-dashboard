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
        return {username: this.props.username, prsAuthored: [], prsCommentedOn: []};
      },

      componentDidMount: function() {
        if (this.state.username !== '') {
          this._prepareData(this.props.prs);
        }
      },

      componentDidUpdate: function(prevProps, prevState) {
        if (prevProps.username !== this.props.username && this.props.username !== "") {
          this._prepareData(this.props.prs);
        }
      },

      componentWillReceiveProps: function(nextProps) {
        this.setState({username: nextProps.username});
      },

      _prepareData: function(prs) {
        var username = this.state.username;
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
              <h3>PRs authored by {this.state.username}</h3>
              <PRTableView prs={this.state.prsAuthored}/>
            </div>
          );
        }

        if (this.state.prsCommentedOn.length > 0) {
          viewCommentedOn = (
            <div>
              <h3>PRs commented on by {this.state.username}</h3>
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
