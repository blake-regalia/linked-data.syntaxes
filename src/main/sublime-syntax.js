const syntax_source = require('syntax-source');
const export_sublime_syntax = syntax_source.export['sublime-syntax'];

(async() => {
	// consume prefixes on stdin
	let h_prefixes = {};
	{
		let s_prefixes = '';
		for await(let s_chunk of process.stdin) {
			s_prefixes += s_chunk;
		}
		h_prefixes = JSON.parse(s_prefixes)['@context'];
	}

	// load syntax source from a path string
	let k_syntax = await syntax_source.transform({
		path: process.argv[2],
		extensions: {
			// insert all registered prefixe declaration productions in the appearing context
			_registeredPrefixDeclarations: (k_context, k_rule, s_version) => {
				let s_ext = k_context.syntax.ext;

				// remove source rule from context
				let i_rule = k_context.drop(k_rule);

				// each prefix in environment
				for(let [si_prefix, p_prefix_iri] of Object.entries(h_prefixes)) {
					// create new rule for prefix mapping
					k_context.insert(i_rule++, {
						match: `(((${syntax_source.string_to_regex(si_prefix)})(:))\\s*(<)(${syntax_source.string_to_regex(p_prefix_iri)})(>))`,
						captures: [
							`meta.prefix-declaration.either.registered.SYNTAX`,
							`meta.prefix-declaration.${s_version}.namespace.SYNTAX`,
							`variable.other.readwrite.prefixed-name.namespace.prefix-declaration.SYNTAX`,
							`punctuation.separator.prefixed-name.prefix-declaration.SYNTAX`,
							// `meta.prefix-declaration.${s_version}.iri.SYNTAX`,
							`punctuation.definition.iri.begin.prefix-declaration.SYNTAX`,
							`string.unquoted.iri.prefix-declaration.SYNTAX`,
							`punctuation.definition.iri.end.prefix-declaration.SYNTAX`,
						],
						pop: true,
					});
				}

				return i_rule;
			},
		},
	});

	// write to stdout
	process.stdout.write(export_sublime_syntax(k_syntax, {
		post: g_yaml => ({
			...g_yaml,
			name: `${g_yaml.name} (LinkedData)`,
		}),
	}));
})().catch((e_compile) => {
	console.error(e_compile.stack);
	process.exit(1);
});
