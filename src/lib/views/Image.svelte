<script lang="ts">
	export let src: string
	export let thumbnail: string | undefined = undefined
	export let alt: string
	export let width: number | undefined = undefined
	export let height: number | undefined = undefined

	import { createEventDispatcher, onMount } from 'svelte'
	import BlurredImg from './BlurredImg.svelte'

	const dispatch = createEventDispatcher()
	let thisImg: HTMLImageElement
	let loaded = false

	onMount(() => {
		if (!thisImg) {
			return
		}
		if (thisImg.complete) {
			loaded = true
			dispatch('loaded')
			return
		}
		thisImg.addEventListener('load', () => {
			loaded = true
			dispatch('loaded')
		})
	})
</script>

<figure>
	{#if thumbnail}
		<div style:zIndex={-1}>
			<BlurredImg {width} {height} src={thumbnail} blur={!loaded} on:click />
		</div>
	{/if}

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<img
		{src}
		{alt}
		loading="lazy"
		bind:this={thisImg}
		class:loaded
		class:absolute={thumbnail}
		on:click
	/>
</figure>

<style>
	figure {
		height: 100%;
		position: relative;
		margin: 0;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0;
		transition: opacity 0.5s ease-out;
	}

	img.absolute {
		position: absolute;
		left: 0;
		top: 0;
	}
	img.loaded {
		opacity: 1;
	}
</style>
