<script lang="ts">
	import RedditImageGallery from '$lib/views/RedditImageGallery.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	const isMulti = $derived(data.sub.includes('+'))
</script>

<RedditImageGallery
	posts={data.posts}
	title={`r/${data.sub}`}
	showSub={isMulti}
	url={`https://reddit.com/r/${data.sub}`}
	initialAfter={data.after}
	initialHasMore={data.hasMore}
	loadMoreUrl={`/api/reddit?subReddit=${encodeURIComponent(data.sub)}`}
/>
