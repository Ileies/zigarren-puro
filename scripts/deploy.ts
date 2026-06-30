import { $ } from 'bun';

const REMOTE_DIR = `/zigarren-puro.de/httpdocs/`;

try {
	console.log('Creating entry.cjs in build directory');
	await $`echo 'import("./index.js");' > ./build/entry.cjs`;
	await $`cp ./package.json ./build`;

	// Install production dependencies (including native addons like better-sqlite3)
	console.log('Installing production dependencies in build directory...');
	await $`npm install --omit=dev`.cwd('./build');

	// Compress build directory
	console.log('Compressing build directory...');
	await $`tar -czf build.tar.gz -C ./build .`;

	// Upload compressed build
	console.log('Uploading compressed build...');
	await $`scp build.tar.gz zp:/tmp/build.tar.gz`;

	// Clean remote directory (excluding data folder)
	console.log('Cleaning remote directory...');
	await $`ssh zp "find ${REMOTE_DIR} -mindepth 1 -maxdepth 1 ! -name 'data' -exec rm -rf {} +"`;

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
