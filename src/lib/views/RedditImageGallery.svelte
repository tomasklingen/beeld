<script lang=ts>
    import type { RedditPost } from '$lib/types/reddit';
    import Post from './Post.svelte';

	export let posts: RedditPost[]
    export let title: string;
    export let showSub = false

    $: console.log(filteredPosts.map(p => [p.url.slice(p.url.length - 5), p.domain, p]))

    const filter = (p: RedditPost) => {
        return !p.is_gallery && p.name.startsWith('t3') && p.thumbnail !== 'self'
    }
    const hasMedia = (p: RedditPost) => p.media
    $: filteredPosts = posts.filter(filter)
</script>

<h1>{title}</h1>
<section>
    {#each filteredPosts as post (post.id) }
        <Post {post} { showSub } />
    {/each}
</section>

<style>
    section {
        columns: 5 25em;
        column-gap: 1rem;
    }
</style>

 
