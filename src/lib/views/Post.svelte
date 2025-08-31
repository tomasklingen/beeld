<script lang="ts">
	import { getGalleryImageUrl } from '$lib/RedditService'
	import type { RedditPost } from '$lib/types/reddit'
	import Image from './Image.svelte'
	import PostDescription from './PostDescription.svelte'

	let {
		post,
		showSub = false,
		showUsername = false,
		onclick,
	}: {
		post: RedditPost
		showSub?: boolean
		showUsername?: boolean
		onclick?: () => void
	} = $props()

	let showEmbed = $state(false)
	let showCaption = $state(false)
	const setShowCaption = () => (showCaption = true)
</script>

<figure>
	{#if post.type === 'embed'}
		{#if showEmbed}
			<iframe
				allowfullscreen
				class="embed"
				src={post.secure_media_embed.media_domain_url}
				title="embed"
			></iframe>
		{:else}
			<Image
				src={post.thumbnail}
				alt={post.title}
				onloaded={setShowCaption}
				onclick={() => (showEmbed = true)}
			/>
		{/if}
	{:else if post.type === 'image'}
		{@const dimensions = post.preview.images[0].source}
		<Image
			src={post.url}
			width={dimensions.width}
			height={dimensions.height}
			alt={post.title}
			thumbnail={post.thumbnail}
			onloaded={setShowCaption}
			{onclick}
		/>
	{:else if post.type === 'gallery'}
		<div class="gallery-container">
			<Image src={getGalleryImageUrl(post)} alt={post.title} onloaded={setShowCaption} {onclick} />
			<div class="gallery-indicator">📷</div>
		</div>
	{/if}

	<figcaption style:visibility={showCaption ? 'visible' : 'hidden'}>
		<PostDescription {post} {showSub} {showUsername} />
	</figcaption>
</figure>

<style>
	figure {
		margin: 0;
		height: 100%;
		width: 100%;
	}
	.embed {
		width: 100%;
		height: 30em;
	}

	.gallery-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.gallery-indicator {
		position: absolute;
		bottom: 8px;
		right: 8px;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 4px 6px;
		border-radius: 4px;
		font-size: 0.8em;
		pointer-events: none;
	}
</style>
