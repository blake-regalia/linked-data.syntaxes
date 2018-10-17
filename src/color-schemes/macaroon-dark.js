/* eslint-disable global-require */
module.exports = {
	// base color scheme def
	base: {
		...require('./base/dark.js'),
		name: 'Macaroon Dark (graphy)',
		variables: {
			root: 'hsl(199, 56%, 73%)',
			scape: 'hsl(344, 81%, 81%)',
			flare: 'hsl(42, 98%, 83%)',
			echo: 'hsl(175, 54%, 69%)',
			chip: 'hsl(250, 48%, 92%)',

			root_boost: 'hsl(199, 85%, 73%)',
			scape_boost: 'hsl(344, 94%, 81%)',
			flare_boost: 'hsl(42, 100%, 83%)',
			echo_boost: 'hsl(175, 85%, 69%)',
			chip_boost: 'hsl(250, 83%, 87%)',
		},
	},

	// extra rules to append
	rules: [
		// registered prefixes
		{
			scope: 'meta.prefix-declaration.either.registered',
			background: 'hsla(220, 23%, 10%, 0.62)',
		},

		// inverse path
		{
			scope: 'meta.path.inverse',
			background: 'hsla(226, 94%, 12%, 0.28)',
			font_style: 'italic',
		},

		// inverse path
		{
			scope: 'meta.path.negated',
			background: 'hsla(290, 84%, 10%, 0.38)',
		},

		// plus quantifier
		{
			scope: 'keyword.operator.path.quantifier.one-or-more',
			font_style: 'bold',
		},

		// storage modifier
		{
			scope: 'storage.modifier',
			font_style: 'italic',
		},
	],

	// blends
	blends: {
		root: {
			// `@` as in `@prefix`
			'punctuation.definition.storage storage.type': -25,

			// prefix / base
			'storage.type': -20,

			// distinct / reduced
			'storage.modifier': -8,

			// all 'other' keywords (namely modifiers)
			'keyword.operator': 15,

			// `graph`
			'keyword.control': -15,

			'punctuation.section.formula': -20,
		},

		root_boost: {
			// qualifier keywords
			'keyword.operator.word.qualifier': -10,

			// where clause brace
			'punctuation.section, meta.clause.where': 10,

			// built-ins
			'support.function': 0,
			'punctuation.definition.expression': -15,
			'punctuation.definition.arguments': 25,

			// `as`
			'storage.type.variable': -15,

			'keyword.operator.path': 0,
			'punctuation.section.group': -20,
			'punctuation.section.block': -15,
			'meta.path.negated punctuation.section.group': -10,
			'meta.path.inverse punctuation.section.group': -10,

			// constants `true` and `false`
			'constant.language': -5,

			// n3 predicates
			'keyword.operator.predicate': 0,
		},

		scape: {
			// prefixes
			'variable.other.readwrite.prefixed-name.namespace': -25,
			'punctuation.separator.prefixed-name': -10,
			'variable.other.member.prefixed-name.local': 10,

			'constant.character.escape.prefixed-name': -5,

			// `a`
			'support.constant.predicate.a': -50,
		},

		scape_boost: {

		},

		flare: {
			// datatype symbol `^^`
			'punctuation.separator.datatype.symbol': -65,

			// prefixed-names
			'meta.datatype variable.other.readwrite.prefixed-name.namespace': -50,
			'meta.datatype variable.other.member.prefixed-name.local': -35,

			// iri datatypes
			'meta.datatype string.unquoted.iri': -25,
			'meta.datatype constant.character.escape.iri': -40,
			'meta.datatype punctuation.definition.iri': -50,

			// blank node property list
			'punctuation.definition.blank-node-property-list': 5,
			'punctuation.definition.anonymous-blank-node': -45,

			// terminators and separators
			'punctuation.separator.object': -40,
			'punctuation.terminator.pair': -20,
			'punctuation.terminator.triple': 100,
			'punctuation.terminator.graph-pattern': -60,
			'punctuation.terminator.prefix-declaration': 40,
		},

		flare_boost: {
			// variables
			'variable.other.readwrite.var': -15,

		},

		echo: {
			// literasls
			'string.quoted.double.literal, string.quoted.single.literal': -15,
			'punctuation.definition.string': -35,
			'constant.character.escape.literal': -50,

			// language-tags
			'string.unquoted.language-tag': -5,
			'punctuation.separator.language-tag.symbol': -60,
			'string.unquoted.barename': -30,

			// numerics
			'keyword.operator.arithmetic': -0,
			'constant.numeric': -15,
			'meta.numeric.exponent': -40,
		},

		echo_boost: {
			'support.constant': -15,
		},

		chip: {
			// iris
			'string.unquoted.iri': -20,
			'constant.character.escape.iri': -40,
			'punctuation.definition.iri': -55,

			// collection punctuation
			'punctuation.definition.collection': 20,

			// blank nodes
			'variable.other.readwrite.blank-node.underscore': -45,
			'variable.other.member.blank-node.label': -10,
		},

		chip_boost: {
			'meta.directive': -45,
		},

	},
};
