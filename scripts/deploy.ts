import { $ } from 'bun';

const REMOTE_DIR = `/zigarren-puro.de/httpdocs/`;
const REMOTE_BUN_BIN = `${REMOTE_DIR}data/runtime/bun`;
const BUN_ARCHIVE_URL =
	'https://github.com/oven-sh/bun/releases/download/bun-v1.4.4/bun-linux-x64-baseline.zip';
const BUN_ARCHIVE_SHA256 = '1fc2edac843102909e3a1be1d8d9802cc6071cf074e67e88231f4ffe0f8b397b';

try {
	console.log('Checking the remote Bun runtime');
	await $`ssh zp "if [ ! -x '${REMOTE_BUN_BIN}' ]; then mkdir -p '${REMOTE_DIR}data/runtime' && curl -fsSL '${BUN_ARCHIVE_URL}' -o /tmp/bun-linux-x64-baseline.zip && printf '%s  %s\\n' '${BUN_ARCHIVE_SHA256}' /tmp/bun-linux-x64-baseline.zip | sha256sum -c - && unzip -p /tmp/bun-linux-x64-baseline.zip bun > '${REMOTE_BUN_BIN}' && chmod 755 '${REMOTE_BUN_BIN}' && rm /tmp/bun-linux-x64-baseline.zip; fi && '${REMOTE_BUN_BIN}' --version"`;

	console.log('Preparing the Bun server entrypoint');
	await $`cp ./scripts/entry.cjs ./build/entry.cjs`;

	// Compress build directory
	console.log('Compressing build directory...');
	await $`tar -czf build.tar.gz -C ./build .`;

	// Upload compressed build
	console.log('Uploading compressed build...');
	await $`scp build.tar.gz zp:/tmp/build.tar.gz`;

	// Clean remote directory (excluding data folder)
	console.log('Cleaning remote directory...');
	await $`ssh zp "find ${REMOTE_DIR} -mindepth 1 -maxdepth 1 ! -name 'data' ! -name 'local.db' -exec rm -rf {} +"`;

	// Extract build on server
	console.log('Extracting build on server...');
	await $`ssh zp "tar -xzf /tmp/build.tar.gz -C ${REMOTE_DIR}"`;

	// Clean up temporary file
	console.log('Cleaning up temporary files...');
	await $`ssh zp "rm /tmp/build.tar.gz"`;
	await $`rm build.tar.gz`;

	// Trigger Plesk Passenger restart
	console.log('Triggering app restart via Plesk...');
	await $`ssh zp "mkdir -p ${REMOTE_DIR}tmp && touch ${REMOTE_DIR}tmp/restart.txt"`;

	console.log('Deployment completed successfully!');
} catch (error) {
	console.error('Deployment failed:', error instanceof Error ? error.message : String(error));
	process.exit(1);
}
