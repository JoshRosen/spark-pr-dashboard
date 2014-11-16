/**
 * Core entry point for the application
 */
define([
  'jquery',
  'marked',
  'jquery-timeago',
  'bootstrap'
],
function($, marked) {
  "use strict";

  // Called when a user clicks the "Test with Jenkins" button:
  function testJenkins(number) {
    return confirm("Are you sure you want to test PR " + number + " with Jenkins?");
  }

  // Initialization code to run on page load
  $(function() {
    // From http://stackoverflow.com/a/12138756
    // Gives anchor tags to the tabs, allowing users to bookmark specific views:
    var hash = window.location.hash;
    hash && $('ul.nav a[href="' + hash + '"]').tab('show');
  });

});
