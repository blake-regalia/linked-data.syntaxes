const yaml = require('js-yaml');
const plist = require('plist');

// load input file contents
let s_contents = '';
process.stdin.setEncoding('utf8');
process.stdin
	.on('data', (s_chunk) => {
		s_contents += s_chunk;
	})
	.on('end', () => {
		// parse scheme def as yaml
		let g_scheme = yaml.safeLoad(s_contents, {
			filename: 'stdin',
		});

		// output new YAML-tmTheme file
		process.stdout.write(plist.build(g_scheme));
	});
