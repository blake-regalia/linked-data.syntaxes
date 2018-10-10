const fs = require('fs');
const yaml = require('js-yaml');

let p_file = process.argv[2];

// load ecmascript syntax file contents
let s_syntax = fs.readFileSync(p_file, 'utf8');

// parse syntax def as yaml
let g_syntax = yaml.safeLoad(s_syntax, {
	filename: p_file,
});


const string_to_regex = s => s.replace(/([.|?*+[\](){}\\^$])/g, '\\$1');
const captures_to_map = (a_captures) => {
	let h_map = {};
	for(let i_capture=0; i_capture<a_captures.length; i_capture++) {
		h_map[(i_capture+1)+''] = a_captures[i_capture];
	}
	return h_map;
};

let s_prefixes_jsonld = '';

process.stdin.setEncoding('utf8');
process.stdin
	.on('data', (s_chunk) => {
		s_prefixes_jsonld += s_chunk;
	})
	.on('end', () => {
		let g_jsonld = JSON.parse(s_prefixes_jsonld);
		let a_rules_prefixes = g_syntax.contexts.prefixDeclaration_AFTER_KEYWORD;

		for(let [si_prefix, p_prefix_iri] of Object.entries(g_jsonld['@context'])) {
			// let si_context_registered_iri = `prefixDeclarat\ion_AFTER_NAME_REGISTERED_${si_prefix.replace(/[^a-z]/g, '_').toUpperCase()}`;

			a_rules_prefixes.unshift({
				match: `((${string_to_regex(si_prefix)})(:)\\s*(<)(${string_to_regex(p_prefix_iri)})(>))`,
				captures: captures_to_map([
					'meta.prefix-declaration.registered.ttl',
					'variable.other.readwrite.prefix-name.namespace.prefix-declaration.ttl',
					'punctuation.separator.prefix-name.prefix-declaration.ttl',
					'punctuation.definition.iri.begin.prefix-declaration.ttl',
					'string.unquoted.iri.prefix-declaration.ttl',
					'punctuation.definition.iri.end.prefix-declaration.ttl',
				]),
				pop: true,
				// set: si_context_registered_iri,
			});

			// g_syntax.contexts[si_context_registered_iri] = [
			// 	{
			// 		match: `(<)(${string_to_regex(p_prefix_iri)})(>)`,
			// 		captures: captures_to_map([
			// 			'punctuation.definition.iri.begin.prefix-declaration.ttl',
			// 			'constant.other.iri.prefix-declaration.registered.ttl',
			// 			'punctuation.definition.iri.end.prefix-declaration.ttl',
			// 		]),
			// 		pop: true,
			// 	},
			// 	{
			// 		include: 'prefixDeclaration_UNREGISTERED_POP',
			// 	},
			// ];
		}


		// reserialize syntax def; dump changes
		process.stdout.write(`%YAML 1.2\n---\n${yaml.safeDump(g_syntax)}`);
	});


