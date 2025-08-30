import type { LegacyRedditPost, RedditPost } from './types/reddit'

type ListPeriod = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
type ListSorting = 'hot' | 'top' | 'new' | 'rising' | 'best'
interface RedditRequest {
	sorting?: ListSorting
	limit?: number
	username?: string
	subReddit?: string
	t?: ListPeriod
	after?: string
}

type RedditResponse =
	| {
			posts: RedditPost[]
			after?: string
			hasMore: boolean
			error: null
	  }
	| {
			error: Error
	  }

// Parser function to convert raw Reddit API data to our ADT
function parseRedditPost(rawPost: LegacyRedditPost): RedditPost {
	const basePost = {
		author: rawPost.author,
		domain: rawPost.domain,
		id: rawPost.id,
		name: rawPost.name,
		permalink: rawPost.permalink,
		subreddit: rawPost.subreddit,
		thumbnail: rawPost.thumbnail,
		title: rawPost.title,
		url: rawPost.url,
	}

	// Determine post type based on properties
	if (rawPost.post_hint === 'rich:video' && rawPost.secure_media_embed?.media_domain_url) {
		return {
			...basePost,
			type: 'embed',
			post_hint: 'rich:video',
			secure_media_embed: rawPost.secure_media_embed,
		}
	}

	if (rawPost.post_hint === 'image' && rawPost.preview?.images) {
		return {
			...basePost,
			type: 'image',
			post_hint: 'image',
			preview: {
				images: rawPost.preview.images,
			},
		}
	}

	if (rawPost.is_gallery) {
		console.log('Gallery post detected:', {
			id: rawPost.id,
			has_media_metadata: !!rawPost.media_metadata,
			has_gallery_data: !!rawPost.gallery_data,
			gallery_items_count: rawPost.gallery_data?.items?.length || 0,
			media_metadata_keys: rawPost.media_metadata ? Object.keys(rawPost.media_metadata) : [],
		})

		return {
			...basePost,
			type: 'gallery',
			is_gallery: true,
			preview: rawPost.preview,
			media_metadata: rawPost.media_metadata,
			gallery_data: rawPost.gallery_data,
		}
	}

	// Check if it's a self post (text post)
	if (
		rawPost.domain === `self.${rawPost.subreddit}` ||
		rawPost.url?.includes(`/r/${rawPost.subreddit}/comments/`)
	) {
		return {
			...basePost,
			type: 'text',
		}
	}

	// Default to link post
	return {
		...basePost,
		type: 'link',
		url: rawPost.url,
	}
}

export function createRedditService(fetchImpl: typeof fetch = fetch) {
	async function getListing(r: RedditRequest): Promise<RedditResponse> {
		const { sorting = 'top', limit = 30, username, subReddit, t = 'week', after } = r

		const listType = subReddit
			? (`r/${subReddit}` as const)
			: username
				? (`user/${username}/submitted` as const)
				: null

		if (!listType) {
			throw Error(`need a username or subreddit`)
		}

		const params = new URLSearchParams({
			limit: limit.toString(),
			t,
		})
		if (after) {
			params.set('after', after)
		}
		return makeRequest(`https://www.reddit.com/${listType}/${sorting}.json?${params}`)
	}

	async function makeRequest(url: string): Promise<RedditResponse> {
		try {
			console.log(`Fetching: ${url}`)
			const r = await fetchImpl(url)
			if (!r.ok) {
				return {
					error: await r.json(),
				}
			}
			const respData = await r.json()
			const c: { data: LegacyRedditPost }[] = respData.data.children
			return {
				error: null,
				posts: c.map((c) => parseRedditPost(c.data)),
				after: respData.data.after,
				hasMore: !!respData.data.after,
			}
		} catch (e) {
			console.error(e)
			return {
				error: new Error('Failed to fetch listing', { cause: e as Error }),
			}
		}
	}

	return {
		getListing,
	}
}

// Legacy utility functions - updated to work with ADT
export const hasEmbed = (p: RedditPost) => p.type === 'embed'
export const isNormalImage = (p: RedditPost) => p.type === 'image'
export const getImageDimensions = (p: RedditPost) =>
	p.type === 'image' ? p.preview.images[0].source : undefined

export const authorUrl = (p: RedditPost) => {
	return `/u/${p.author}`
}

export const postUrl = (p: RedditPost) => `https://old.reddit.com${p.permalink}`

export const getGalleryImageUrl = (post: RedditPost): string => {
	if (post.type !== 'gallery') return post.thumbnail

	if (!post.media_metadata || !post.gallery_data?.items?.length) {
		return post.thumbnail
	}

	const firstImageId = post.gallery_data.items[0]?.media_id
	if (!firstImageId) {
		return post.thumbnail
	}

	const imageData = post.media_metadata[firstImageId]
	if (!imageData?.s?.u) {
		return post.thumbnail
	}

	const decodedUrl = imageData.s.u.replace(/amp;/g, '')

	return decodedUrl
}
