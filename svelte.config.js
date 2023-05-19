import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// default options are shown
		adapter: adapter()
	}
};

export default config;
