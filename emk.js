const fs = require('fs');

const p_prefixes_jsonld = 'http://prefix.cc/context.jsonld';
const p_package = 'development' === process.env.NODE_ENV? 'Packages/User/linked-data': 'Packages/LinkedData';


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
	'n-triples': {
		supplementals: {},
		dependencies: G_SYNTAX_DEPS.verbose,
	},
	'n-quads': {
		supplementals: {},
		dependencies: G_SYNTAX_DEPS.verbose,
	},
	sparql: {
		supplementals: {},
		dependencies: G_SYNTAX_DEPS.terse,
	},
	notation3: {
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
};

const A_COLOR_SCHEMES = [
	'macaroon-dark',
	'macaroon-light',
];

module.exports = {
	defs: {
		color_scheme: A_COLOR_SCHEMES,

		syntax: Object.keys(G_SYNTAXES),

		declaration_type: [
			'sparql',
			'at',
		],

		preference: fs.readdirSync('src/supplementals')
			.filter(s => s.endsWith('.preferences.yaml'))
			.map(s => s.replace(/\.preferences\.yaml$/, '')),

		version_bump: [
			'patch',
			'minor',
			'major',
		],
	},

	tasks: {
		all: 'build/**',

		release: 'channels/**',

		syntax: {
			':syntax': h => `build/${h.syntax}.sublime-syntax`,
		},
	},

	outputs: {
		channels: {
			sublime: {
				'package-control.json': () => ({
					deps: [
						'src/channel/package-control.js',
						'package.json',
						'build/sublime/**',
					],
					run: /* syntax: bash */ `
						node $1 < $2 > $@
					`,
				}),
			},
		},

		build: {
			'context.jsonld': () => ({
				run: /* syntax: bash */ `
					curl ${p_prefixes_jsonld} > $@
				`,
			}),

			sublime: {
				'LinkedData.sublime-package': () => ({
					deps: ['build/sublime/assets/*'],
					run: /* syntax: bash */ `
						cd $(dirname $@)
						zip -r $(basename $@) assets/
					`,
				}),

				'assets': {
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

					'linked-data.:preference.tmPreferences': h => ({
						deps: [
							`src/main/convert-yaml-to-plist.js`,
							`src/supplementals/${h.preference}.preferences.yaml`,
						],

						run: /* syntax: bash */ `
							node $1 < $2 > $@
						`,
					}),
				},
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
