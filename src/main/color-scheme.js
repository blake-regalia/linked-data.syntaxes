// color palette names:
// 0: root
// 1: scape
// 2: flare
// 3: echo
// 4: chip

// import def from src file
const g_def = require(`../color-schemes/${process.argv[2]}.js`);

// blend function
const blend = (s_name, x_blend) => ({
	foreground: `color(var(${s_name}) blend(${x_blend >= 0? '#fff': '#000'} ${Math.abs(x_blend)}% hsl)`,
});

// create new scheme object
let g_scheme = {
	...g_def.base,
};

// create rules by merging
let a_rules = g_scheme.rules = [
	...(g_def.base.rules || []),
	...(g_def.rules || []),
];

// ref blends from def
let h_blends = g_def.blends;

// each blend
for(let [s_name, h_scopes] of Object.entries(h_blends)) {
	// each scope
	for(let [si_scope, x_blend] of Object.entries(h_scopes)) {
		// add rule
		a_rules.push({
			scope: si_scope,
			...blend(s_name, x_blend),
		});
	}
}

// stringify result
process.stdout.write(JSON.stringify(g_scheme, null, '\t'));
