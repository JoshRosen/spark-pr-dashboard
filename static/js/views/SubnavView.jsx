define([
    'react',
    'jquery',
    'underscore'
  ],
  function (React, $, _) {
    "use strict";

    var NavEntry = React.createClass({
      render: function() {
        return (
          <li className={this.props.active ? "subnav-active" : ""}>
            <a onClick={this.props.onClick}>
              {this.props.label}
            </a>
          </li>
          );
      }
    });

    var SubnavView = React.createClass({
      onSelect: function(key) {
        this.props.onSelect(key)
      },
      render: function() {
        var outer = this;
        var navElements = _.map(this.props.elems, function(e) {
          var boundClick = outer.onSelect.bind(outer, e.key);
          return <NavEntry label={e.label} key={e.key} onClick={boundClick} active={e.key == outer.props.active}/>}
        );
        return (
          <nav className="sub-nav navbar navbar-default" role="navigation">
            <div className="container-fluid">
              <ul className="nav navbar-nav">
                {navElements}
              </ul>
            </div>
          </nav>
          );
      }
    });

    return SubnavView;
  });