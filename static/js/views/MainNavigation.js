// jscs:disable
define([
    'react',
    'jquery'
  ],
  function(React, $) {
    "use strict";

    // jscs:enable
    var GitHubUser = React.createClass({displayName: 'GitHubUser',
      render: function() {
        var link = "/users/" + this.props.username;
        return (
          React.createElement("p", {className: "nav navbar-text"}, 
            "Signed in as", 
            React.createElement("a", {href: link, className: "navbar-link"}, this.props.username)
          )
        );
      }
    });

    var GitHubLogin = React.createClass({displayName: 'GitHubLogin',
      render: function() {
        return (
          React.createElement("a", {href: "/login", className: "btn btn-default navbar-btn"}, 
            React.createElement("span", {className: "octicon octicon-sign-in"}), " Sign in"
          )
        );
      }
    });

    var GitHubLogout = React.createClass({displayName: 'GitHubLogout',
      render: function() {
        return (
          React.createElement("a", {href: "/logout", className: "btn btn-default navbar-btn"}, 
            React.createElement("span", {className: "octicon octicon-sign-out"}), " Sign out"
          )
        );
      }
    });

    var MainNavigation = React.createClass({displayName: 'MainNavigation',
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
          React.createElement("span", {className: "badge"}, 
            this.state.openPrsCount
          ));

        var githubUser, githubAction;
        if (this.state.user !== null) {
          githubUser = React.createElement(GitHubUser, {username: this.state.user.github_login});
          githubAction = React.createElement(GitHubLogout, null);
        } else {
          githubAction = React.createElement(GitHubLogin, null);
        }

        return (
          React.createElement("nav", {id: "main-nav", className: "navbar navbar-default", 
            role: "navigation"}, 
            React.createElement("div", {className: "container-fluid"}, 
              React.createElement("div", {className: "navbar-header"}, 
                React.createElement("a", {className: "navbar-brand", href: "/"}, 
                  "Spark Pull Requests"
                )
              ), 

              React.createElement("ul", {className: "nav navbar-nav"}, 
                React.createElement("li", {className: "active"}, 
                  React.createElement("a", {href: "/"}, 
                    "Open PRs by Component ", countPrsBadge
                  )
                )
              ), 
              React.createElement("div", {className: "pull-right"}, 
                githubUser, 
                React.createElement("a", {href: "https://github.com/databricks/spark-pr-dashboard", 
                  className: "btn btn-success navbar-btn"}, 
                  React.createElement("span", {className: "octicon octicon-mark-github"}), 
                  "Fork me on GitHub"
                ), 
                githubAction
              )
            )
          )
        );
      }
    });

    return MainNavigation;
  }
);
