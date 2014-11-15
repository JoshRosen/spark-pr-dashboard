define([
    'react',
    'jquery',
    'underscore'
  ],
  function (React, $, _) {
    "use strict";

    var NavEntry = React.createClass({displayName: 'NavEntry',
      propTypes: {
        active: React.PropTypes.bool.isRequired,
        onClick: React.PropTypes.func.isRequired,
        label: React.PropTypes.string.isRequired
      },
      render: function() {
        return (
          React.createElement("li", {className: this.props.active ? "subnav-active" : ""}, 
            React.createElement("a", {onClick: this.props.onClick}, 
              this.props.label
            )
          )
          );
      }
    });

    var SubnavView = React.createClass({displayName: 'SubnavView',
      propTypes: {
        elems: React.PropTypes.arrayOf(React.PropTypes.shape({
          label: React.PropTypes.string.isRequired,
          key: React.PropTypes.string.isRequired
        })),
        active: React.PropTypes.string.isRequired,
        onSelect: React.PropTypes.func.isRequired
      },
      onSelect: function(key) {
        this.props.onSelect(key)
      },
      render: function() {
        var outer = this;
        var navElements = _.map(this.props.elems, function(e) {
          var boundClick = outer.onSelect.bind(outer, e.key);
          return React.createElement(NavEntry, {label: e.label, key: e.key, onClick: boundClick, active: e.key == outer.props.active})}
        );
        return (
          React.createElement("nav", {className: "sub-nav navbar navbar-default", role: "navigation"}, 
            React.createElement("div", {className: "container-fluid"}, 
              React.createElement("ul", {className: "nav navbar-nav"}, 
                navElements
              )
            )
          )
          );
      }
    });

    return SubnavView;
  });