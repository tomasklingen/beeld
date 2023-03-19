<script lang=ts>
    import RedditImageGallery from '$lib/views/RedditImageGallery.svelte';
    import type { PageData } from './$types';

	export let data: PageData;
</script>

<RedditImageGallery posts={data.posts} title={data.sub} />