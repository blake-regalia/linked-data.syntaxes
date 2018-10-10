module.exports = {
	globals: {
		foreground: '#BEBBB0',
		background: '#252525',
		gutter: '#323232',
		caret: '#C9C9C3',
		accent: '#ff00ff',

		bracket_contents_options: 'stippled_underline',
		brackets_options: 'stippled_underline',

		guide: '#323334',
		stack_guide: '#3B3C3D',
		active_guide: '#48494A',

		line_highlight: '#3E3E3E',
		multi_edit_highlight: '#A5EB5144',
		find_highlight: '#E9EE5F99',
		selection: '#575757',
	},

	rules: [
		// comment
		{
			foreground: '#758B99',
			font_style: 'italic',
			scope: 'comment',
		},

		// invalid
		{
			background: '#7F225A',
			foreground: '#BD5393',
			scope: 'invalid',
		},
	],
};
