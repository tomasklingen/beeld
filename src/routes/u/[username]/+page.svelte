<script lang="ts">
	import RedditImageGallery from '$lib/views/RedditImageGallery.svelte'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<RedditImageGallery
	posts={data.posts}
	title={`u/${data.username}`}
	showSub={true}
	showUsername={false}
	url={`https://old.reddit.com/u/${data.username}`}
	initialAfter={data.after}
	initialHasMore={data.hasMore}
	loadMoreUrl={`/api/reddit?username=${encodeURIComponent(data.username)}`}
/>
