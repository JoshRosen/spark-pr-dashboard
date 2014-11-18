define([
    'react',
    'jquery',
    'underscore'
  ],
  function (React, $, _) {
    "use strict";

    // TODO:
    var hasJenkins = window.userinfo && _.contains(window.userinfo, "jenkins");

    var JIRALink = React.createClass({
      render: function() {
        return (
          <a href={"http://issues.apache.org/jira/browse/SPARK-" + this.props.number}
             target="_blank">
            {this.props.number}
          </a>
        );
      }
    });

    var CommenterButton = React.createClass({
      render: function() {
        var comment = this.props.comment;
        var username = this.props.username;
        var commenterClass = "commenter";
        if (comment.said_lgtm) {
          commenterClass += " lgtm";
        } else if (comment.asked_to_close) {
          commenterClass += " asked-to-close";
        }
        return (
          <img className={commenterClass} src={comment.avatar + "&s=16"} alt={username}/>
        );
      }
    });

    var PRTableColumnHeader = React.createClass({
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
      sortDirectionIndicator: function () {
        if (this.props.sortDirection === 'asc') {
          return <span>&nbsp;▾</span>;
        } else if (this.props.sortDirection === 'desc') {
          return <span>&nbsp;▴</span>;
        } else {
          return '';
        }
      },
      onSort: function() {
        this.props.onSort(this.props.name);
      },
      render: function() {
        return <th onClick={this.onSort}>{this.props.name} {this.sortDirectionIndicator()}</th>;
      }
    });

    var PRTableRow = React.createClass({
      render: function() {
        var pr = this.props.pr;
        var jiraLinks = _.map(pr.parsed_title.jiras, function(number) {
          return <JIRALink key={number} number={number}/>;
        });
        var commenters = _.map(pr.commenters, function(comment) {
          return (<CommenterButton
            key={comment.data.date}
            username={comment.username}
            comment={comment.data}/>);
        });
        return (
          <tr>
            <td><a href={"https://www.github.com/apache/spark/pull/" + pr.number} target="_blank">
              {pr.number}
            </a></td>
            <td>{jiraLinks}</td>
            <td>
              <a href={"https://www.github.com/apache/spark/pull/" + pr.number} target="_blank">
                {pr.parsed_title.metadata + pr.parsed_title.title}
              </a>
            </td>
            <td>
              <a href={"/users/" + pr.user}>
                {pr.user}
              </a>
            </td>
            <td>
              {commenters}
            </td>
            <td>
              <span className="lines-added">+{pr.lines_added}</span>
              <span className="lines-deleted">-{pr.lines_deleted}</span>
            </td>
            <td>
              {pr.is_mergeable ? <i className="glyphicon glyphicon-ok"></i> : <i className="glyphicon glyphicon-remove"></i> }
            </td>
          </tr>
        );
      }
    });

    var PRTableView = React.createClass({
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
      doSort: function (sortCol, sortDirection, sortedPrs) {
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
          return <PRTableRow key={pr.number} pr={pr}/>
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
          var sortDirection =
              colName === outer.state.sortCol ? outer.state.sortDirection : 'unsorted';
          return (<PRTableColumnHeader
            onSort={outer.onSort}
            key={colName}
            name={colName}
            sortDirection={sortDirection} />);
        });
        return (
          <table className="table table-condensed">
            <tbody>
              <tr>{tableHeaders}</tr>
              {tableRows}
            </tbody>
          </table>
        );
      }
    });

    return PRTableView;
  });