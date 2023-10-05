// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production

import { redirect } from '@sveltejs/kit'

export function load() {
	redirect(302, '/r/pics');
}
