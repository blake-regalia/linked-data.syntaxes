const util = require('util');
const yaml = require('js-yaml');

const string_to_regex = s => s.replace(/([.|?*+[\](){}\\^$])/g, '\\$1');

const r_switches = /\(\?([ix]+)\)/g;
const regex_to_literal = (s_regex, b_no_unicode_mode=false) => {
	let s_switches = '';
	let m_switches = r_switches.exec(s_regex);
	s_regex = s_regex.replace(r_switches, '').replace(/[\r\n]/g, '');
	let b_ignore_case = false;

	// extract switches from modes
	if(m_switches) {
		let s_switch = m_switches[1];

		// case insensitivity
		if(s_switch.includes('i')) {
			// s_switches += 'i';
			b_ignore_case = true;
		}

		// no whitespaces
		if(s_switch.includes('x')) {
			s_regex = s_regex.replace(/\s+/g, '');
		}
	}

	if(b_no_unicode_mode) {
		s_regex = s_regex
			.replace(/\\x\{([A-Za-z0-9]{2})\}/g, '\\x$1')
			.replace(/\\x\{([A-Za-z0-9]{4})\}/g, '\\u$1')
			.replace(/\\x\{([A-Za-z0-9]{4,5})\}(-\\x\{([A-Za-z0-9]{5})\})?/g, '');
	}
	else {
		// add unicode switch
		if(/\\x\{([A-Za-z0-9]+)\}/.test(s_regex)) s_switches += 'u';

		s_regex = s_regex.replace(/\\x\{([A-Za-z0-9]+)\}/g, '\\u{$1}');
	}

	// transition to javascript regex
	s_regex = s_regex
		.replace(/\\\\(.)/g, '$1')
		.replace(/\\([-])/g, '$1');

	return [new RegExp(s_regex), b_ignore_case];
};

const captures_to_map = (a_captures) => {
	let h_map = {};
	for(let i_capture=0; i_capture<a_captures.length; i_capture++) {
		h_map[(i_capture+1)+''] = a_captures[i_capture];
	}
	return h_map;
};

const scope_to_context = s_scope => s_scope
	.replace(/[-.](\w)/g, (s_ignore, s_char) => s_char.toUpperCase());


const R_REFERENCE = /\{\{([A-Za-z0-9_]+)\}\}/g;

const search_reachable = (h_defined, a_search, as_reachable=new Set()) => {
	for(let s_search of a_search) {
		// first encounter
		if(!as_reachable.has(s_search)) {
			// add to set
			as_reachable.add(s_search);

			// recurse on children
			search_reachable(h_defined, [...h_defined[s_search]], as_reachable);
		}
	}

	return as_reachable;
};

class def {
	static from_yaml_contents(s_contents, p_yaml) {
		// parse syntax def as yaml
		return new def(yaml.safeLoad(s_contents), p_yaml);
	}

	constructor(g_syntax, p_syntax) {
		let h_contexts = {};
		for(let [si_context, a_rules] of Object.entries(g_syntax.contexts)) {
			h_contexts[si_context] = new context(a_rules, si_context, this);
		}

		// normalize name
		let s_name = '';
		if(g_syntax.name) {
			s_name = `${g_syntax.name} (LinkedData)`;
		}

		Object.assign(this, {
			path: p_syntax,
			name: s_name,
			other: g_syntax,
			variables: g_syntax.variables,
			contexts: h_contexts,
		});
	}

	serialize_sublime_syntax(g_def={}) {
		return `%YAML 1.2\n---\n${yaml.safeDump({
			...this.other,
			...g_def,
			name: this.name,
			variables: this.export_variables(),
			contexts: Object.entries(this.contexts)
				.reduce((h_contexts, [si_context, k_context]) => ({
					...h_contexts,
					[si_context]: k_context.export(),
				}), {}),
		}, {
			noRefs: true,
			noCompatMode: true,
			lineWidth: 600,
			schema: yaml.DEFAULT_FULL_SCHEMA,
		})}`;
	}

	export_ace_rules(gc_export) {
		let b_no_unicode_mode = gc_export.no_unicode_mode || false;

		let h_rules = {};
		let h_expanded = this.export_variables();

		for(let [si_context, k_context] of Object.entries(this.contexts)) {
			let b_prototype = true;

			h_rules[si_context] = k_context.export((g_source) => {
				let h_rule = {};

				// include prototype
				if('meta_include_prototype' in g_source && !g_source.meta_include_prototype) {
					b_prototype = false;
				}

				// include
				if(g_source.include) {
					h_rule.include = g_source.include;
				}

				// match to regex
				if(g_source.match) {
					let b_ignore_case = false;
					[h_rule.regex, b_ignore_case] = regex_to_literal(g_source.match
						.replace(R_REFERENCE, (s_match, s_ref) => h_expanded[s_ref]), b_no_unicode_mode);

					if(b_ignore_case) {
						h_rule.ignoreCase = true;
					}
				}

				// set to next
				if(g_source.set) {
					h_rule.next = g_source.set;
				}
				// pop to next
				else if(g_source.pop) {
					h_rule.next = 'pop';
				}

				// push to push
				if(g_source.push) {
					h_rule.push = g_source.push;
				}

				// scope to token
				if(g_source.scope) {
					h_rule.token = g_source.scope;
				}
				// captures to token
				else if(g_source.captures) {
					let a_tokens = [];
					for(let [i_index, s_scope] of Object.entries(g_source.captures)) {
						a_tokens[(+i_index)-1] = s_scope;
					}
					h_rule.token = a_tokens;
				}

				// remove
				if(!Object.keys(h_rule).length) return null;

				// missing token key
				if(Array.isArray(h_rule.next || h_rule.push)) {
					let s_which = h_rule.next? 'next': 'push';

					// reverse stack order!
					let a_stack = h_rule[s_which];

					// serialization
					h_rule[s_which] = {
						[util.inspect.custom]: () => /* syntax: js */ `${s_which}_states(${
							util.inspect(a_stack, {
								depth: Infinity,
								maxArrayLength: Infinity,
								breakLength: Infinity,
								compact: false,
							})
						})`,
					};

					// add state name
					h_rule.stateName = `${si_context}_to_${a_stack.join('_after_')}`;
				}

				// save associative rule
				return h_rule;
			});

			if(b_prototype && 'prototype' !== si_context) {
				h_rules[si_context].unshift({
					include: 'prototype',
				});
			}
		}

		return h_rules;
	}

	export_variables() {
		let h_expanded = {};
		let h_variables = this.variables;
		for(let [si_variable, s_pattern] of Object.entries(h_variables)) {
			h_expanded[si_variable] = s_pattern.replace(R_REFERENCE, (s_match, s_ref) => {
				// ref not expanded yet
				if(!(s_ref in h_expanded)) {
					throw new Error(`variable '${s_ref}' referenced in ${this.path}#${si_variable} is out of reference order`);
				}

				return h_expanded[s_ref];
			});
		}

		return h_expanded;
	}

	* rules() {
		for(let k_context of Object.values(this.contexts)) {
			yield* k_context.subrules();
		}
	}

	append(si_context, a_rules) {
		let h_contexts = this.contexts;
		if(si_context in h_contexts) {
			throw new Error(`context '${si_context}' already exists`);
		}

		// create new context from rule list and append it to hash
		return (h_contexts[si_context] = new context(a_rules, si_context, this));
	}

	extends(k_other) {
		Object.assign(this, {
			variables: {
				...k_other.variables,
				...this.variables,
			},

			contexts: {
				...Object.entries(k_other.contexts)
					.reduce((h_contexts, [si_context, k_context]) => ({
						...h_contexts,

						// change each context's def pointer to `this`
						[si_context]: Object.assign(k_context, {
							def: this,
						}),
					}), {}),
				...this.contexts,
			},
		});
	}

	validate() {
		let h_contexts = this.contexts;
		let h_defined = {};
		let h_referenced = {};

		for(let [si_context, k_context] of Object.entries(h_contexts)) {
			// context is defined
			// as_defined.add(si_context);
			let as_states_reachable = new Set();

			// each subrule in context
			for(let [k_rule] of k_context.subrules()) {
				let a_states = k_rule.states();

				// each state in rule
				for(let s_state of a_states) {
					// add state to context's set
					as_states_reachable.add(s_state);

					// add state to reference => [...contexts] map
					if(!(s_state in h_referenced)) {
						h_referenced[s_state] = [si_context];
					}
					else {
						h_referenced[s_state].push(si_context);
					}
				}
			}

			// set of states reachable from context
			h_defined[si_context] = as_states_reachable;
		}

		// find all reachable contexts
		let as_reachable = search_reachable(h_defined, ['prototype', 'main']);

		// test each context for reachability
		for(let si_context in h_defined) {
			// not reachable
			if(!as_reachable.has(si_context)) {
				// print
				console.warn(`removed unreachable context '${si_context}'`);

				// remove context
				delete h_contexts[si_context];
			}
		}

		// make sure every reference is defined
		for(let s_state in h_referenced) {
			// reference is not reachable; skip
			if(!(s_state in h_contexts)) continue;

			// reference is not defined
			if(!(s_state in h_defined)) {
				throw new Error(`state '${s_state}' is referenced but not defined; appears in contexts [${h_referenced[s_state].join(', ')}]`);
			}
		}
	}
}


class context {
	static from(a_rules) {
		return new context(a_rules);
	}

	constructor(a_rules, si_context=null, k_def=null) {
		Object.assign(this, {
			id: si_context,
			def: k_def,
		});

		this.rules = a_rules.map((w_rule, i_rule) => rule.from(w_rule, i_rule, this));
	}

	drop(k_rule_drop) {
		let a_rules = this.rules;
		let i_rule = a_rules.indexOf(k_rule_drop);
		a_rules.splice(i_rule, 1);
		return i_rule;
	}

	insert(i_rule, w_rule) {
		this.rules.splice(i_rule, 0, rule.from(w_rule, i_rule, this));
	}

	* subrules() {
		// each rule
		for(let k_rule of this.rules) {
			// yield rule itself
			yield [k_rule, this];

			// yield subrules
			yield* k_rule.subrules();
		}
	}

	export(f_apply) {
		let a_rules = this.rules;
		return a_rules.map(k_rule => k_rule.export(f_apply, a_rules))
			.filter(z_rule => null !== z_rule);
	}
}


const rule_to_states = (g_rule) => {
	// union of `push`, `set` and `include`
	let z_states = g_rule.push || g_rule.set || g_rule.include;

	// no states
	if(!z_states) return [];

	// coerce to array
	let a_states = Array.isArray(z_states)? z_states: [z_states];

	// map each item to state
	return a_states.reduce((a_out, z_state) => [
		...a_out,
		...('string' === typeof z_state
			? [z_state]
			: rule_to_states(z_state)),
	], []);
};


class rule {
	static from(z_rule, i_rule, k_context) {
		if(z_rule instanceof rule) return z_rule;
		else if(!z_rule) throw new Error(`empty context: '${k_context.id}'`);
		return new rule(z_rule, i_rule, k_context);
	}

	constructor(g_rule, i_rule, k_context) {
		// helpers
		if(Array.isArray(g_rule.captures)) {
			g_rule.captures = captures_to_map(g_rule.captures);
		}

		Object.assign(this, {
			context: k_context,
			index: i_rule,
			source: g_rule,
		});
	}

	scopes(f_mutate) {
		let g_source = this.source;

		// simple scope defined; transform
		if(g_source.scope) {
			g_source.scope = f_mutate(g_source.scope);
		}
		// meta scope defined; transform
		else if(g_source.meta_scope) {
			g_source.meta_scope = f_mutate(g_source.meta_scope);
		}
		// meta content scope defined; transform
		else if(g_source.meta_content_scope) {
			g_source.meta_content_scope = f_mutate(g_source.meta_content_scope);
		}
		// capture group defined; transform each
		else if(g_source.captures) {
			for(let [si_key, s_scope] of Object.entries(g_source.captures)) {
				g_source.captures[si_key] = f_mutate(s_scope);
			}
		}

		return this;
	}

	// extract sub states
	states() {
		return rule_to_states(this.source);
	}

	clone(i_rule) {
		return new rule({...this.source}, i_rule, this.context);
	}

	export(f_apply=null, a_rules) {
		let g_export = f_apply? f_apply(this.source, a_rules): this.source;

		if(g_export && g_export.match) {
			return {
				match: g_export.match,
				...g_export,
			};
		}

		return g_export;
	}

	mod(f_mod) {
		this.source = f_mod(this.source);
		return this;
	}

	* subrules() {
		let g_source = this.source;

		let s_stack_mod;
		if(g_source.push) s_stack_mod = 'push';
		else if(g_source.set) s_stack_mod = 'set';

		if(s_stack_mod) {
			let z_stack = g_source[s_stack_mod];
			yield* (new context(Array.isArray(z_stack)? z_stack: [z_stack], this.context.id+'/'+this.index)).subrules();
		}
	}
}

module.exports = {
	def,
	context,
	rule,

	string_to_regex,
	captures_to_map,
	scope_to_context,
};
