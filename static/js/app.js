// jscs:disable
/**
 * Core entry point for the application
 */
define([
  'jquery',
  'marked',
  'jquery-timeago',
  'react',
  'views/Dashboard'
],
function($, marked) {
  "use strict";

  // jscs:enable
  // Called when a user clicks the "Test with Jenkins" button:
  function testJenkins(number) {
    return confirm("Are you sure you want to test PR " + number + " with Jenkins?");
  }

  // Initialization code to run on page load
  $(function() {
    var React = require('react');
    var Dashboard = require('views/Dashboard');

    React.render(Dashboard(), $('#dashboard')[0]);
  });

});
