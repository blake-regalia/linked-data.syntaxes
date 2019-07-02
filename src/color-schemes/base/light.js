module.exports = {
	globals: {
		foreground: '#333366',
		background: '#eff1f5',
		gutter: '#c0c5ce',
		caret: '#666666',
		accent: '#333333',
		invisibles: '#bbbbcc77',

		// bracket_contents_options: 'stippled_underline',
		// brackets_options: 'stippled_underline',

		// guide: '#323334',
		// stack_guide: '#3b3c3d',
		// active_guide: '#48494a',

		line_highlight: '#a7adba',
		multi_edit_highlight: '#a5eb5144',
		find_highlight: '#ffe792',
		find_highlight_foreground: '#ffe792',

		selection: '#dfe1e8',
		selection_border: '#b0cde7',
		shadow: '#dfe1e8',
	},

	rules: [
		// comment
		{
			foreground: 'hsla(0, 70%, 26%, 0.7)',
			font_style: 'italic',
			scope: 'comment',
		},

		// invalid
		{
			foreground: '#6600771b',
			background: '#ff6677dd',
			scope: 'invalid',
		},
	],
};
