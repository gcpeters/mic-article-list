/** @jsx React.DOM */

'use strict'

var React = require('react'),
	Hello = require('./List');

React.renderComponent(<Hello />, document.getElementById('content'));