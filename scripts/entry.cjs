const { spawn } = require('node:child_process');
const { join } = require('node:path');

const bun = process.env.BUN_BIN || join(__dirname, 'data', 'runtime', 'bun');
const server = spawn(bun, ['./index.js'], {
	cwd: __dirname,
	env: process.env,
	stdio: 'inherit'
});

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.on(signal, () => server.kill(signal));
}

server.on('error', (error) => {
	console.error(`Unable to start the Bun server at ${bun}:`, error);
	process.exit(1);
});

server.on('exit', (code, signal) => {
	process.exit(signal ? 1 : (code ?? 1));
});
