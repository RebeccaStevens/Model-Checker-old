(function(document) {
  'use strict';

  // Fix for IE11
  Number.parseInt = Number.parseInt || window.parseInt;
  Number.parseFloat = Number.parseFloat || window.parseFloat;

  // create a function for escaping regular expressions if there isn't already one
  window.escapeRegExp = window.escapeRegExp ||
    /**
     * Escape a regular expression string.
     *
     * @param {!String} str - the string to escape
     * @returns {!String} the escaped string
     */
    function(str) {
      return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
    };

  // create a replaceAll function for Strings if there isn't already one
  String.prototype.replaceAll = String.prototype.replaceAll ||
    /**
     * Replace all instances of a given string in this string.
     *
     * @param {!String} find - the string to replaceAll
     * @param {!String} replace - what to replace the string with
     * @returns {!String} the new string
     */
    function(find, replace) {
      return this.replace(new RegExp(window.escapeRegExp(find), 'g'), replace);
    };
})(document);
