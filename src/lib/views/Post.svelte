<script lang="ts">
	import { authorUrl, postUrl, getGalleryImageUrl } from '$lib/RedditService'
	import type { RedditPost } from '$lib/types/reddit'
	import Image from './Image.svelte'

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
		{#if showSub}
			<a href={`/r/${post.subreddit}`}>r/{post.subreddit}</a>
			•
		{/if}
		{#if showUsername}
			<a href={authorUrl(post)}>u/{post.author}</a> •
		{/if}
		<a class="title" href={postUrl(post)} target="_blank" rel="noreferrer">
			{post.title}
		</a>
	</figcaption>
</figure>

<style>
	figure {
		margin: 0;
		height: 100%;
		width: 100%;
	}
	figcaption {
		font-size: 0.7em;
	}
	.embed {
		width: 100%;
		height: 30em;
	}

	.title {
		text-overflow: ellipsis;
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
