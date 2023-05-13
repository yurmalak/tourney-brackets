import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

/** @type {import('vite').UserConfig} */
export default defineConfig({
	plugins: [sveltekit()],
	test: {
		globals: true,
		onConsoleLog: message => !message.startsWith("[log]"),
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./setupTests.js']
	}
});
