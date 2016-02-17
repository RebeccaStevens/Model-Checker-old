(function(document) {
  'use strict';

  /**
   * Create the methods and initialise fields of the app.
   */
  function setupAppClass() {
    // Grab a reference to our auto-binding template and set it up
    var app = document.querySelector('#app');

    /*
     * Methods
     *
     * Define the methods before initialising the fields.
     */

    /**
     * Compile the code in the text editor.
     * Create and display the automata.
     *
     * @param {Boolean} [build=false] - If true automata will be build, otherwise only compiled
     */
    app.compile = function(build) {
      build = build || false;

      // debounce multiple compile calls in to one
      app.debounce('compile', function() {
        var compileStartTime = (new Date()).getTime();

        app.$.editor.clearAnnotations();

        var code = app.getCode();

        if (!build) {
          // if there is nothing to parse then do not continue
          if (code.length === 0) {
            app.$.console.clear();
            app.automata = [];
            app.previousCode = '';
            return;
          }

          // if the code has not changed then do not continue
          if (code === app.previousCode) {
            return;
          }
        }

        app.$.console.clear();
        app.$.console.log('Compiling...');
        app.previousCode = code;

        // re-get code to ensure correct line positions for annotations and error highlighting
        code = app.$.editor.code;

        var automata = [];
        var operations;
        var positions;

        try {
          var result = app.$.parser.parse(code, app.settings.liveBuilding, app.settings.fairAbstraction);
          automata = result.automata;
          operations = result.operations.operations;
          positions = result.operations.positions;
        } catch (e) {
          var buildErrorMessage = function(e) {
            return e.location !== undefined ?
              'on line ' + e.location.start.line + ', col ' + e.location.start.column + ' - ' + e.message :
              e.message;
          };

          var isInterpreterException = e.constructor === app.$.parser.InterpreterException;
          var prefix = isInterpreterException ? 'Error: ' : 'Syntax error ';

          var compileTime = Math.max(1, ((new Date()).getTime() - compileStartTime)) / 1000;
          app.$.console.clear(1);
          app.$.console.log('Compulation failed after ' + compileTime.toFixed(3) + ' seconds.');
          app.$.console.error(prefix + buildErrorMessage(e));
          return;
        }

        var compileTime = Math.max(1, ((new Date()).getTime() - compileStartTime)) / 1000;
        app.$.console.clear(1);
        app.$.console.log('Compiled successfully in ' + compileTime.toFixed(3) + ' seconds.');

        // only print out operations results if the were operations performed
        if (operations.length > 0) {
          app.$.console.log('Operations:');
          for (var i = 0; i < operations.length; i++) {
            app.$.console.log('  ' + operations[i]);
            // skip over the display of totals
            if (i !== 0) {
              var pos = positions[i - 1];
              var line = pos.start.line - 1;
              app.$.editor.addAnnotation(line, operations[i], 'info');
            }
          }
          app.$.console.log();
        }

        // only render if live building is checked or the compile and build button was pressed
        if (app.settings.liveBuilding || build) {
          app.build(automata);
        }
      });
    };

    /**
     * Build / render the automata.
     *
     * @param {Automaton[]} automata - automata to build
     */
    app.build = function(automata) {
      if (automata.length > 0) {
        app.$.console.log('Rendering...');

        var renderStartTime = (new Date()).getTime();

        // listen for each rendered event.
        // once all automata have been rendered, log the results and stop listening.
        var automataRendered = 0;
        var renderComplete = function() {
          automataRendered++;
          if (automataRendered === app.automata.length) {
            var renderTime = Math.max(1, ((new Date()).getTime() - renderStartTime)) / 1000;
            app.$.console.clear(1);
            app.$.console.log('Rendered successfully in ' + renderTime.toFixed(3) + ' seconds.');

            document.removeEventListener('automaton-renderer-rendered', renderComplete);
          }
        };

        document.addEventListener('automaton-renderer-rendered', renderComplete);
      }

      app.set('automata', automata);  // set app.automata - this will trigger the rendering process
    };

    /**
     * Compiles and builds what has currenty been entered into the text-editor.
     * Ignores whether or not live compile and build are currently set.
     */
    app.compileAndBuild = function() {
      app.compile(true);
    };

    /**
     * Gets and returns the code from the editor. Strips the code of all whitespace
     * and unnecessary line breaks.
     *
     * @return {String} - the code
     */
    app.getCode = function() {
      var code = '';
      var temp = app.$.editor.code;

      // remove white space and line breaks
      temp = temp.replace(/ /g, '');

      // remove unnecessary whitespace
      var split = temp.split('\n');
      for (var i = 0; i < split.length; i++) {
        if (split[i] !== '') {
          code += split[i] + '\n';
        }
      }

      return code;
    };

    /**
     * Open a text file from the user's computer and set the text-editor's code
     * to the text in that file.
     */
    app.openFile = function() {
      var opener = app.$['open-file'];
      opener.click();
      opener.onchange = function(e) {
        if (opener.value === '') {
          return;
        }
        var input = e.target;
        var reader = new FileReader();
        reader.onload = function() {
          var text = reader.result;
          app.$.editor.code = text;
          app.$.editor.focus();
        };
        reader.readAsText(input.files[0]);
        opener.value = '';
      };
    };

    /**
     * Save to code the user has written to their computer (as a download).
     */
    app.downloadFile = function() {
      var filename = app.$.filename.value;

      // if filename has not been defined, set it to untitled
      if (filename === '') {
        filename = 'untitled';
      }

      var blob = new Blob(
        [app.$.editor.code],
        {type: 'text/plain;charset=utf-8'});
      saveAs(blob, filename + '.txt');
    };

    /**
     * Open the settings dialog.
     */
    app.showSettings = function() {
      var dialog = app.$['settings-dialog'];
      dialog.open();
    };

    /**
     * Called when the settings dialog is opened.
     */
    app.onSettingsOpened = function() {
      var dialog = app.$['settings-dialog'];

      var d = Polymer.dom(dialog);

      // set the values displayed to what they actually are.
      // Note: can't use `app.$['...']` syntax here as these element where not in the dom from the beginning.
      d.querySelector('#settings-live-compiling').checked = app.settings.liveCompiling;
      d.querySelector('#settings-live-building').checked = app.settings.liveBuilding;
      d.querySelector('#settings-fair-abstraction').checked = app.settings.fairAbstraction;

      d.querySelector('#settings-editor-wrap').checked = app.$.editor.wrap;
      d.querySelector('#settings-editor-soft-tabs').checked = app.$.editor.softTabs;
      d.querySelector('#settings-editor-font-size').value = app.$.editor.fontSize;
      d.querySelector('#settings-editor-tab-size').value = app.$.editor.tabSize;
    };

    /**
     * Called when the settings dialog is closed.
     */
    app.onSettingsClosed = function() {
      var dialog = app.$['settings-dialog'];

      // if 'ok' button was clicked
      if (dialog.closingReason.confirmed) {
        var d = Polymer.dom(dialog);

        app.set('settings.liveCompiling', d.querySelector('#settings-live-compiling').checked);
        app.set('settings.liveBuilding', d.querySelector('#settings-live-building').checked);
        app.set('settings.fairAbstraction', d.querySelector('#settings-fair-abstraction').checked);

        app.$.editor.wrap = d.querySelector('#settings-editor-wrap').checked;
        app.$.editor.softTabs = d.querySelector('#settings-editor-soft-tabs').checked;
        app.$.editor.fontSize = d.querySelector('#settings-editor-font-size').value;
        app.$.editor.tabSize = d.querySelector('#settings-editor-tab-size').value;
      }

      app.$.editor.focus();
    };

    /**
     * Opens the help dialog.
     */
    app.showHelp = function() {
      var help = app.$['help-dialog'];
      help.open();
    };

    /**
     * Return whether or not the given array has a length greater than zero.
     *
     * @param {!array} array - an array
     * @returns {boolean}
     */
    app.arrayHasData = function(array) {
      return array.length > 0;
    };

    /*
     * Fields
     *
     * Initialise the fields after the methods are defined.
     *
     * Note: when some fields are initialised, they may cause
     * methods calls and those methods need to already be defined.
     */

    /**
     * An array of Automaton.
     *
     * @type {Automaton[]}
     */
    app.automata = [];

    /**
     * An object containing any user settings.
     *
     * @type Object
     */
    app.settings = {
      liveCompiling: true,
      liveBuilding: true,
      fairAbstraction: true
    };

    /**
     * The selected tab on the help dialog.
     *
     * @type {Number}
     */
    app.helpDialogSelectedTab = 0;

    /**
     * The previous code in the text editor.
     *
     * @type {String}
     */
    app.previousCode = '';

    /*
     * Listener
     */

    /**
     * Called when any of the settings are changed.
     *
     * Note: settings must be changed using `app.set(path, value)`
     */
    app.addEventListener('settings-changed', function(e) {
      switch (e.detail.path) {
        case 'settings.liveCompiling':
        case 'settings.liveBuilding':
          if (app.settings.liveCompiling) {
            app.compile(false);
          }
          break;

        case 'settings.fairAbstraction':
          app.compile(false);
          break;
      }
    });

    /**
     * This is the event which triggers when the text in the text-editor is changed.
     * Only care about this if the live-compiling check-box is ticked.
     */
    document.addEventListener('code-changed', function() {
      if (app.settings.liveCompiling) {
        // don't block the renderer.
        // give it a chance to displayed the changed code before compiling it.
        // need when pasting in large amounts of code.
        setTimeout(function() {
          app.compile(false);
        }.bind(this), 0);
      }
    });

    /**
     * Listen for key presses.
     */
    document.addEventListener('keyup',function(e) {
      switch (e.keyCode) {
        case 13:  // CTRL + ENTER
          if (e.ctrlKey) {
            app.compile();
            break;
          }
          return;
        case 79:  // CTRL + O
          if (e.ctrlKey) {
            app.openFile();
            break;
          }
          return;
        case 83:  // CTRL + S
          if (e.ctrlKey) {
            app.downloadFile();
            break;
          }
          return;
        case 112: // F1
          if (app.$['help-dialog'].opened) {
            app.$['help-dialog'].close();
          } else {
            app.$['help-dialog'].open();
          }
          break;
        case 115: // F4
          if (app.$['settings-dialog'].opened) {
            app.$['settings-dialog'].close();
          } else {
            app.$['settings-dialog'].open();
          }
          break;
        default: return;
      }
      e.preventDefault();
    });

    /**
     * Prevent the default browser action on these keys.
     */
    document.addEventListener('keydown',function(e) {
      switch (e.keyCode) {
        case 13:  // CTRL + ENTER
        case 79:  // CTRL + O
        case 83:  // CTRL + S
          if (e.ctrlKey) {
            break;
          }
          return;
        case 112: // F1
        case 115: // F4
          break;
        default: return;
      }
      e.preventDefault();
    });
  }

  /**
   * Update the percentage that is displayed on the splash screen
   */
  function splashLoadingPercentUpdate(taskComple, totalTasks) {
    var splashLoadingPercent = document.getElementById('splash-loading-percent');
    if (splashLoadingPercent) {
      splashLoadingPercent.textContent = (100 * (taskComple / totalTasks)).toFixed(1) + '%';
    }
  }

  /**
   * Called once the element definision import is loaded.
   */
  function onImportsLoaded() {
    // Elements have now been upgraded and are ready to use

    // styles are also ready so we can now add the shared styles to the app's root
    var sharedStyles = document.createElement('style', 'custom-style');
    sharedStyles.include = 'shared-styles';
    document.head.appendChild(sharedStyles);

    setupAppClass();

    // everything is now setup - remove the splashscreen
    var splash = document.getElementById('splash');
    var removeSplash = function() {
      splash.parentElement.removeChild(splash);
    };
    splash.addEventListener('transitionend', removeSplash); // IE11 doesn't support `splash.remove`
    document.body.removeClass('loading');

    Polymer.updateStyles(); // and update the app's look
  }

  /**
   * Calls `onImportsLoaded` once all the element definisions are loaded.
   */
  function waitUntilElementsFullyParsed() {
    var link = document.querySelector('#elements');   // the main element bundle
    var allImports = link.import.querySelectorAll('link[rel="import"]');  // all the imports in the main element bundle
    var numberOfImportsComplete = 0;

    splashLoadingPercentUpdate(1 + numberOfImportsComplete, 1 + allImports.length);

    /**
     * Called once each import is ready.
     */
    var importComplete = function() {
      numberOfImportsComplete++;
      splashLoadingPercentUpdate(1 + numberOfImportsComplete, 1 + allImports.length);

      // if all imports are complete
      if (numberOfImportsComplete === allImports.length) {
        onImportsLoaded();
      }
    };

    // loop through all the imports and call `importComplete` if it's complete,
    // otherwise setup a listener to do so
    for (var i = 0; i < allImports.length; i++) {
      if (allImports[i].import && (
        allImports[i].import.readyState === 'complete' ||
        allImports[i].import.readyState === 'interactive')) {
        importComplete();
      } else {
        allImports[i].addEventListener('load', importComplete);
      }
    }
  }

  /**
   * Called once the web components polyfill is loaded or straight away if it's not needed.
   */
  function webComponentsLibReady() {
    // Use native Shadow DOM if it's available in the browser.
    window.Polymer = window.Polymer || {dom: 'shadow'};

    // call `onImportsLoaded` (if the import is complete,
    // otherwise setup a listener to do so)
    var link = document.querySelector('#elements');

    if (link.import && (link.import.readyState === 'complete' || link.import.readyState === 'interactive')) {
      waitUntilElementsFullyParsed();
    } else {
      link.addEventListener('load', waitUntilElementsFullyParsed);
    }
  }

  // detect if web components supported are natively supported by the browser
  var webComponentsSupported = (
    'registerElement' in document &&
    'import' in document.createElement('link') &&
    'content' in document.createElement('template'));

  // if they're not, load the polyfill
  if (webComponentsSupported) {
    webComponentsLibReady();
  } else {
    var script = document.createElement('script');
    script.onload = webComponentsLibReady;
    script.async = true;
    script.src = '/bower_components/webcomponentsjs/webcomponents-lite.min.js';
    document.head.appendChild(script);
  }
})(document);
