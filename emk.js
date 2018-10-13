
const p_prefixes_jsonld = 'http://prefix.cc/context.jsonld';
const p_package = 'production' === process.env.NODE_ENV? 'Packages/LinkedData': 'Packages/User/linked-data';


const A_SYNTAX_DEPS_ALL = [
	'build/context.jsonld',
	'src/main/transform.js',
	'src/class/syntax.js',
];

const G_SYNTAX_DEPS = {
	get human_readable() {
		return [
			...A_SYNTAX_DEPS_ALL,
			`src/syntax/human-readable.sublime-syntax-source`,
		];
	},
	get terse() {
		return [
			...this.human_readable,
			'src/syntax/terse.sublime-syntax-source',
		];
	},
	get verbose() {
		return [
			...this.human_readable,
			'src/syntax/verbose.sublime-syntax-source',
		];
	},
	get t_family() {
		return [
			...this.terse,
			'src/syntax/t-family.sublime-syntax-source',
		];
	},
};

const G_SYNTAXES = {
	sparql: {
		supplementals: {},
		dependencies: G_SYNTAX_DEPS.terse,
	},
	turtle: {
		supplementals: {},
		dependencies: G_SYNTAX_DEPS.t_family,
	},
	trig: {
		supplementals: {},
		dependencies: G_SYNTAX_DEPS.t_family,
	},
	'n-triples': {
		supplementals: {},
		dependencies: G_SYNTAX_DEPS.verbose,
	},
	'n-quads': {
		supplementals: {},
		dependencies: G_SYNTAX_DEPS.verbose,
	},
};

const A_COLOR_SCHEMES = [
	'macaroon-dark',
	// 'macaroon',
];

module.exports = {
	defs: {
		color_scheme: A_COLOR_SCHEMES,

		syntax: Object.keys(G_SYNTAXES),

		declaration_type: [
			'sparql',
			'at',
		],
	},

	tasks: {
		all: 'build/**',

		syntax: {
			':syntax': h => `build/${h.syntax}.sublime-syntax`,
		},
	},

	outputs: {
		build: {
			'context.jsonld': () => ({
				run: /* syntax: bash */ `
					curl ${p_prefixes_jsonld} > $@
				`,
			}),

			sublime: {
				// 'turtle.sublime-syntax': () => ({
				// 	deps: [
				// 		'src/main/turtle.js',
				// 		'src/syntax/turtle.sublime-syntax-source',
				// 		'build/context.jsonld',
				// 	],

				// 	run: /* syntax: bash */ `
				// 		node $1 $2 < $3 > $@
				// 	`,
				// }),

				':syntax': [s_syntax => ({
					[`${s_syntax}.sublime-syntax`]: () => ({
						deps: [
							'src/main/sublime-syntax.js',
							`src/syntax/${s_syntax}.sublime-syntax-source`,
							...G_SYNTAXES[s_syntax].dependencies,
						],

						run: /* syntax: bash */ `
							node $1 $2 < $3 > $@
						`,
					}),

					[`${s_syntax}.sublime-settings`]: () => ({
						deps: [
							'src/supplementals/settings.jmacs.sublime-settings',
						],

						run: /* syntax: bash */ `
							npx jmacs -g '${/* eslint-disable indent */JSON.stringify({
								PACKAGE_PATH: p_package,
								COLOR_SCHEME: A_COLOR_SCHEMES[0],
							})}' $1 > $@
						`,
					}),

					...G_SYNTAXES[s_syntax].supplementals,
				})],

				'prefix-declarations.:declaration_type.sublime-completions': h => ({
					deps: [
						'src/supplementals/completions.js',
						'build/context.jsonld',
					],

					run: /* syntax: bash */ `
						node $1 '${h.declaration_type}' < $2 > $@
					`,
				}),

				':color_scheme.sublime-color-scheme': h => ({
					deps: [
						'src/main/color-scheme.js',
						`src/color-schemes/${h.color_scheme}.js`,
					],

					run: /* syntax: bash */ `
						node $1 ${h.color_scheme} > $@
					`,
				}),
			},

			ace: {
				':syntax': [s_syntax => ({
					[`${s_syntax}.js`]: () => ({
						deps: [
							'src/ace/mode.jmacs.js',
						],

						run: /* syntax: bash */ `
							npx jmacs -g '{SYNTAX:"${s_syntax}"}' $1 > $@
						`,
					}),

					[`${s_syntax}_highlight_rules.js`]: () => ({
						deps: [
							'src/main/ace-syntax.js',
							`src/syntax/${s_syntax}.sublime-syntax-source`,
							...G_SYNTAXES[s_syntax].dependencies,
						],

						run: /* syntax: bash */ `
							node $1 $2 < $3 > $@
							node_exit=$?
							if [ $node_exit -ne 0 ]; then exit $node_exit; fi

							eslint --fix --color --rule 'no-debugger: off' $@
							eslint_exit=$?
							# do not fail on warnings
							if [ $eslint_exit -eq 2 ]; then
								exit 0
							fi
							exit $eslint_exit
						`,
					}),
				})],
			},
		},
	},
};
