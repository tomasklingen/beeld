<script lang="ts">
	export let posts: RedditPost[]
	export let title: string
	export let url: string
	export let showSub = false

	import type { RedditPost } from '$lib/types/reddit'
	import Post from './Post.svelte'

	const imgPostFilter = (p: RedditPost) => {
		return !p.is_gallery && p.name.startsWith('t3') && p.thumbnail !== 'self'
	}

	$: filteredPosts = posts.filter(imgPostFilter)
</script>

<h1><a href={url}>{title}</a></h1>
<section>
	{#each filteredPosts as post (post.id)}
		<Post {post} {showSub} />
	{/each}
</section>

<style>
	section {
		columns: 5 25em;
		column-gap: 1rem;
	}
</style>
