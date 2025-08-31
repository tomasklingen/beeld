<script lang="ts">
	import { authorUrl, postUrl } from '$lib/RedditService'
	import type { RedditPost } from '$lib/types/reddit'

	let {
		post,
		showSub = false,
		showUsername = false,
		variant = 'default',
	}: {
		post: RedditPost
		showSub?: boolean
		showUsername?: boolean
		variant?: 'default' | 'fullscreen'
	} = $props()
</script>

<div class="post-description" class:fullscreen={variant === 'fullscreen'}>
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
</div>

<style>
	.post-description {
		font-size: 0.7em;
	}

	.post-description.fullscreen {
		position: fixed;
		bottom: 0px;
		left: 50%;
		transform: translateX(-50%);
		color: white;
		padding: 12px 20px;
		border-radius: 8px;
		font-size: 14px;
		max-width: 90%;
		text-align: center;
		z-index: 1002;
	}

	.post-description.fullscreen a {
		text-decoration: none;
	}

	.post-description.fullscreen a:hover {
		text-decoration: underline;
	}

	.title {
		text-overflow: ellipsis;
		font-weight: 500;
	}
</style>
