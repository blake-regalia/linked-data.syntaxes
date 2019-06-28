const fs = require('fs');
const path = require('path');

const syntax = require('../class/syntax.js');

let i_phrase = 0;
const unique_phrase = () => Buffer.from((i_phrase++)+'').toString('base64').replace(/=+$/, '');

const H_CASES = {
	upper: s => s.toUpperCase(),
	lower: s => s.toLowerCase(),
	proper: s => s[0].toUpperCase()+s.slice(1).toLowerCase(),
	mixed: s => `(?i)${s}`,
};

const H_CASES_EXTENDED = {
	camel: s => s,
	pascal: s => s[0].toUpperCase()+s.slice(1),
};

const normalize_insert_spec = (g_spec, a_stack=[]) => {
	let b_pop = false;
	if(g_spec.pop) {
		b_pop = true;
	}
	else if(g_spec.set) {
		b_pop = true;
		a_stack.unshift(...(Array.isArray(g_spec.set)? g_spec.set: [g_spec.set]));
	}
	else if(g_spec.push) {
		a_stack.unshift(...(Array.isArray(g_spec.push)? g_spec.push: [g_spec.push]));
	}

	return {
		...g_spec,
		pop: b_pop,
		stack: a_stack,
		action: (b_pop
			? (a_stack.length
				? {set:a_stack}
				: {pop:true})
			: {push:a_stack}),
	};
};

const insert_prefixed_name = (h_env, k_context, i_rule, g_spec) => {
	let {
		scope: s_scope_frag,
		action: h_stack_action,
	} = normalize_insert_spec(g_spec, ['prefixedName']);

	// prefix name
	k_context.insert(i_rule++, {
		match: /* syntax: sublime-syntax.regex */ `'{{prefixedNameNamespace_LOOKAHEAD}}'`.slice(1, -1),
		...h_stack_action,
	});

	return i_rule;
};


const insert_iri_ref = (h_env, k_context, i_rule, g_spec) => {
	let {
		scope: s_scope_frag,
		action: h_stack_action,
	} = normalize_insert_spec(g_spec, ['iriRef']);

	// iri
	k_context.insert(i_rule++, {
		match: /* syntax: sublime-syntax.regex */ `'{{iriRef_LOOKAHEAD}}'`.slice(1, -1),
		...h_stack_action,
	});

	return i_rule;
};


const insert_blank_node = (h_env, k_context, i_rule, g_spec) => {
	let {
		scope: s_scope_frag,
		stack: a_stack,
		action: h_stack_action,
	} = normalize_insert_spec(g_spec);

	// make new context name
	let si_context_blank_node_begin = `${syntax.scope_to_context(s_scope_frag)}_AFTER_BLANK_NODE_BEGIN`;

	// // push to stack
	// a_stack.push(si_context_blank_node_begin);

	// blank node
	k_context.insert(i_rule++, {
		match: '_:',
		scope: `variable.other.readwrite.blank-node.underscore.${s_scope_frag}.${h_env.syntax}`,
		set: si_context_blank_node_begin,
	});

	// new context
	let k_context_new = k_context.def.append(si_context_blank_node_begin, [
		{meta_include_prototype:false},
		{
			match: /* syntax: sublime-syntax.regex */ `'{{BLANK_NODE_LABEL}}'`.slice(1, -1),
			scope: `variable.other.member.blank-node.label.${s_scope_frag}.${h_env.syntax}`,
			...h_stack_action,
		},
		// {include:'other_illegal_pop'},
		{
			match: /* syntax: sublime-syntax.regex */ `'{{MAT_word_or_any_one_char}}'`.slice(1, -1),
			scope: `invalid.illegal.token.expected.${k_context.id}.${h_env.syntax}`,
			pop: true,
		},
	]);

	// throw pop
	H_MODIFIERS._throw(h_env, k_context_new, 2, true);
};

const insert_cases = (h_env, k_context, i_rule, k_rule, s_word, h_cases) => {
	let g_source = k_rule.source;

	// lookahead
	let s_lookahead = '{{KEYWORD_BOUNDARY}}';
	if(g_source.lookahead) {
		s_lookahead = g_source.lookahead;
		delete g_source.lookahead;
	}

	// type
	let s_type = 'modifier';
	if(g_source.type) {
		s_type = g_source.type;
		delete g_source.type;
	}

	// each predefined case
	for(let [s_case, f_case] of Object.entries(h_cases)) {
		// insert permutation to rule
		k_context.insert(i_rule++, {
			match: `${f_case(syntax.string_to_regex(s_word))}(?=${s_lookahead})`,
			...k_rule.clone(i_rule)
				.scopes(s_scope => s_scope
					.replace(/\.CASE\./, `.${s_case}.`)
					.replace(/\.WORD\./, `.${s_word}.`))
				.mod(g_source_sub => ({
					...g_source_sub,
					scope: `${g_source.scope || `keyword.operator.word.${s_type}.${s_word}.${h_env.syntax}`} `
						+`meta.case.${s_case}.${h_env.syntax}`,
				}))
				.export(),
		});
	}

	return i_rule;
};

const punctuation = (s_type, s_name, s_match_begin, s_match_end) => ({
	[`_open_${s_name}`]: (h_env, k_context, k_rule, s_scope_frag) => {
		Object.assign(k_rule.source, {
			match: s_match_begin,
			scope: `punctuation.${s_scope_frag}.begin.${h_env.syntax}`,
		});
	},

	[`_close_${s_name}`]: (h_env, k_context, k_rule, s_scope_frag) => {
		Object.assign(k_rule.source, {
			match: s_match_end,
			scope: `punctuation.${s_scope_frag}.end.${h_env.syntax}`,
		});
	},
});

const H_MODIFIERS = {
	// apply capitalization permutations of the given word in the appearing context
	_case: (h_env, k_context, k_rule, s_word) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		return insert_cases(h_env, k_context, i_rule, k_rule, s_word, H_CASES);
	},

	// array-style of above
	_cases: (h_env, k_context, k_rule, a_words) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// each keyword
		for(let s_word of a_words) {
			i_rule = insert_cases(h_env, k_context, i_rule, k_rule, s_word, H_CASES);
		}

		return i_rule;
	},

	_case_camel: (h_env, k_context, k_rule, s_word) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		return insert_cases(h_env, k_context, i_rule, k_rule, s_word, H_CASES_EXTENDED);
	},

	// array-style of above
	_cases_camel: (h_env, k_context, k_rule, a_words) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// each keyword
		for(let s_word of a_words) {
			i_rule = insert_cases(h_env, k_context, i_rule, k_rule, s_word, H_CASES_EXTENDED);
		}

		return i_rule;
	},

	// insert all registered prefixe declaration productions in the appearing context
	_registeredPrefixDeclarations: (h_env, k_context, k_rule, s_version) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// each prefix in environment
		for(let [si_prefix, p_prefix_iri] of Object.entries(h_env.prefixes)) {
			// create new rule for prefix mapping
			k_context.insert(i_rule++, {
				match: `(((${syntax.string_to_regex(si_prefix)})(:))\\s*(<)(${syntax.string_to_regex(p_prefix_iri)})(>))`,
				captures: [
					`meta.prefix-declaration.either.registered.${h_env.syntax}`,
					`meta.prefix-declaration.${s_version}.namespace.${h_env.syntax}`,
					`variable.other.readwrite.prefixed-name.namespace.prefix-declaration.${h_env.syntax}`,
					`punctuation.separator.prefixed-name.prefix-declaration.${h_env.syntax}`,
					// `meta.prefix-declaration.${s_version}.iri.${h_env.syntax}`,
					`punctuation.definition.iri.begin.prefix-declaration.${h_env.syntax}`,
					`string.unquoted.iri.prefix-declaration.${h_env.syntax}`,
					`punctuation.definition.iri.end.prefix-declaration.${h_env.syntax}`,
				],
				pop: true,
			});
		}

		return i_rule;
	},

	_prefixedName: (h_env, k_context, k_rule, w_spec) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// insert iri ref rules; update rule index
		return insert_prefixed_name(h_env, k_context, i_rule, w_spec);
	},

	_iriRef: (h_env, k_context, k_rule, w_spec) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// insert iri ref rules; update rule index
		return insert_iri_ref(h_env, k_context, i_rule, w_spec);
	},

	_blankNode: (h_env, k_context, k_rule, w_spec) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// insert blank node rules; return rule index
		return insert_blank_node(h_env, k_context, i_rule, w_spec);
	},

	_namedNode: (h_env, k_context, k_rule, w_spec) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// insert iri ref rules; update rule index
		i_rule = insert_iri_ref(h_env, k_context, i_rule, w_spec);

		// insert prefixed name rules; update rule index
		return insert_prefixed_name(h_env, k_context, i_rule, w_spec);
	},

	_node: (h_env, k_context, k_rule, w_spec) => {
		// remove source rule from context
		let i_rule = H_MODIFIERS._namedNode(h_env, k_context, k_rule, w_spec);

		// insert blank node rules; return rule index
		return insert_blank_node(h_env, k_context, i_rule, w_spec);
	},

	_throw: (h_env, k_context, k_rule, b_pop) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// insert other illegal pop
		k_context.insert(i_rule++, {
			match: /* syntax: sublime-syntax.regex */ `'{{MAT_word_or_any_one_char}}'`.slice(1, -1),
			scope: `invalid.illegal.token.expected.${k_context.id}.${h_env.syntax}`,
			...(b_pop? {pop:b_pop}: {}),
		});

		return i_rule;
	},

	_throw_meta: (h_env, k_context, k_rule, s_meta_scope) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// insert other illegal pop
		k_context.insert(i_rule++, {
			match: /* syntax: sublime-syntax.regex */ `'{{MAT_word_or_any_one_char}}'`.slice(1, -1),
			scope: `meta.${s_meta_scope}.${h_env.syntax} invalid.illegal.token.expected.${k_context.id}.${h_env.syntax}`,
			pop: true,
		});

		return i_rule;
	},

	_goto: (h_env, k_context, k_rule, w_context_goto) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// insert jump
		k_context.insert(i_rule++, {
			match: /* syntax: sublime-syntax.regex */ `'{{PLA_anything}}'`.slice(1, -1),
			set: w_context_goto,
		});

		return i_rule;
	},

	_meta: (h_env, k_context, k_rule, s_meta_scope) => {
		let g_source = k_rule.source;

		// push a meta content scope to back of stack
		if(g_source.set) {
			// coerce to array
			if(!Array.isArray(g_source.set)) g_source.set = [g_source.set];

			let s_context_meta = `${k_context.id}_META`;

			// create new context
			k_context.def.append(s_context_meta, [
				{meta_include_prototype:false},
				{meta_content_scope:s_meta_scope},
				{
					match: /* syntax: sublime-syntax.regex */ `'{{PLA_anything}}'`.slice(1, -1),
					pop: true,
				},
			]);

			// push to 'bottom' of stack
			g_source.set.unshift(s_context_meta);
		}
		else {
			throw new Error(`'_meta' used on ${k_context.id} context but no stack in rule`);
		}
	},

	...punctuation('section', 'brace', '\\{', '\\}'),
	...punctuation('definition', 'bracket', '\\[', '\\]'),
	...punctuation('section', 'paren', '\\(', '\\)'),

	_switch: (h_env, k_context, k_rule, a_cases) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// each case
		for(let z_case of a_cases) {
			// string
			if('string' === typeof z_case) {
				// cast to string
				let s_case = z_case;

				// insert rule
				k_context.insert(i_rule++, {
					match: /* syntax: sublime-syntax.regex */ `'{{${s_case}_LOOKAHEAD}}'`.slice(1, -1),
					set: s_case,
				});
			}
			// object
			else if('object' === typeof z_case) {
				// cast to object
				let h_case = z_case;

				// 0th key
				let s_token = Object.keys(h_case)[0];

				// insert rule
				k_context.insert(i_rule++, {
					match: /* syntax: sublime-syntax.regex */ `'{{${s_token}_LOOKAHEAD}}'`.slice(1, -1),
					set: h_case[s_token],
				});
			}
			// other?
			else {
				throw new TypeError(`unexpected type for _switch case: ${z_case}`);
			}
		}

		return i_rule;
	},

	_switch_push: (h_env, k_context, k_rule, a_cases) => {
		// remove source rule from context
		let i_rule = k_context.drop(k_rule);

		// each case
		for(let z_case of a_cases) {
			// string
			if('string' === typeof z_case) {
				// cast to string
				let s_case = z_case;

				// insert rule
				k_context.insert(i_rule++, {
					match: /* syntax: sublime-syntax.regex */ `'{{${s_case}_LOOKAHEAD}}'`.slice(1, -1),
					push: s_case,
				});
			}
			// object
			else if('object' === typeof z_case) {
				// cast to object
				let h_case = z_case;

				// 0th key
				let s_token = Object.keys(h_case)[0];

				// insert rule
				k_context.insert(i_rule++, {
					match: /* syntax: sublime-syntax.regex */ `'{{${s_token}_LOOKAHEAD}}'`.slice(1, -1),
					push: h_case[s_token],
				});
			}
			// other?
			else {
				throw new TypeError(`unexpected type for _switch case: ${z_case}`);
			}
		}

		return i_rule;
	},
};

// 
const load_syntax_source = (p_yaml) => {
	// syntax def
	let s_def_contents = fs.readFileSync(p_yaml);
	let k_syntax = syntax.def.from_yaml_contents(s_def_contents, p_yaml);

	// extends super source
	if(k_syntax.other._extends) {
		// resolve path
		let p_super = path.resolve(path.dirname(p_yaml), k_syntax.other._extends);

		// load super syntax
		let k_syntax_super = load_syntax_source(p_super);

		// extend this
		k_syntax.extends(k_syntax_super);

		// remove property
		delete k_syntax.other._extends;
	}

	return k_syntax;
};

const H_MAGICS = {
	pop(h_env, k_syntax, s_state) {
		k_syntax.append(`${s_state}.POP`, [
			{
				include: s_state,
			},
			{
				include: 'else_pop',
			},
		]);
	},

	star(h_env, k_syntax, s_state) {
		k_syntax.append(`${s_state}.STAR`, [
			{
				match: `${s_state}_LOOKAHEAD`,
				push: s_state,
			},
			{
				include: 'else_pop',
			},
		]);
	},

	plus(h_env, k_syntax, s_state) {
		k_syntax.append(`${s_state}.PLUS`, [
			{
				match: `${s_state}_LOOKAHEAD`,
				set: [
					`${s_state}.STAR`,
					s_state,
				],
			},
			{
				match: /* syntax: sublime-syntax.regex */ `'{{MAT_word_or_any_one_char}}'`.slice(1, -1),
				scope: `invalid.illegal.token.expected.${s_state}.STAR.${h_env.syntax}`,
				...(b_pop? {pop:b_pop}: {}),
			},
		]);

		if(!(`${s_state}.STAR` in k_syntax.contexts)) {
			H_MAGICS.star(h_env, k_syntax, s_state);
		}
	},
};


// 
const build_syntax = (h_env) => {
	// syntax source
	let k_syntax = load_syntax_source(process.argv[2]);

	// set env syntax
	let s_syntax = h_env.syntax = /\.([^.]+)$/.exec(k_syntax.other.scope)[1];

	// each rule in syntax
	let a_rules = [...k_syntax.rules()];
	for(let [k_rule, k_context] of a_rules) {
		// ref rule source
		let g_source = k_rule.source;

		// each modifier
		for(let s_modifier in H_MODIFIERS) {
			// rule source has modifier
			if('object' === typeof g_source && s_modifier in g_source) {
				// fetch value from source
				let w_value = g_source[s_modifier];

				// delete from object in case it is cloned for rule
				delete g_source[s_modifier];

				// apply transform
				H_MODIFIERS[s_modifier](h_env, k_context, k_rule, w_value);
			}
		}
	}

	// magic states
	{
		let as_magic_states = new Set();

		// each subrule in context
		for(let [k_rule] of k_syntax.rules()) {
			// each state
			for(let s_state of k_rule.states()) {
				// state name includes dot
				if(s_state.includes('.')) {
					as_magic_states.add(s_state);
				}
			}
		}

		// each magic state
		for(let s_state_magic of as_magic_states) {
			let [, s_state_src, s_magic] = /^(.+)\.(.+)$/.exec(s_state_magic);

			// apply magic
			H_MAGICS[s_magic.toLowerCase()](h_env, k_syntax, s_state_src);
		}
	}

	// each rule (again)
	a_rules = [...k_syntax.rules()];
	for(let [k_rule] of a_rules) {
		// replace placeholders
		k_rule.scopes(s_scope => s_scope.replace(/\.SYNTAX/g, `.${s_syntax}`));
	}

	// validate
	k_syntax.validate();

	// return
	return k_syntax;
};

module.exports = {
	build() {
		return new Promise((fk_resolve) => {
			// consume prefix context from stdin
			let s_prefixes_jsonld = '';
			process.stdin.setEncoding('utf8');
			process.stdin
				.on('data', (s_chunk) => {
					s_prefixes_jsonld += s_chunk;
				})
				.on('end', () => {
					let g_jsonld = JSON.parse(s_prefixes_jsonld);
					let h_prefixes = g_jsonld['@context'];

					// build syntax
					fk_resolve(build_syntax({
						prefixes: h_prefixes,
					}));
				});
		});
	},
};

