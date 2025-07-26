<script lang="ts">
	export let src: string
	export let thumbnail: string | undefined = undefined
	export let alt: string
	export let width: number | undefined = undefined
	export let height: number | undefined = undefined

	import { getImageUrl } from '$lib/utils/imageProxy'
	import { createEventDispatcher, onMount } from 'svelte'
	import BlurredImg from './BlurredImg.svelte'

	const dispatch = createEventDispatcher()
	let thisImg: HTMLImageElement
	let loaded = false
	let hasError = false
	let retryCount = 0
	const maxRetries = 2

	// Use proxy for Reddit images to avoid CORS issues
	$: proxiedSrc = getImageUrl(src)
	$: proxiedThumbnail = thumbnail ? getImageUrl(thumbnail) : undefined

	const handleLoad = () => {
		loaded = true
		hasError = false
		dispatch('loaded')
	}

	const handleError = () => {
		console.warn(`Failed to load image: ${proxiedSrc}`)

		if (retryCount < maxRetries) {
			// Retry by forcing a reload
			retryCount++
			console.log(`Retrying image load (attempt ${retryCount}/${maxRetries})`)

			// Small delay before retry to avoid immediate retry spam
			setTimeout(() => {
				if (thisImg) {
					thisImg.src = `${proxiedSrc}?retry=${retryCount}`
				}
			}, 1000 * retryCount) // Progressive backoff
		} else {
			hasError = true
			dispatch('error', { src: proxiedSrc })
		}
	}

	onMount(() => {
		if (!thisImg) {
			return
		}

		if (thisImg.complete && !thisImg.naturalWidth) {
			// Image failed to load before mount
			handleError()
			return
		}

		if (thisImg.complete) {
			handleLoad()
			return
		}

		thisImg.addEventListener('load', handleLoad)
		thisImg.addEventListener('error', handleError)

		return () => {
			thisImg?.removeEventListener('load', handleLoad)
			thisImg?.removeEventListener('error', handleError)
		}
	})
</script>

<figure>
	{#if proxiedThumbnail}
		<div style:zIndex={-1}>
			<BlurredImg {width} {height} src={proxiedThumbnail} blur={!loaded} on:click />
		</div>
	{/if}

	{#if hasError || !proxiedSrc}
		<div class="error-placeholder" class:absolute={proxiedThumbnail}>
			<div class="error-content">
				<div class="error-icon">📷</div>
				<div class="error-text">{hasError ? 'Failed to load image' : 'No image available'}</div>
			</div>
		</div>
	{:else}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<img
			src={proxiedSrc}
			{alt}
			loading="lazy"
			bind:this={thisImg}
			class:loaded
			class:absolute={proxiedThumbnail}
			on:click
		/>
	{/if}
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

	.error-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f5f5f5;
		border: 1px dashed #ccc;
		opacity: 1;
	}

	.error-placeholder.absolute {
		position: absolute;
		left: 0;
		top: 0;
	}

	.error-content {
		text-align: center;
		color: #666;
	}

	.error-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.error-text {
		font-size: 0.8rem;
		font-weight: 500;
	}
</style>
