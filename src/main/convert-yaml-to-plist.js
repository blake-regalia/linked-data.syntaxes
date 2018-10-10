const fs = require('fs');
const yaml = require('js-yaml');
const plist = require('plist');

// theme file
let p_file = process.argv[2];

// load color scheme file contents
let s_scheme = fs.readFileSync(p_file, 'utf8');

// parse scheme def as yaml
let g_scheme = yaml.safeLoad(s_scheme, {
	filename: p_file,
});

// output new YAML-tmTheme file
process.stdout.write(plist.build(g_scheme));
