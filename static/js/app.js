/**
 * Core entry point for the application
 */
define([
  'jquery',
  'marked',
  'jquery-timeago',
  'bootstrap'
],
function ($, marked) {
  "use strict";

  // Called when a user clicks the "Test with Jenkins" button:
  function test_jenkins(number) {
    return confirm("Are you sure you want to test PR " + number + " with Jenkins?");
  }

  // Initialization code to run on page load
  $(function() {
    // From http://stackoverflow.com/a/12138756
    // Gives anchor tags to the tabs, allowing users to bookmark specific views:
    var hash = window.location.hash;
    hash && $('ul.nav a[href="' + hash + '"]').tab('show');

    $('.nav-tabs a').click(function (e) {
      $(this).tab('show');
      var scrollmem = $('body').scrollTop();
      window.location.hash = this.hash;
      $('html,body').scrollTop(scrollmem);
    });

    // Convert timestamps to human-readable dates
    $("abbr.timeago").timeago();

    // Display popovers that render Markdown content
    $('.markdown-popover').popover({
      trigger: "click",
      placement: "left",
      html: true,
      content: function () {
        return marked($(this).data("markdown"));
      }
    });

    // From http://stackoverflow.com/a/15670200/590203
    // Only allow one popover to be displayed at a time, and hide popovers
    // when clicking outside of them:
    $('html').on('mouseup', function (e) {
      if (!$(e.target).closest('.popover').length) {
        $('.popover').each(function () {
          $(this.previousSibling).popover('hide');
        });
      }
    });

  });

});