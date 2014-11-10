define([
    'react',
    'jquery',
    'underscore',
    'marked'
  ],
  function (React, $, _) {
    "use strict";

    var hasJenkins = window.userinfo && _.contains(window.userinfo, "jenkins");

    var JIRALink = React.createClass({
      render: function() {
        return (
          <a href={"http://issues.apache.org/jira/browse/SPARK-" + this.props.number}
             target="_blank">
            {this.props.number}
          </a>
        )
      }
    });

    var CommenterButton = React.createClass({
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
          <span className={borderClass}>
            <img src={comment.avatar + "&s=16"}
                height="16"
                width="16"
                alt={username}/>
          </span>
        )
      }
    });

    var PRTableRow = React.createClass({
      render: function() {
        var pr = this.props.pr;
        var jiraLinks = _.map(pr.parsed_title.jiras, function(number) {
          return <JIRALink key={number} number={number}/>
        });
        var commenters = _.map(pr.commenters, function(comment) {
          return <CommenterButton key={comment.data.date} username={comment.username} comment={comment.data}/>
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
            <td sorttable_customkey={pr.user.toLowerCase()}>
              <a href={"/users/" + pr.user}>
                {pr.user}
              </a>
            </td>
            <td sorttable_customkey={pr.commenters.size}>
              {commenters}
            </td>
            <td sorttable_customkey={pr.lines_changed}>
              <span className="lines-added">+{pr.lines_added}</span>
              <span className="lines-deleted">-{pr.lines_deleted}</span>
            </td>
            <td sorttable_customkey={pr.is_mergeable}>
              {pr.is_mergeable ? <i className="glyphicon glyphicon-ok"></i> : <i className="glyphicon glyphicon-remove"></i> }
            </td>
          </tr>
        );
      }
    });

    var PRTableView = React.createClass({
      render: function() {
        // var hasJenkins = window.userinfo && _.contains(window.userinfo, "jenkins");
        var tableRows = _.map(this.props.prs, function(pr) {
          return <PRTableRow key={pr.number} pr={pr}/>
        });
        return (
          <table className="table table-condensed">
            <tr>
              <th className="sorttable_numeric">Number</th>
              <th>JIRAs</th>
              <th>Title</th>
              <th>Author</th>
              <th>Commenters</th>
              <th>Changes</th>
              <th>Merges</th>
              <th>Jenkins</th>
              <th>Updated</th>
              {hasJenkins ? <th className="sorttable_nosort">Tools</th> : ''}
            </tr>
            {tableRows}
          </table>
        );
      },
      componentDidMount: function() {
        sorttable.makeSortable(this.getDOMNode());
      }
    });

    return PRTableView;
  });