module.exports = {
	globals: {
		foreground: '#bebbb0',
		background: '#252525',
		gutter: '#323232',
		caret: '#c9c9c3',
		accent: '#ff00ff',

		bracket_contents_options: 'stippled_underline',
		brackets_options: 'stippled_underline',

		guide: '#323334',
		stack_guide: '#3b3c3d',
		active_guide: '#48494a',

		line_highlight: '#3e3e3e',
		multi_edit_highlight: '#a5eb5144',
		find_highlight: '#e9ee5f99',
		selection: '#575757',
	},

	rules: [
		// comment
		{
			foreground: '#758b99',
			font_style: 'italic',
			scope: 'comment',
		},

		// invalid
		{
			background: '#7f225a',
			foreground: '#bd5393',
			scope: 'invalid',
		},
	],
};
