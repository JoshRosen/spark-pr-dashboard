define([
    'react',
    'jquery',
    'underscore',
    'marked'
  ],
  function (React, $, _) {
    "use strict";

    var hasJenkins = window.userinfo && _.contains(window.userinfo, "jenkins");

    var JIRALink = React.createClass({displayName: 'JIRALink',
      render: function() {
        return (
          React.createElement("a", {href: "http://issues.apache.org/jira/browse/SPARK-" + this.props.number, 
             target: "_blank"}, 
            this.props.number
          )
        )
      }
    });

    var CommenterButton = React.createClass({displayName: 'CommenterButton',
      render: function() {
        var comment = this.props.comment;
        var username = this.props.username;
        var borderClass = '';
        if (comment.said_lgtm) {
          borderClass = "lgtm"
        } else if (comment.asked_to_close) {
          borderClass = "asked-to-close"
        }
        return (
          React.createElement("span", {className: borderClass}, 
            React.createElement("img", {src: comment.avatar + "&s=16", 
                height: "16", 
                width: "16", 
                alt: username})
          )
        )
      }
    });

    var PRTableRow = React.createClass({displayName: 'PRTableRow',
      render: function() {
        var pr = this.props.pr;
        var jiraLinks = _.map(pr.parsed_title.jiras, function(number) {
          return React.createElement(JIRALink, {key: number, number: number})
        });
        var commenters = _.map(pr.commenters, function(comment) {
          return React.createElement(CommenterButton, {key: comment.data.date, username: comment.username, comment: comment.data})
        });
        return (
          React.createElement("tr", null, 
            React.createElement("td", null, React.createElement("a", {href: "https://www.github.com/apache/spark/pull/" + pr.number, target: "_blank"}, 
              pr.number
            )), 
            React.createElement("td", null, jiraLinks), 
            React.createElement("td", null, 
              React.createElement("a", {href: "https://www.github.com/apache/spark/pull/" + pr.number, target: "_blank"}, 
                pr.parsed_title.metadata + pr.parsed_title.title
              )
            ), 
            React.createElement("td", {sorttable_customkey: pr.user.toLowerCase()}, 
              React.createElement("a", {href: "/users/" + pr.user}, 
                pr.user
              )
            ), 
            React.createElement("td", {sorttable_customkey: pr.commenters.size}, 
              commenters
            ), 
            React.createElement("td", {sorttable_customkey: pr.lines_changed}, 
              React.createElement("span", {className: "lines-added"}, "+", pr.lines_added), 
              React.createElement("span", {className: "lines-deleted"}, "-", pr.lines_deleted)
            ), 
            React.createElement("td", {sorttable_customkey: pr.is_mergeable}, 
              pr.is_mergeable ? React.createElement("i", {className: "glyphicon glyphicon-ok"}) : React.createElement("i", {className: "glyphicon glyphicon-remove"})
            )
          )
        );
      }
    });

    var PRTableView = React.createClass({displayName: 'PRTableView',
      render: function() {
        // var hasJenkins = window.userinfo && _.contains(window.userinfo, "jenkins");
        var tableRows = _.map(this.props.prs, function(pr) {
          return React.createElement(PRTableRow, {key: pr.number, pr: pr})
        });
        return (
          React.createElement("table", {className: "table table-condensed"}, 
            React.createElement("tr", null, 
              React.createElement("th", {className: "sorttable_numeric"}, "Number"), 
              React.createElement("th", null, "JIRAs"), 
              React.createElement("th", null, "Title"), 
              React.createElement("th", null, "Author"), 
              React.createElement("th", null, "Commenters"), 
              React.createElement("th", null, "Changes"), 
              React.createElement("th", null, "Merges"), 
              React.createElement("th", null, "Jenkins"), 
              React.createElement("th", null, "Updated"), 
              hasJenkins ? React.createElement("th", {className: "sorttable_nosort"}, "Tools") : ''
            ), 
            tableRows
          )
        );
      },
      componentDidMount: function() {
        sorttable.makeSortable(this.getDOMNode());
      }
    });

    return PRTableView;
  });