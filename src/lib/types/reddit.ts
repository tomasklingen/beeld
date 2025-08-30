// Base interface for common Reddit post properties
export interface BaseRedditPost {
	author: string
	domain: string
	id: string
	name: `t${number}_${string}`
	permalink: string
	subreddit: string
	thumbnail: string
	title: string
	url: string
}

// Specific post type variants
export interface EmbedPost extends BaseRedditPost {
	type: 'embed'
	post_hint: 'rich:video'
	secure_media_embed: { media_domain_url: string }
}

export interface ImagePost extends BaseRedditPost {
	type: 'image'
	post_hint: 'image'
	preview: {
		images: [
			{
				source: { width: number; height: number }
			},
		]
	}
}

export interface GalleryPost extends BaseRedditPost {
	type: 'gallery'
	is_gallery: true
	preview?: {
		images?: [
			{
				source: { width: number; height: number }
			},
		]
	}
	media_metadata?: Record<
		string,
		{
			status: string
			e: string
			m: string
			p?: Array<{ y: number; x: number; u: string }>
			s: { y: number; x: number; u: string }
			id: string
		}
	>
	gallery_data?: {
		items: Array<{ media_id: string; id: number }>
	}
}

export interface TextPost extends BaseRedditPost {
	type: 'text'
	selftext?: string
}

export interface LinkPost extends BaseRedditPost {
	type: 'link'
	url: string
}

// Discriminated union of all post types
export type RedditPost = EmbedPost | ImagePost | GalleryPost | TextPost | LinkPost

// Type guards for runtime type checking
export const isEmbedPost = (post: RedditPost): post is EmbedPost => post.type === 'embed'

export const isImagePost = (post: RedditPost): post is ImagePost => post.type === 'image'

export const isGalleryPost = (post: RedditPost): post is GalleryPost => post.type === 'gallery'

export const isTextPost = (post: RedditPost): post is TextPost => post.type === 'text'

export const isLinkPost = (post: RedditPost): post is LinkPost => post.type === 'link'

// Helper function to check if post has media content
export const hasMediaContent = (post: RedditPost): boolean =>
	isEmbedPost(post) || isImagePost(post) || isGalleryPost(post)

// Original interface for backwards compatibility during migration
export interface LegacyRedditPost {
	author: string
	domain: string
	id: string
	is_gallery: boolean
	name: `t${number}_${string}`
	permalink: string
	post_hint: string
	preview: {
		images?: [
			{
				source: { width: number; height: number }
			},
		]
	}
	secure_media_embed: { media_domain_url: string }
	subreddit: string
	thumbnail: string
	title: string
	url: string
	media_metadata?: Record<
		string,
		{
			status: string
			e: string
			m: string
			p?: Array<{ y: number; x: number; u: string }>
			s: { y: number; x: number; u: string }
			id: string
		}
	>
	gallery_data?: {
		items: Array<{ media_id: string; id: number }>
	}
}
