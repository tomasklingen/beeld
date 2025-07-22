<script lang="ts">
	export let src: string
	export let width: number | undefined
	export let height: number | undefined
	export let blur = true

	$: aspectRatio = width && height ? width / height : undefined
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img {src} style:aspect-ratio={aspectRatio} class:blur />

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
