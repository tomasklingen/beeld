export interface RedditPost {
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
}
