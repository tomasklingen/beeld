<script lang="ts">
	import { authorUrl, postUrl } from '$lib/RedditService'
	import type { RedditPost } from '$lib/types/reddit'
	import Image from './Image.svelte'

	export let post: RedditPost
	export let showSub = false
	export let showUsername = false

	let showEmbed = false
	let showCaption = false
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
				on:loaded={setShowCaption}
				on:click={() => (showEmbed = true)}
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
			on:loaded={setShowCaption}
			on:click
		/>
	{:else if post.type === 'gallery'}
		<Image src={post.thumbnail} alt={post.title} on:loaded={setShowCaption} on:click />
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
</style>
