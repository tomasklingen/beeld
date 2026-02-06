<script lang="ts">
	import { addVisitedSub } from '$lib/stores/redditHistory'
	import RedditImageGallery from '$lib/views/RedditImageGallery.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	const isMulti = $derived(data.sub.includes('+'))
	let lastRecordedSub = $state('')

	$effect(() => {
		if (data.posts.length > 0 && data.sub !== lastRecordedSub) {
			lastRecordedSub = data.sub
			addVisitedSub(data.sub)
		}
	})
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
