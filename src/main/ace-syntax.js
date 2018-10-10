const util = require('util');
const transform = require('./transform.js');

transform.build().then((k_syntax) => {
	// write data to stream
	process.stdout.write(/* syntax: js */ `
		/* global define */

		define(function(require, exports, module) {
			"use strict";

			var oop = require("../lib/oop");
			var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

			function next_states(a_states) {
				return function(s_state, a_stack) {
					a_stack.shift();
					a_stack.unshift(...[...a_states].reverse());
					return a_stack[0];
				};
			}

			function push_states(a_states) {
				return function(s_state, a_stack) {
					a_stack.unshift(...[...a_states].reverse());
					return a_stack[0];
				};
			}

			var SPARQLgraphyHighlightRules = function() {
				// regexp must not have capturing parentheses. Use (?:) instead.
				// regexps are ordered -> the first match is used

				this.$rules = ${/* eslint-disable indent */ util.inspect({
						start: [{regex:/(?=[\S\s])/, push:'main'}],
						...k_syntax.export_ace_rules({
							no_unicode_mode: true,
						}),
					}, {
						depth: Infinity,
						maxArrayLength: Infinity,
						breakLength: Infinity,
						compact: false,
					}) /* eslint-enable */}

				this.normalizeRules();
			};

			SPARQLgraphyHighlightRules.metaData = {
				fileTypes: ['rq', 'sparql'],
				name: 'SPARQL',
				scopeName: 'source.rq'
			};

			oop.inherits(SPARQLgraphyHighlightRules, TextHighlightRules);

			exports.SPARQLgraphyHighlightRules = SPARQLgraphyHighlightRules;
		});
	`);
});
