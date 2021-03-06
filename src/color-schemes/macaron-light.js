const a_regex_scopes = require('./shared/regex-scopes.js');

/* eslint-disable global-require */
module.exports = {
	// base color scheme def
	base: {
		...require('./base/light.js'),
		name: 'Macaron Light (LinkedData)',
		variables: {
			root: 'hsl(199, 56%, 51%)',
			scape: 'hsl(344, 81%, 65%)',
			flare: 'hsl(42, 98%, 66%)',
			echo: 'hsl(175, 58%, 53%)',
			chip: 'hsl(250, 48%, 69%)',

			root_boost: 'hsl(199, 85%, 53%)',
			scape_boost: 'hsl(316, 94%, 31%)',
			flare_boost: 'hsl(42, 100%, 61%)',
			echo_boost: 'hsl(175, 85%, 53%)',
			chip_boost: 'hsl(250, 83%, 67%)',
		},
	},

	// extra rules to append
	rules: [
		// registered prefixes
		{
			scope: 'meta.prefix-declaration.either.registered',
			background: 'hsla(220, 63%, 89%, 0.61)',
		},

		// inverse path
		{
			scope: 'meta.path.inverse',
			background: 'hsla(226, 94%, 62%, 0.12)',
			font_style: 'italic',
		},

		// negated path
		{
			scope: 'meta.path.negated',
			background: 'hsla(290, 84%, 70%, 0.38)',
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

		// annotation
		{
			scope: 'meta.annotation',
			font_style: 'italic',
			background: 'hsla(0, 20%, 50%, 0.1)',
			foreground_adjust: 'saturation(20%)',
		},

		{
			scope: 'meta.term.role.label.triple-expression',
			background: 'hsla(120, 80%, 50%, 0.1)',
			foreground_adjust: 'saturation(55%)',
		},

		// shape-definition inclusion
		{
			scope: 'meta.term.role.include',
			background: 'hsla(52, 74%, 76%, 0.38)',
			// background: 'hsla(252, 24%, 50%, 0.1)',
		},

		// value-set exclusion
		{
			scope: 'meta.term.role.exclusion',
			background: 'hsla(342, 74%, 84%, 0.35)',
			// background: 'hsla(252, 24%, 50%, 0.1)',
		},

		// rdf-star
		{
			scope: 'meta.triple.reified',
			background: 'hsla(140, 80%, 70%, 0.2)',
			foreground_adjust: 'saturation(55%)',
		},

		// nested reified statement
		{
			scope: 'meta.triple.reified-nested',
			background: 'hsla(140, 80%, 70%, 0.4)',
			foreground_adjust: 'saturation(55%)',
		},


		// shared regex scopes
		...a_regex_scopes,
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

			// shex
			'keyword.operator.unary.label': 15,
		},

		scape: {
			// prefixes
			'variable.other.readwrite.prefixed-name.namespace': -25,
			'punctuation.separator.prefixed-name': -10,
			'variable.other.member.prefixed-name.local': 0,

			'constant.character.escape.prefixed-name': -5,

			// `a`
			'support.constant.predicate.a': -50,

			'keyword.operator.unary.exclusion': -30,
			'punctuation.terminator.exclusion': 15,
		},

		scape_boost: {
			'variable.other.member.barename': 20,

			'keyword.operator.unary.reference.shape': -5,

			'meta.term.role.include punctuation.definition.iri': -60,
			'meta.term.role.include string.unquoted.iri': 15,

			'meta.term.role.label.shape-expression.declaration variable.other.readwrite.prefixed-name.namespace': -20,
			'meta.term.role.label.shape-expression.declaration variable.other.member.prefixed-name.local': 45,

		},

		flare: {
			// datatype symbol `^^`
			'punctuation.separator.datatype.symbol': -60,

			// prefixed-names
			'meta.datatype variable.other.readwrite.prefixed-name.namespace': -50,
			'meta.datatype variable.other.member.prefixed-name.local': -35,
			'meta.datatype punctuation.separator.prefixed-name': -50,

			// iri datatypes
			'meta.datatype string.unquoted.iri': -25,
			'meta.datatype constant.character.escape.iri': -40,
			'meta.datatype punctuation.definition.iri': -50,

			// blank node property list
			'punctuation.definition.blank-node-property-list': -30,
			'punctuation.definition.property-list': -30,  // n3
			'punctuation.definition.anonymous-blank-node': -45,

			// terminators and separators
			'punctuation.separator.object': -40,
			'punctuation.separator.pair': -20,
			'punctuation.separator.predicate-object-list': -40,
			'punctuation.separator.property-list': -40,  // n3
			'punctuation.terminator.triple': -100,
			'punctuation.terminator.statement': -100,  // n3
			'punctuation.terminator.graph-pattern': -60,
			'punctuation.terminator.prefix-declaration': -60,
			'punctuation.terminator.shape-atom': -20,
		},

		flare_boost: {
			// variables
			'variable.other.readwrite.var': -15,

			'meta.term.role.include variable.other.readwrite.prefixed-name.namespace': -40,
			'meta.term.role.include variable.other.member.prefixed-name.local':-20,
		},

		echo: {
			// literasls
			'string.quoted.double.literal, string.quoted.single.literal': -15,
			'punctuation.definition.string': -35,
			'constant.character.escape.literal': -40,

			// regex
			'string.regexp': -10,

			// language-tags
			'string.unquoted.language-tag': -5,
			'punctuation.separator.language-tag.symbol': -35,

			// numerics
			'keyword.operator.arithmetic': -0,
			'constant.numeric': -15,
			'meta.numeric.exponent': -40,

			// shex
			'punctuation.definition.repeat-range': -45,
			'punctuation.separator.repeat-range': -55,
		},

		echo_boost: {
			'support.constant': -15,

			'text.plain': -25,
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

			'punctuation.definition.annotation': -30,

			'keyword.operator.unary.include': -15,

			'meta.term.role.label.shape-expression.declaration punctuation.definition.iri': -60,
			'meta.term.role.label.shape-expression.declaration string.unquoted.iri': 20,

		},

	},
};
