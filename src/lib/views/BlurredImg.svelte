<script lang="ts">
	let {
		src,
		width,
		height,
		blur = true,
		onclick,
	}: {
		src: string
		width: number | undefined
		height: number | undefined
		blur?: boolean
		onclick?: () => void
	} = $props()

	const aspectRatio = $derived(width && height ? width / height : undefined)
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<img {src} style:aspect-ratio={aspectRatio} class:blur {onclick} />

<style>
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: blur(0);
		transition: all 1s ease-in-out;
	}
	img.blur {
		filter: blur(10px);
	}
</style>
