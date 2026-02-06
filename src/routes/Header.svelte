<script lang="ts">
	import { page } from '$app/stores'
	import github from '$lib/images/github.svg'
	import { removeVisitedSub, visitedSubs } from '$lib/stores/redditHistory'

	type LinkItem = {
		href: string
		label: string
	}

	const pinnedSubs: LinkItem[] = [
		{ href: '/r/pics', label: '/r/pics' },
		{ href: '/r/oldschoolcool', label: '/r/oldschoolcool' },
		{ href: '/r/itookapicture', label: '/r/itookapicture' },
		{ href: '/r/Pareidolia', label: '/r/Pareidolia' },
	]
</script>

<header>
	<div class="corner"></div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			{#each pinnedSubs as link}
				<li aria-current={$page.url.pathname === link.href ? 'page' : undefined}>
					<a href={link.href}>{link.label}</a>
				</li>
			{/each}

			{#if $visitedSubs.length > 0}
				<li class="history-separator" aria-hidden="true">|</li>
				{#each $visitedSubs as item (item.sub)}
					<li
						class="history-item"
						aria-current={$page.url.pathname === `/r/${item.sub}` ? 'page' : undefined}
					>
						<a href={`/r/${item.sub}`}>/r/{item.sub}</a>
						<button
							type="button"
							class="remove-history"
							on:click={() => removeVisitedSub(item.sub)}
							aria-label={`Remove /r/${item.sub} from recent subreddits`}
						>
							x
						</button>
					</li>
				{/each}
			{/if}
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner">
		<a href="https://github.com/tomasklingen">
			<img src={github} alt="GitHub" />
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: var(--color-bg-2);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--color-bg-2);
		background-size: contain;
		overflow-x: auto;
		white-space: nowrap;
	}

	li {
		position: relative;
		height: 100%;
		display: flex;
		align-items: center;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	.history-separator {
		padding: 0 0.5rem;
		opacity: 0.5;
	}

	.history-item a {
		padding-right: 0.2rem;
	}

	.remove-history {
		border: 0;
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
		font-size: 0.8rem;
		line-height: 1;
		padding: 0 0.45rem 0 0.15rem;
		height: 100%;
		text-transform: uppercase;
	}

	a:hover,
	.remove-history:hover {
		color: var(--color-theme-1);
	}
</style>
