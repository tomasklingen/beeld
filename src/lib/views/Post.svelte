<script lang="ts">
	import {
		authorUrl,
		getImageDimensions,
		hasEmbed,
		isGifv,
		isNormalImage,
		mp4Link,
		postUrl,
	} from '$lib/RedditService'

	export let post: RedditPost
	export let showSub = false
	export let showUsername = false

	import type { RedditPost } from '$lib/types/reddit'

	import Image from './Image.svelte'

	const onError = (post: RedditPost) => (e: Event) => {
		console.error('failed to load post', post, e)
	}

	let showEmbed = false
	let showCaption = false
	const setShowCaption = () => (showCaption = true)
</script>

<figure>
	{#if hasEmbed(post)}
		{#if showEmbed}
			<iframe
				allowfullscreen
				class="embed"
				src={post.secure_media_embed.media_domain_url}
				title="embed"
			/>
		{:else}
			<Image
				src={post.thumbnail}
				alt={post.title}
				on:loaded={setShowCaption}
				on:click={() => (showEmbed = true)}
			/>
		{/if}
	{:else if isGifv(post)}
		<video preload="metadata" controls muted loop on:canplay={setShowCaption} on:error={onError(post)}>
			<source src={mp4Link(post.url)} type="video/mp4" />
			<track kind="captions" />
		</video>
	{:else if isNormalImage(post)}
		{@const { width, height } = getImageDimensions(post)}
		<Image
			src={post.url}
			{width}
			{height}
			alt={post.title}
			thumbnail={post.thumbnail}
			on:loaded={setShowCaption}
			on:click
		/>
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
	video {
		width: 100%;
		max-height: inherit;
	}
</style>
