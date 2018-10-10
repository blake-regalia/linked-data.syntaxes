/* global define */
define((require, exports, module) => {
	const oop = require('../lib/oop');
	const TextMode = require('./text').Mode;
	const HighlightRules = require('./@{SYNTAX}_highlight_rules.js');
	// let JavaFoldMode = require('./folding/java').FoldMode;

	let Mode = function() {
		this.HighlightRules = HighlightRules;
		// this.foldingRules = new JavaFoldMode();
	};
	oop.inherits(Mode, TextMode);

	(function() {
		// this.createWorker = function(session) {
		// 	return null;
		// };

		this.$id = 'ace/mode/@{SYNTAX}';
	}).call(Mode.prototype);

	exports.Mode = Mode;
});
