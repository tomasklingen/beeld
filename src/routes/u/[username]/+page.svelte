<script lang="ts">
	export let data: PageData

	import RedditImageGallery from '$lib/views/RedditImageGallery.svelte'
	import type { PageData } from './$types'
</script>

<RedditImageGallery
	posts={data.posts}
	title={`u/${data.username}`}
	url={`https://old.reddit.com/u/${data.username}`}
/>
