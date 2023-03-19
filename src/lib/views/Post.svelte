<script lang="ts">
	export let post: RedditPost
	export let showSub = false

	import type { RedditPost } from '$lib/types/reddit'

	const onError = (post: RedditPost) => (e) => {
		console.error('failed to load post', post)
	}

	const hasEmbed = (p: RedditPost) => p.post_hint === 'rich:video'
	const isGifv = (p: RedditPost) => {
		return (p.url as string).endsWith('gifv')
	}
	const mp4Link = (link: string) => {
		const newlink = link.replace('gifv', 'mp4')
		return newlink
	}
	const isNormalImage = (p: RedditPost) => p.post_hint === 'image'

	const authorUrl = (p: RedditPost) => {
		return `/u/${p.author}`
	}

	const canDisplay = hasEmbed(post) || isGifv(post) || isNormalImage(post)

	const postUrl = (p: RedditPost) => `https://old.reddit.com${p.permalink}`

	let showEmbed = false
</script>

<div class="post">
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
		<video preload="auto" poster={post.thumbnail} controls muted loop on:error={onError(post)}>
			<source src={mp4Link(post.url)} type="video/mp4" />
			<track kind="captions" />
		</video>
	{:else if post.post_hint === 'image'}
		<img src={post.url} alt="img" on:error={onError(post)} />
	{/if}

	{#if canDisplay}
		<div class="details">
			{#if showSub}
				<a href={post.subreddit}>/r/{post.subreddit}</a>
				<span class="seperator" />
			{/if}
			<a href={authorUrl(post)}>
				u/{post.author}
			</a>
			<span class="seperator" />
			<a class="title" href={postUrl(post)} target="_blank" rel="noreferrer">
				{post.title}
			</a>
		</div>
	{/if}
</div>

<style>
	.post {
		display: inline-block;
		margin-bottom: 2em;
		width: 100%;
	}
	.embed {
		width: 100%;
		height: 30em;
	}
	.seperator {
		display: inline-block;

		margin: 0 6px;
	}
	.seperator::after {
		content: '•';
	}
	.details {
		font-size: 0.7em;
		overflow: hidden;
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
		object-fit: contain;
	}
</style>
