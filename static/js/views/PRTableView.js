// jscs:disable
define([
    'react',
    'jquery',
    'underscore'
  ],
  function(React, $, _) {
    "use strict";

    // jscs:enable
    // TODO:
    var hasJenkins = window.userinfo && _.contains(window.userinfo, "jenkins");

    var JIRALink = React.createClass({displayName: 'JIRALink',
      render: function() {
        var link = "http://issues.apache.org/jira/browse/SPARK-" + this.props.number;
        return (
          React.createElement("a", {href: link, target: "_blank"}, 
            this.props.number
          )
        );
      }
    });

    var Commenter = React.createClass({displayName: 'Commenter',
      componentDidMount: function() {
        $(this.refs.commenter.getDOMNode()).popover();
      },

      render: function() {
        var comment = this.props.comment;
        var username = this.props.username;
        var commenterClass = "commenter commenter-icon";

        if (comment.said_lgtm) {
          commenterClass += " lgtm";
        } else if (comment.asked_to_close) {
          commenterClass += " asked-to-close";
        }

        var title = "<a href='" + comment.url + "'>Comment</a> from <a href='/users/" +
          username + "'>" + username + "</a>";
        var marked = require('marked');
        var content = marked(comment.body);

        return (
          React.createElement("img", {ref: "commenter", tabIndex: "0", className: commenterClass, 
            src: comment.avatar + "&s=16", alt: username, 'data-toggle': "popover", 
            'data-trigger': "focus", 'data-placement': "left", 'data-html': "true", 
            'data-title': title, 'data-content': content})
        );
      }
    });

    var PRTableColumnHeader = React.createClass({displayName: 'PRTableColumnHeader',
      propTypes: {
        name: React.PropTypes.string.isRequired,
        sortable: React.PropTypes.bool.isRequired,
        onSort: React.PropTypes.func.isRequired,
        sortDirection: React.PropTypes.oneOf(['asc', 'desc', 'unsorted'])
      },
      getDefaultProps: function() {
        return {
          sortable: true,
          sortDirection: 'unsorted'
        };
      },
      sortDirectionIndicator: function() {
        if (this.props.sortDirection === 'asc') {
          return React.createElement("span", null, " ▾");
        } else if (this.props.sortDirection === 'desc') {
          return React.createElement("span", null, " ▴");
        } else {
          return '';
        }
      },
      onSort: function() {
        this.props.onSort(this.props.name);
      },
      render: function() {
        return (
          React.createElement("th", {onClick: this.onSort}, 
            this.props.name, " ", this.sortDirectionIndicator()
          )
        );
      }
    });

    var PRTableRow = React.createClass({displayName: 'PRTableRow',
      render: function() {
        var pr = this.props.pr;
        var jiraLinks = _.map(pr.parsed_title.jiras, function(number) {
          return React.createElement(JIRALink, {key: number, number: number});
        });

        var commenters = _.map(pr.commenters, function(comment) {
          return (
            React.createElement(Commenter, {
              key: comment.data.date, 
              username: comment.username, 
              comment: comment.data})
          );
        });

        var mergeIcon = (pr.is_mergeable ?
          React.createElement("i", {className: "glyphicon glyphicon-ok"}) :
          React.createElement("i", {className: "glyphicon glyphicon-remove"}));

        var pullLink = "https://www.github.com/apache/spark/pull/" + pr.number;

        return (
          React.createElement("tr", null, 
            React.createElement("td", null, 
              React.createElement("a", {href: pullLink, target: "_blank"}, 
              pr.number
              )
            ), 
            React.createElement("td", null, jiraLinks), 
            React.createElement("td", null, 
              React.createElement("a", {href: pullLink, target: "_blank"}, 
                pr.parsed_title.metadata + pr.parsed_title.title
              )
            ), 
            React.createElement("td", null, 
              React.createElement("a", {href: "/users/" + pr.user}, 
                pr.user
              )
            ), 
            React.createElement("td", null, 
              commenters
            ), 
            React.createElement("td", null, 
              React.createElement("span", {className: "lines-added"}, "+", pr.lines_added), 
              React.createElement("span", {className: "lines-deleted"}, "-", pr.lines_deleted)
            ), 
            React.createElement("td", null, 
              mergeIcon
            )
          )
        );
      }
    });

    var PRTableView = React.createClass({displayName: 'PRTableView',
      propTypes: {
        prs: React.PropTypes.array.isRequired
      },
      getInitialState: function() {
        return {sortCol: '', sortDirection: 'unsorted'}
      },
      componentWillReceiveProps: function(newProps) {
        this.doSort(this.state.sortCol, this.state.sortDirection, newProps.prs);
      },
      sortFunctions:  {
        'Number': function(pr) { return pr.number; },
        'JIRAs': function(pr) { return pr.parsed_title.jiras; },
        'Title': function(pr) { return pr.parsed_title.metadata + pr.parsed_title.title; },
        'Author': function(pr) { return pr.user.toLowerCase(); },
        'Commenters': function(pr) { return pr.commenters.length; },
        'Changes': function(pr) { return pr.lines_changed; },
        'Merges': function(pr) { return pr.is_mergeable; },
        'Jenkins': function(pr) { return pr.last_jenkins_outcome; }
      },
      doSort: function(sortCol, sortDirection, sortedPrs) {
        // Sort the PRs in this table and update its state
        var newSortedPrs = _.sortBy(sortedPrs, this.sortFunctions[sortCol]);
        if (sortDirection === 'desc') {
          newSortedPrs.reverse();
        }
        this.setState({sortCol: sortCol, sortDirection: sortDirection, sortedPrs: newSortedPrs});
      },
      onSort: function(sortCol) {
        // Callback when a user clicks on a column header to perform a sort.
        // Handles the logic of toggling sort directions
        var sortDirection;
        if (sortCol === this.state.sortCol) {
          if (this.state.sortDirection === 'unsorted' || this.state.sortDirection === 'asc') {
            sortDirection = 'desc';
          } else if (this.state.sortDirection === 'desc') {
            sortDirection = 'asc';
          }
        } else {
          sortDirection = 'desc'
        }
        this.doSort(sortCol, sortDirection, this.state.sortedPrs);
      },
      render: function() {
        var tableRows = _.map(this.state.sortedPrs, function(pr) {
          return React.createElement(PRTableRow, {key: pr.number, pr: pr})
        });
        var outer = this;
        var tableHeaders = _.map(
          ["Number",
            "JIRAs",
            "Title",
            "Author",
            "Commenters",
            "Changes",
            "Merges",
            "Jenkins",
            "Updated"], function(colName) {
          var sortDirection = (colName === outer.state.sortCol ?
            outer.state.sortDirection :
            'unsorted');

          return (
            React.createElement(PRTableColumnHeader, {
              key: colName, 
              name: colName, 
              onSort: outer.onSort, 
              sortDirection: sortDirection}));
        });
        return (
          React.createElement("table", {className: "table table-condensed"}, 
            React.createElement("tbody", null, 
              React.createElement("tr", null, tableHeaders), 
              tableRows
            )
          )
        );
      }
    });

    return PRTableView;
  }
);
