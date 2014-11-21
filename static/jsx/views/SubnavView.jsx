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
        elems: React.PropTypes.array,
        active: React.PropTypes.string.isRequired,
        onSelect: React.PropTypes.func.isRequired
      },
      componentDidMount: function() {
        this.props.onSelect("All");
      },
      onSelect: function(key) {
        this.props.onSelect(key);
      },
      render: function() {
        var outer = this;
        var navElements = [];

        //sort by count of prs
        var elems = this.props.elems;
        elems.sort(function(arr1, arr2) {
          return _.last(arr2).length - _.last(arr1).length;
        });

        for (var i = 0; i < elems.length; i++) {
          var component = _.first(elems[i]);
          var prsLength = _.last(elems[i]).length;
          var boundClick = outer.onSelect.bind(outer, component);
          var label = component + " (" + prsLength + ")";

          navElements.push(<NavEntry
            label={label}
            key={component}
            onClick={boundClick}
            active={component == outer.props.active}/>);
        }

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
