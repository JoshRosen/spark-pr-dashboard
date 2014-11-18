// jscs:disable
define([
    'react',
    'jquery',
    'underscore'
  ],
  function(React, $, _) {
    "use strict";

    // jscs:enable
    var NavEntry = React.createClass({
      propTypes: {
        active: React.PropTypes.bool.isRequired,
        onClick: React.PropTypes.func.isRequired,
        label: React.PropTypes.string.isRequired
      },
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
      propTypes: {
        elems: React.PropTypes.arrayOf(React.PropTypes.shape({
          label: React.PropTypes.string.isRequired,
          key: React.PropTypes.string.isRequired
        })),
        active: React.PropTypes.string.isRequired,
        onSelect: React.PropTypes.func.isRequired
      },
      onSelect: function(key) {
        this.props.onSelect(key);
      },
      render: function() {
        var outer = this;
        var navElements = _.map(this.props.elems, function(e) {
          var boundClick = outer.onSelect.bind(outer, e.key);
          return (<NavEntry
            label={e.label}
            key={e.key}
            onClick={boundClick}
            active={e.key == outer.props.active}/>);
        });
        return (
          <nav className="sub-nav navbar navbar-default"
            role="navigation">
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
  }
);
