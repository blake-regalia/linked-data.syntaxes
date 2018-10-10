const transform = require('./transform.js');

transform.build().then((k_syntax) => {
	// reserialize syntax def; dump changes
	process.stdout.write(k_syntax.serialize_sublime_syntax());
});
