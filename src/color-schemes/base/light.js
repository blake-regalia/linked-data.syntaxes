module.exports = {
	globals: {
		foreground: '#333333',
		background: '#eff1f5',
		gutter: '#c0c5ce',
		caret: '#333333',
		accent: '#333333',

		// bracket_contents_options: 'stippled_underline',
		// brackets_options: 'stippled_underline',

		// guide: '#323334',
		// stack_guide: '#3B3C3D',
		// active_guide: '#48494A',

		line_highlight: '#a7adbaff',
		multi_edit_highlight: '#A5EB5144',
		find_highlight: '#FFE792',
		find_highlight_foreground: '#FFE792',

		selection: '#dfe1e8',
		selection_border: '#B0CDE7',
		shadow: '#dfe1e8',
	},

	rules: [
		// comment
		{
			foreground: '#868886',
			font_style: 'italic',
			scope: 'comment',
		},

		// invalid
		{
			background: '#FF0000',
			scope: 'invalid',
		},
	],
};
