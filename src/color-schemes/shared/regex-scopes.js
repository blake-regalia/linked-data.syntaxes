// special thanks to @bathos <https://github.com/bathos/Ecmascript-Sublime>
module.exports = [
	{
		name: 'Regex Char Classes & Punctuation',
		scope: 'string.regexp constant.other.character-class.predefined, string.regexp constant.other.character-class punctuation, string.regexp constant.other.character-class.set',
		foreground: '#8ABA8A',
	},
	{
		name: 'Regex Char Class Dash',
		scope: 'punctuation.definition.character-class.dash.regexp',
		foreground: '#577557',
	},
	{
		name: 'Regex Char Class Negation',
		scope: 'keyword.operator.negation.regexp',
		foreground: '#C59764',
	},
	{
		name: 'Regex Char Classes (Predefined) & Escapes',
		scope: 'string.regexp constant.other.character-class.predefined, string.regexp constant.character.escape, string.regexp keyword.other.back-reference',
		font_style: 'bold',
	},
	{
		name: 'Regex Char Classes (Character Property)',
		scope: 'meta.character-property constant, meta.character-property punctuation',
		font_style: 'italic',
		foreground: '#75CEA4',
	},
	{
		name: 'Regex Char Classes (Character Property, Delimiters)',
		scope: 'meta.character-property punctuation',
		foreground: '#9AD8BB',
	},
	{
		name: 'Regex Char Escapes',
		scope: 'string.regexp constant.character.escape',
		foreground: '#73D226',
	},
	{
		name: 'Regex Backrefs',
		scope: 'string.regexp keyword.other.back-reference',
		background: '#173A0A',
		foreground: '#37BC46',
	},
	{
		name: 'Regex Quantifiers',
		scope: 'keyword.operator.quantifier.regexp',
		foreground: '#7D9B6D',
	},
	{
		name: 'Group Punctuation',
		scope: 'string.regexp meta.group punctuation',
		foreground: '#59A233',
	},
	{
		name: 'Regex Positive Assertions',
		scope: 'keyword.control.anchor.regexp, string.regexp punctuation.definition.assertion.positive',
		foreground: '#75CEA4',
	},
	{
		name: 'Regex Positive Assertion Text',
		scope: 'meta.group.assertion.positive.regexp',
		foreground: '#5FC983',
	},
	{
		name: 'Regex Negative Assertions',
		scope: 'string.regexp punctuation.definition.assertion.negative',
		foreground: '#ED804A',
	},
	{
		name: 'Regex Negative Assertion Text',
		scope: 'meta.group.assertion.negative.regexp',
		foreground: '#AF9547',
	},
	{
		name: 'Regex Capturing Groups 1',
		scope: 'meta.group.capturing.regexp',
		background: '#7BB66420',
	},
	{
		name: 'Regex Capturing Groups 2',
		scope: 'meta.group.capturing.regexp meta.group.capturing.regexp',
		background: '#7BB66435',
	},
	{
		name: 'Regex Capturing Groups 3',
		scope: 'meta.group.capturing.regexp meta.group.capturing.regexp meta.group.capturing.regexp',
		background: '#7BB6644A',
	},
	{
		name: 'Regex Capturing Groups 4',
		scope: 'meta.group.capturing.regexp meta.group.capturing.regexp meta.group.capturing.regexp meta.group.capturing.regexp',
		background: '#7BB6645F',
	},
	{
		name: 'Regex Capturing Groups 5',
		scope: 'meta.group.capturing.regexp meta.group.capturing.regexp meta.group.capturing.regexp meta.group.capturing.regexp meta.group.capturing.regexp',
		background: '#7BB66474',
	},
	{
		name: 'Regex Capturing Groups 6+',
		scope: 'meta.group.capturing.regexp meta.group.capturing.regexp meta.group.capturing.regexp meta.group.capturing.regexp meta.group.capturing.regexp meta.group.capturing.regexp',
		background: '#7BB66489',
	},
	{
		name: 'Regex Outer Punc',
		scope: 'punctuation.definition.string.regexp',
		foreground: '#496549',
	},
	{
		name: 'Regex Flags',
		scope: 'string.regexp.flags',
		font_style: 'italic',
		foreground: '#406E40',
	},
];
