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
	export let initialAfter: string | undefined = undefined
	export let initialHasMore = false
	export let loadMoreUrl: string

	const imgPostFilter = (post: RedditPost) => {
		return hasMediaContent(post)
	}

	$: filteredPosts = allPosts.filter(imgPostFilter)

	$: console.log(`Displaying ${filteredPosts.length} media items out of ${allPosts.length}.`)
	$: {
		const typeCounts = allPosts.reduce(
			(acc, post) => {
				acc[post.type] = (acc[post.type] || 0) + 1
				return acc
			},
			{} as Record<string, number>
		)
		console.table(typeCounts)
	}

	const loadMore = async () => {
		if (isLoading || !hasMore || !nextAfter) return

		isLoading = true
		try {
			const params = new URLSearchParams({
				after: nextAfter,
				limit: '30',
			})
			const response = await fetch(`${loadMoreUrl}&${params}`)
			if (!response.ok) {
				throw new Error(`Failed to load more posts: ${response.statusText}`)
			}

			const data = await response.json()
			if (data.error) {
				throw new Error(data.error)
			}

			allPosts = [...allPosts, ...data.posts]
			nextAfter = data.after
			hasMore = data.hasMore
		} catch (error) {
			console.error('Error loading more posts:', error)
		} finally {
			isLoading = false
		}
	}

	const onPostClick = (post: RedditPost) => {
		console.log(post)
		fullScreenPost = post
	}
	const onModalHide = () => {
		fullScreenPost = null
	}

	let fullScreenPost: RedditPost | null
	let allPosts = posts
	let nextAfter = initialAfter
	let hasMore = initialHasMore
	let isLoading = false

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

{#if hasMore}
	<div class="load-more-container">
		<button class="load-more-btn" on:click={loadMore} disabled={isLoading}>
			{#if isLoading}
				Loading...
			{:else}
				Load More
			{/if}
		</button>
	</div>
{/if}

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

	.load-more-container {
		display: flex;
		justify-content: center;
		margin: 2rem 0;
	}

	.load-more-btn {
		padding: 0.75rem 2rem;
		background: #1976d2;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.2s;
	}

	.load-more-btn:hover:not(:disabled) {
		background: #1565c0;
	}

	.load-more-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
