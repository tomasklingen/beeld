<script lang="ts">
	import { hasEmbed, isGifv, isNormalImage } from '$lib/RedditService'
	import Image from './Image.svelte';

	export let posts: RedditPost[]
	export let title: string
	export let url: string
	export let showSub = false
	export let showUsername = true

	import type { RedditPost } from '$lib/types/reddit'
	import Post from './Post.svelte'

	const imgPostFilter = (post: RedditPost) => {
		return hasEmbed(post) || isGifv(post) || isNormalImage(post)
	}

	$: filteredPosts = posts.filter(imgPostFilter)

	$: console.log(`Displaying ${filteredPosts.length} media items.`)

	const onPostClick = (post: RedditPost) => {
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
		if (fullScreenPost) {
			const imgPosts = filteredPosts.filter(isNormalImage)
			const currentIndex = imgPosts.indexOf(fullScreenPost)
			fullScreenPost = imgPosts.at((currentIndex + offset) % imgPosts.length) as RedditPost
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
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="backdrop" on:click={() => onModalHide()}>
		<div class="modal-content">
			<Image
				src={fullScreenPost.url}
				alt={fullScreenPost.title}
			/>
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
