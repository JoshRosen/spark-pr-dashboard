// jscs:disable
define([
    'react',
    'jquery'
  ],
  function(React, $, _) {
    "use strict";

    // jscs:enable
    var GitHubUser = React.createClass({
      render: function() {
        var link = "/users/" + this.props.username;
        return (
          <p className="nav navbar-text">
            Signed in as
            <a href={link} className="navbar-link">{this.props.username}</a>
          </p>
        );
      }
    });

    var GitHubLogin = React.createClass({
      render: function() {
        return (
          <a href="/login" className="btn btn-default navbar-btn">
            <span className="octicon octicon-sign-in"></span> Sign in
          </a>
        );
      }
    });

    var GitHubLogout = React.createClass({
      render: function() {
        return (
          <a href="/logout" className="btn btn-default navbar-btn">
            <span className="octicon octicon-sign-out"></span> Sign out
          </a>
        );
      }
    });

    var MainNavigation = React.createClass({
      getInitialState: function() {
        return {openPrsCount: 0, user: null};
      },

      componentDidMount: function() {
        var _this = this;
        $.ajax({
          url: '/prs-meta',
          dataType: 'json',
          success: function(data) {
            _this.setState(data);
          }
        });
      },

      render: function() {
        var countPrsBadge = (
          <span className="badge">
            {this.state.openPrsCount}
          </span>);

        var githubUser, githubAction;
        if (this.state.user !== null) {
          githubUser = <GitHubUser username={this.state.user.github_login}/>;
          githubAction = <GitHubLogout/>;
        } else {
          githubAction = <GitHubLogin/>;
        }

        return (
          <nav id="main-nav" className="navbar navbar-default"
            role="navigation">
            <div className="container-fluid">
              <div className="navbar-header">
                <a className="navbar-brand" href="/">
                  Spark Pull Requests
                </a>
              </div>

              <ul className="nav navbar-nav">
                <li className="active">
                  <a href="/">
                    Open PRs by Component {countPrsBadge}
                  </a>
                </li>
              </ul>
              <div className="pull-right">
                {githubUser}
                <a href="https://github.com/databricks/spark-pr-dashboard"
                  className="btn btn-success navbar-btn">
                  <span className="octicon octicon-mark-github"></span>
                  Fork me on GitHub
                </a>
                {githubAction}
              </div>
            </div>
          </nav>
        );
      }
    });

    return MainNavigation;
  }
);
