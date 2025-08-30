import { describe, expect, it } from 'vitest'
import { getGalleryImageUrl } from './RedditService'
import type { RedditPost } from './types/reddit'

describe('getGalleryImageUrl', () => {
	it('returns thumbnail for non-gallery posts', () => {
		const post: RedditPost = {
			type: 'image',
			author: 'test',
			domain: 'test.com',
			id: '123',
			name: 't3_123',
			permalink: '/test',
			subreddit: 'test',
			thumbnail: 'https://thumbnail.jpg',
			title: 'Test',
			url: 'https://image.jpg',
			post_hint: 'image',
			preview: { images: [{ source: { width: 100, height: 100 } }] },
		}

		expect(getGalleryImageUrl(post)).toBe('https://thumbnail.jpg')
	})

	it('returns thumbnail when gallery has no media_metadata', () => {
		const post: RedditPost = {
			type: 'gallery',
			author: 'test',
			domain: 'test.com',
			id: '123',
			name: 't3_123',
			permalink: '/test',
			subreddit: 'test',
			thumbnail: 'https://thumbnail.jpg',
			title: 'Test Gallery',
			url: 'https://gallery.com',
			is_gallery: true,
		}

		expect(getGalleryImageUrl(post)).toBe('https://thumbnail.jpg')
	})

	it('returns thumbnail when gallery has no gallery_data', () => {
		const post: RedditPost = {
			type: 'gallery',
			author: 'test',
			domain: 'test.com',
			id: '123',
			name: 't3_123',
			permalink: '/test',
			subreddit: 'test',
			thumbnail: 'https://thumbnail.jpg',
			title: 'Test Gallery',
			url: 'https://gallery.com',
			is_gallery: true,
			media_metadata: {
				abc123: {
					status: 'valid',
					e: 'Image',
					m: 'image/jpeg',
					s: {
						y: 1000,
						x: 1000,
						u: 'https://preview.redd.it/hq-image.jpg?amp;format=pjpg&amp;auto=webp',
					},
					id: 'abc123',
				},
			},
		}

		expect(getGalleryImageUrl(post)).toBe('https://thumbnail.jpg')
	})

	it('extracts and decodes high-quality image URL from gallery metadata', () => {
		const post: RedditPost = {
			type: 'gallery',
			author: 'test',
			domain: 'test.com',
			id: '123',
			name: 't3_123',
			permalink: '/test',
			subreddit: 'test',
			thumbnail: 'https://thumbnail.jpg',
			title: 'Test Gallery',
			url: 'https://gallery.com',
			is_gallery: true,
			media_metadata: {
				abc123: {
					status: 'valid',
					e: 'Image',
					m: 'image/jpeg',
					s: {
						y: 1000,
						x: 1000,
						u: 'https://preview.redd.it/hq-image.jpg?amp;format=pjpg&amp;auto=webp',
					},
					id: 'abc123',
				},
			},
			gallery_data: {
				items: [{ media_id: 'abc123', id: 0 }],
			},
		}

		expect(getGalleryImageUrl(post)).toBe(
			'https://preview.redd.it/hq-image.jpg?format=pjpg&auto=webp'
		)
	})

	it('returns thumbnail when media_id not found in metadata', () => {
		const post: RedditPost = {
			type: 'gallery',
			author: 'test',
			domain: 'test.com',
			id: '123',
			name: 't3_123',
			permalink: '/test',
			subreddit: 'test',
			thumbnail: 'https://thumbnail.jpg',
			title: 'Test Gallery',
			url: 'https://gallery.com',
			is_gallery: true,
			media_metadata: {
				xyz789: {
					status: 'valid',
					e: 'Image',
					m: 'image/jpeg',
					s: { y: 1000, x: 1000, u: 'https://preview.redd.it/hq-image.jpg' },
					id: 'xyz789',
				},
			},
			gallery_data: {
				items: [{ media_id: 'abc123', id: 0 }],
			},
		}

		expect(getGalleryImageUrl(post)).toBe('https://thumbnail.jpg')
	})
})
