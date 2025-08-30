<script lang="ts">
	import { getImageUrl } from '$lib/utils/imageProxy'
	import { onMount } from 'svelte'
	import BlurredImg from './BlurredImg.svelte'

	let {
		src,
		thumbnail = undefined,
		alt,
		width = undefined,
		height = undefined,
		onclick,
		onloaded,
		onerror,
	}: {
		src: string
		thumbnail?: string | undefined
		alt: string
		width?: number | undefined
		height?: number | undefined
		onclick?: () => void
		onloaded?: () => void
		onerror?: () => void
	} = $props()

	let thisImg = $state<HTMLImageElement>()
	let loaded = $state(false)
	let hasError = $state(false)
	let retryCount = $state(0)
	const maxRetries = 2

	// Use proxy for Reddit images to avoid CORS issues
	const proxiedSrc = $derived(getImageUrl(src))
	const proxiedThumbnail = $derived(thumbnail ? getImageUrl(thumbnail) : undefined)

	const handleLoad = () => {
		loaded = true
		hasError = false
		onloaded?.()
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
			onerror?.()
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
			<BlurredImg {width} {height} src={proxiedThumbnail} blur={!loaded} {onclick} />
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
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<img
			src={proxiedSrc}
			{alt}
			loading="lazy"
			bind:this={thisImg}
			class:loaded
			class:absolute={proxiedThumbnail}
			{onclick}
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
