<script lang="ts">
	import type { RedditPost } from '$lib/types/reddit'
	import { hasMediaContent } from '$lib/types/reddit'
	import { getGalleryImageUrl } from '$lib/RedditService'
	import Image from './Image.svelte'
	import Post from './Post.svelte'

	export let posts: RedditPost[]
	export let title: string
	export let url: string
	export let showSub = false
	export let showUsername = true

	const imgPostFilter = (post: RedditPost) => {
		return hasMediaContent(post)
	}

	$: filteredPosts = posts.filter(imgPostFilter)

	$: console.log(`Displaying ${filteredPosts.length} media items out of ${posts.length}.`)
	$: {
		const typeCounts = posts.reduce(
			(acc, post) => {
				acc[post.type] = (acc[post.type] || 0) + 1
				return acc
			},
			{} as Record<string, number>
		)
		console.table(typeCounts)
	}

	const onPostClick = (post: RedditPost) => {
		console.log(post)
		fullScreenPost = post
	}
	const onModalHide = () => {
		fullScreenPost = null
	}

	let fullScreenPost: RedditPost | null

	$: fixateScrolling(!!fullScreenPost)

	function fixateScrolling(modalVisible: boolean) {
		if (typeof window !== 'undefined') {
			document.body.classList.toggle('modal-open', modalVisible)
		}
	}

	const onKeydown = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'Escape':
				fullScreenPost = null
				break
			case 'ArrowRight':
				nextImage()
				break
			case 'ArrowLeft':
				nextImage(-1)
				break
		}
	}

	const nextImage = (offset = 1) => {
		if (fullScreenPost && fullScreenPost.type === 'image') {
			const imgPosts = filteredPosts.filter((post) => post.type === 'image')
			const currentIndex = imgPosts.indexOf(fullScreenPost)
			const nextPost = imgPosts.at((currentIndex + offset) % imgPosts.length)
			if (nextPost) {
				fullScreenPost = nextPost
			}
		}
	}
</script>

<h1><a href={url}>{title}</a></h1>
<section>
	{#each filteredPosts as post (post.id)}
		<div class="post">
			<Post {post} {showSub} {showUsername} on:click={() => onPostClick(post)} />
		</div>
	{/each}
</section>

<svelte:window on:keydown={onKeydown} />

{#if fullScreenPost}
	<div
		class="backdrop"
		on:click={() => onModalHide()}
		role="button"
		tabindex="0"
		on:keydown={(e) => e.key === 'Enter' && onModalHide()}
	>
		<div class="modal-content">
			{#if fullScreenPost.type === 'image'}
				<Image src={fullScreenPost.url} alt={fullScreenPost.title} />
			{:else if fullScreenPost.type === 'gallery'}
				<Image src={getGalleryImageUrl(fullScreenPost)} alt={fullScreenPost.title} />
			{:else}
				<Image src={fullScreenPost.thumbnail} alt={fullScreenPost.title} />
			{/if}
		</div>
	</div>
{/if}

<style>
	:global(body.modal-open) {
		overflow-y: hidden;
	}

	.post {
		display: inline-block;
		margin-bottom: 2em;
		width: 100%;
	}

	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(10px);
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.modal-content {
		height: 90%;
		max-width: 90%;
		display: flex;
		align-items: center;
	}

	section {
		columns: 5 25em;
		column-gap: 1rem;
	}
</style>
