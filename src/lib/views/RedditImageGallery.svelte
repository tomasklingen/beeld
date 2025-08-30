<script lang="ts">
	import { getGalleryImageUrl } from '$lib/RedditService'
	import type { RedditPost } from '$lib/types/reddit'
	import { hasMediaContent } from '$lib/types/reddit'
	import Image from './Image.svelte'
	import Post from './Post.svelte'

	let {
		posts,
		title,
		url,
		showSub = false,
		showUsername = true,
		initialAfter = undefined,
		initialHasMore = false,
		loadMoreUrl,
	}: {
		posts: RedditPost[]
		title: string
		url: string
		showSub?: boolean
		showUsername?: boolean
		initialAfter?: string | undefined
		initialHasMore?: boolean
		loadMoreUrl: string
	} = $props()

	let fullScreenPost = $state<RedditPost | null>(null)
	let allPosts = $state(posts)
	let nextAfter = $state(initialAfter)
	let hasMore = $state(initialHasMore)
	let isLoading = $state(false)

	let sectionElement = $state<HTMLElement>()
	let columnCount = $state(5)
	let columns = $state<RedditPost[][]>([])
	let resizeTimeout = 0

	// Update column count on mount
	$effect(() => {
		if (sectionElement) {
			const containerWidth = sectionElement.offsetWidth
			const minColumnWidth = 400 // 25em ≈ 400px
			columnCount = Math.max(1, Math.min(5, Math.floor(containerWidth / minColumnWidth)))
		}
	})

	// Distribute posts into columns using height-based placement
	$effect(() => {
		const newColumns = Array.from({ length: columnCount }, () => [] as RedditPost[])
		const columnHeights = Array.from({ length: columnCount }, () => 0)

		filteredPosts.forEach((post) => {
			// Use image dimensions for height estimation
			let estimatedHeight = 300
			if (post.type === 'image' && post.preview?.images?.[0]?.source) {
				const { width, height } = post.preview.images[0].source
				estimatedHeight = (height / width) * 400 + 100 // Add margin for caption
			}

			// Find column with shortest estimated height
			const shortestIndex = columnHeights.indexOf(Math.min(...columnHeights))
			newColumns[shortestIndex].push(post)
			columnHeights[shortestIndex] += estimatedHeight
		})

		columns = newColumns
	})

	const imgPostFilter = (post: RedditPost) => {
		return hasMediaContent(post)
	}

	const filteredPosts = $derived(allPosts.filter(imgPostFilter))

	$effect(() => {
		console.log(`Displaying ${filteredPosts.length} media items out of ${allPosts.length}.`)
	})

	$effect(() => {
		const typeCounts = allPosts.reduce(
			(acc, post) => {
				acc[post.type] = (acc[post.type] || 0) + 1
				return acc
			},
			{} as Record<string, number>
		)
		console.table(typeCounts)
	})

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

	$effect(() => {
		fixateScrolling(!!fullScreenPost)
	})

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
<section bind:this={sectionElement}>
	{#each columns as column}
		<div class="column">
			{#each column as post (post.id)}
				<div class="post">
					<Post {post} {showSub} {showUsername} onclick={() => onPostClick(post)} />
				</div>
			{/each}
		</div>
	{/each}
</section>

{#if hasMore}
	<div class="load-more-container">
		<button class="load-more-btn" onclick={loadMore} disabled={isLoading}>
			{#if isLoading}
				Loading...
			{:else}
				Load More
			{/if}
		</button>
	</div>
{/if}

<svelte:window
	onkeydown={onKeydown}
	onresize={() => {
		clearTimeout(resizeTimeout)
		resizeTimeout = setTimeout(() => {
			if (sectionElement) {
				const containerWidth = sectionElement.offsetWidth
				const minColumnWidth = 400
				const newColumnCount = Math.max(1, Math.min(5, Math.floor(containerWidth / minColumnWidth)))
				if (newColumnCount !== columnCount) {
					columnCount = newColumnCount
				}
			}
		}, 50)
	}}
/>

{#if fullScreenPost}
	<div
		class="backdrop"
		onclick={(event) => (event.target as HTMLElement).tagName !== 'IMG' && onModalHide()}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && onModalHide()}
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
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.column {
		flex: 1;
		min-width: 25em;
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
