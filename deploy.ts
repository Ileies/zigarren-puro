import { $ } from 'bun';

const SSH_HOST = 'hosting212494@zigarren-puro.de';
const REMOTE_DIR = `/zigarren-puro.de/httpdocs/`;

try {
	console.log('Creating entry.cjs in build directory');
	await $`echo 'import("./index.js");' > ./build/entry.cjs`;
	await $`cp ./package.json ./build`

	// Compress build directory
	console.log('Compressing build directory...');
	await $`tar -czf build.tar.gz -C ./build .`;

	// Upload compressed build
	console.log('Uploading compressed build...');
	await $`scp build.tar.gz ${SSH_HOST}:/tmp/build.tar.gz`;

	// Clean remote directory (excluding data folder)
	console.log('Cleaning remote directory...');
	await $`ssh ${SSH_HOST} "find ${REMOTE_DIR} -mindepth 1 -maxdepth 1 ! -name 'data' -exec rm -rf {} +"`;

	// Extract build on server
	console.log('Extracting build on server...');
	await $`ssh ${SSH_HOST} "tar -xzf /tmp/build.tar.gz -C ${REMOTE_DIR}"`;

	// Clean up temporary file
	console.log('Cleaning up temporary files...');
	await $`ssh ${SSH_HOST} "rm /tmp/build.tar.gz"`;
	await $`rm build.tar.gz`;

	console.log('Deployment completed successfully!');
} catch (error) {
	console.error('Deployment failed:', error instanceof Error ? error.message : String(error));
	process.exit(1);
}
