<script lang="ts">
	import { authorUrl, hasEmbed, isGifv, isNormalImage, mp4Link, postUrl } from '$lib/RedditService'

	export let post: RedditPost
	export let showSub = false
	export let showUsername = false

	import type { RedditPost } from '$lib/types/reddit'

	const onError = (post: RedditPost) => (e: Event) => {
		console.error('failed to load post', post, e)
	}

	let showEmbed = false
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
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<img src={post.thumbnail} alt="img" on:click={() => (showEmbed = true)} />
		{/if}
	{:else if isGifv(post)}
		<video preload="metadata" controls muted loop on:error={onError(post)}>
			<source src={mp4Link(post.url)} type="video/mp4" />
			<track kind="captions" />
		</video>
	{:else if isNormalImage(post)}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<img src={post.url} alt="img" on:error={onError(post)} on:click />
	{/if}

	<figcaption>
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
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>
