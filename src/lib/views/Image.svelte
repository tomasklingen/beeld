<script lang="ts">
	export let src: string
	export let thumbnail: string | undefined = undefined
	export let alt: string
	export let width: number | undefined
	export let height: number | undefined

	let loaded = false

	import { onMount } from 'svelte'
	import BlurredImg from './BlurredImg.svelte'

	let thisImg: HTMLImageElement

	onMount(async () => {
		if(!thisImg){
			return
		}
		if (thisImg.complete) {
			loaded = true
			return
		}
		thisImg.addEventListener('load', () => {
			loaded = true
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
	<img {src} {alt} loading="lazy" bind:this={thisImg} class:loaded on:click />
	</figure>

<style>
	figure {
		position: relative;
		margin: 0;
		transition: all 0.4s ease-in-out;
	}
	img {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0;
		transition: opacity 0.5s ease-out;
		min-height: 20em;
	}
	img.loaded {
		min-height: 0;
		opacity: 1;
	}
</style>
