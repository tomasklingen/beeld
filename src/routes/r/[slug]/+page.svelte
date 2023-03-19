<script lang="ts">
	export let data: PageData

	import RedditImageGallery from '$lib/views/RedditImageGallery.svelte'
	import type { PageData } from './$types'

	$: isMulti = data.sub.includes('+')
</script>

<RedditImageGallery
	posts={data.posts}
	title={`r/${data.sub}`}
	showSub={isMulti}
	url={`https://reddit.com/r/${data.sub}`}
/>
