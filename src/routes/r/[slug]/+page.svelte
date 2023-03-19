<script lang="ts">
	import RedditImageGallery from '$lib/views/RedditImageGallery.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: isMulti = data.sub.includes('+');
</script>

<RedditImageGallery
	posts={data.posts}
	title={`r/${data.sub}`}
	showSub={isMulti}
	url={`https://reddit.com/r/${data.sub}`}
/>
