/* global define */
let a_imports = [
	'ace/lib/oop',
	'ace/mode/text_highlight_rules',
	'ace/mode/sparql_highlight_rules',
];

require('brace').define('ace/mode/@{SYNTAX}', a_imports, (ace_require, exports, module) => {
	const oop = ace_require('ace/lib/oop');
	const TextMode = ace_require('ace/mode/text').Mode;
	const HighlightRules = ace_require('ace/mode/@{SYNTAX}_highlight_rules').HighlightRules;
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
