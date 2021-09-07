// color palette names:
// 0: root
// 1: scape
// 2: flare
// 3: echo
// 4: chip

// version string
const s_version = process.argv[3];

// import def from src file
const g_def = require(`../color-schemes/${process.argv[2]}.js`);

// blend function
const blend = (s_name, x_blend) => ({
	foreground: `color(var(${s_name}) blend(${x_blend >= 0? '#fff': '#000'} ${Math.abs(x_blend)}% hsl))`,
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

// apply pre-blending
PREBLEND: {
	const R_COLOR = /^color\((.+)\)$/;
	const R_MOD = /^var\((.+?)\)\s+(.+)$/;

	const R_HSL = /^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/;
	const R_BLEND = /^blend\((.+?)\s+(\d+)%\s+hsl\)$/;

	const lerp = (x_a, x_b, x_t) => (1 - x_t) * x_a + x_t * x_b;

	const render_fix_color = (g_rule, s_property) => {
		const sx_color = g_rule[s_property];

		const m_color = R_COLOR.exec(sx_color);
		if(!m_color) return;

		const m_mod = R_MOD.exec(m_color[1]);
		if(!m_mod) return;

		const [, si_var, sx_fun] = m_mod;
		const sx_base = g_scheme.variables[si_var];

		const [, s_base_hue, s_base_sat, s_base_lum] = R_HSL.exec(sx_base);
		let x_base_hue = +s_base_hue;
		let x_base_sat = (+s_base_sat) / 100;
		let x_base_lum = (+s_base_lum) / 100;

		const m_blend = R_BLEND.exec(sx_fun);
		if(m_blend) {
			const [, s_blend_color, s_blend_pct] = m_blend;

			let x_factor = (+s_blend_pct) / 100;

			let x_blend_hue = 0;
			let x_blend_sat = 0;
			let x_blend_lum = 0;
			if('#fff' === s_blend_color) {
				x_blend_lum = 1;
			}

			if(x_base_hue > x_blend_hue) {
				x_factor = 1 - x_factor;
			}

			if(Math.abs(x_base_hue - x_blend_hue) > 180) {
				if(x_base_hue < x_blend_hue) {
					x_base_hue += 360;
				}
				else {
					x_blend_hue += 360;
				}
			}

			const x_new_hue = Math.abs(x_base_hue * x_factor + x_blend_hue * (1 - x_factor)) % 360;
			const x_new_sat = lerp(x_base_sat, x_blend_sat, 1 - x_factor) * 100;
			const x_new_lum = lerp(x_base_lum, x_blend_lum, 1 - x_factor) * 100;

			// apply new hsl
			g_rule[s_property] = `hsl(${x_new_hue}, ${Math.round(x_new_sat)}%, ${Math.round(x_new_lum)}%)`;
		}
	};

	// apply bugged hsl blending
	for(const g_rule of g_scheme.rules) {
		render_fix_color(g_rule, 'foreground');
		render_fix_color(g_rule, 'background');
	}
}

// stringify result
process.stdout.write(JSON.stringify(g_scheme, null, '\t'));
