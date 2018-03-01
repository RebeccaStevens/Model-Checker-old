# Automata Concocter (Model-Checker)

[![Greenkeeper badge](https://badges.greenkeeper.io/RebeccaStevens/Model-Checker-old.svg)](https://greenkeeper.io/)

[Automata Concocter is hosted here](https://modelchecker-swen302.herokuapp.com/).

## Streader's Raiders - SWEN302 Group Project

The Automata Concocter is a web based application that constructs finite state automata based on text input from user.

It is designed as an educational tool for students studying software engineering.

## Overview

This application is developed using [Polymer 1.0](https://www.polymer-project.org/1.0/) which builds upon
[Web Components](https://en.wikipedia.org/wiki/Web_Components) and also provides other useful features such as databinding.

### Our Custom Elements

All the custom elements we have created are located within their respective directories within [app/elements/](app/elements/).

* **[automata-parser](app/elements/automata-parser)**

  This is a non-visual element for parsing and interpreting the code in the [text-editor](app/elements/text-editor).

  The parser ([parser.js](app/elements/automata-parser/parser.js)) is automatically generated using the [PEGJS library](http://pegjs.org).  
  The grammar it uses is defined in [automata-grammar.pegjs](app/elements/automata-parser/automata-grammar.pegjs).

* **[automaton-renderer](app/elements/automaton-renderer)**

  This is an element for rendering out an automaton.  
  It uses the [DagreD3 library](https://github.com/cpettitt/dagre-d3) and to render the automaton.

* **[automaton-visualisation](app/elements/automaton-visualisation)**

  This element is responsible for the display an automaton.  
  It is wrapper for [automaton-renderer](app/elements/automaton-renderer) and [automaton-walker](app/elements/automaton-walker)
  as well as providing an interface for additional features.

* **[automaton-walker](app/elements/automaton-walker)**

  This is an element that provides an interface for walking along an automaton.

* **[console-logger](app/elements/console-logger)**

  This is an element for displaying console text messages.

* **[text-editor](app/elements/text-editor)**

  This is an element for accepting text content from the user.  
  It acts as a wrapper for the [Ace library](https://ace.c9.io/#nav=about).

* **[\_template-element](app/elements/\_template-element)**

  This is a starting point to create new elements. Copy this directory and replace all instances of '\_template-element' with in with the name of the new element.

* **[app-icons](app/elements/app-icons)**

    This is **not** an element.  
    This is a collection of svg icons that can be used in the application.

#### Element Documentation

Our custom elements are documented using markdown and JSDoc.

Elements' documentation can be viewed on a local server using http://localhost:5000/elements/index.html

#### Creating A Custom Elements

To create a new custom element, start by copying the [\_template-element](app/elements/\_template-element).

Here's an example file structure for a custom element called *custom-element*:
```
.
└── app/elements/custom-element/
    ├── demo/
    |   └── index.html
    ├── test/
    |   ├── custom-element-test.html
    |   └── index.html
    ├── index.html
    └── custom-element.html
```

Description for these files:

Path | Description
-----|-------------
app/elements/custom-element/demo/ | this directory contains a demo of the element in use.
app/elements/custom-element/demo/index.html | this file is a demo of the element in use.
app/elements/custom-element/test/ | this directory contains any tests for the element.
app/elements/custom-element/test/index.html | this file run the tests for the element.
app/elements/custom-element/test/custom-element-test.html | this file contains the test for this element.
app/elements/custom-element/index.html | this file displays the element's documentation.
app/elements/custom-element/custom-element.html | this file has the element's definition in it.

### Using Custom Elements

To use a custom element, simply include its definition, then use it in the d\Dom like you would with any other element.

#### Including Custom Element Definitions

If you wish to use a custom element in the main [index.html](app/index.html) file of the application,
include that element's definition in the [elements.html](app/elements.html) file.

If you wish to use a custom element within another custom element,
include that element's definition at the top of your custom element's definition.

Note: All elements should include all their dependencies regardless of whether they are being loaded elsewhere or not.

#### Installing Third Party Custom Element

If you want to use a third party's custom element, you will need to install it.  
This is done using [bower](http://bower.io/) - Our package manager.

Many third party elements that are designed to be used by all will tell you the command to install them.

### Styling

* **[main.css](app/styles/main.css)**

  This stylesheet contains styles that will be applied to the main document. It should not be used for styling elements within `<template is="dom-bind" id="app">...</template>` - use [app-theme.html](app/styles/app-theme.html) for that.

* **[app-theme.html](app/styles/app-theme.html)**

  This file styles the application at the top level.  
  It is a `.html` rather than a `.css` file because it needs to us `custom-style` which cannot be applied to `.css` files.  
  See [here](https://www.polymer-project.org/1.0/docs/devguide/styling.html#custom-style) for details.
  
  Note: Our custom elements have their own styles defined with in them. These styles are designed to be quite general and can be overridden with this file.

* **[shared-styles.html](app/styles/shared-styles.html)**

  This file styles both the application and the internals of our custom elements (not 3rd party ones).

  Note: Our custom elements may override these stylings.

### Testing

#### Element Testing

Custom elements can have test written for them. These test should be in the element's test folder.  
These tests can then be run locally by going to http://localhost:5000/elements/custom-element/test/index.html where 'custom-element' is the name of the element.

See [web-component-tester](https://github.com/Polymer/web-component-tester) for details on writing these types of tests.

#### Script Testing

Scripts located in 'app/scripts' can also be tested in a similar way to elements by using the 'app/test' directory.  
These tests can then be run locally by going to http://localhost:5000/test/index.html.

### Shadow Dom vs Shady Dom

The Shadow Dom will be used on browsers that support it, otherwise the Shady Dom will be used.  
The application needs to work with both.

[What is the Shadow Dom / Shady Dom?](https://www.polymer-project.org/1.0/articles/shadydom.html)

### The Build Process

To Do

### Linting

JavaScript linting is done using [jshint](http://jshint.com/install/) and [jscs](http://jscs.info/).  
Polymer code is linted with [PolyLint](https://github.com/PolymerLabs/polylint#installation).  
Editors are kept in check with [editorconfig](http://editorconfig.org/).

## Contributing

### Getting Started

First off, Fork this repository.  
You will need to have [nodejs](https://nodejs.org/en/) installed on your computer, so that you can then install both [gulp](http://gulpjs.com/) and [bower](http://bower.io/) globally (`npm install -g gulp` and `npm install -g bower`).

Next open a command line tool at the root of the project and run `npm install & bower install` - This will install all of the application's dependencies.

Finally, start a local serve with the command `gulp serve`.

### Useful Links
* [Polymer - Getting Started](https://www.polymer-project.org/1.0/docs/start/getting-the-code.html): Polymer's Getting Started Guide.
* [Polymer - Dev Guide](https://www.polymer-project.org/1.0/docs/devguide/feature-overview.html): Polymer's Dev Guide.
* [Polymer - Element Catalogue](https://elements.polymer-project.org/): A catalogue of elements made with polymer by the Polymer Team.
* [CustomElements.io](https://customelements.io/): A catalogue of custom web components made by the community (not necessarily made using polymer).
* [Polycasts](https://www.youtube.com/playlist?list=PLOU2XLYxmsII5c3Mgw6fNYCzaWrsM3sMN): A video guide to using polymer by Rob Dodson.
* [What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ): Useful video explaining JavaScript's event loop by Philip Roberts.
