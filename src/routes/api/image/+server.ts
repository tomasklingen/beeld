import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, fetch }) => {
	const imageUrl = url.searchParams.get('url')

	if (!imageUrl) {
		error(400, 'Missing image URL parameter')
	}

	// Validate that the URL is from Reddit's CDN to prevent abuse
	if (
		!imageUrl.startsWith('https://i.redd.it/') &&
		!imageUrl.startsWith('https://preview.redd.it/') &&
		!imageUrl.includes('redditmedia.com')
	) {
		error(400, 'Invalid image URL - only Reddit CDN URLs are allowed')
	}

	try {
		const response = await fetch(imageUrl, {
			headers: {
				'User-Agent': 'beeld-reddit-client/1.0',
			},
		})

		if (!response.ok) {
			console.error(`Failed to fetch image: ${response.status} ${response.statusText}`)
			error(response.status, `Failed to fetch image: ${response.statusText}`)
		}

		const contentType = response.headers.get('content-type')

		// Validate that we're actually getting an image
		if (!contentType || (!contentType.startsWith('image/') && !contentType.startsWith('video/'))) {
			console.error(`Invalid content type: ${contentType}`)
			error(400, 'URL does not point to a valid image or video')
		}

		const buffer = await response.arrayBuffer()

		if (buffer.byteLength === 0) {
			console.error('Empty response from image URL')
			error(404, 'Image not found or empty')
		}

		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', // Cache for 1 day, allow stale for 7 day
				'Access-Control-Allow-Origin': '*',
			},
		})
	} catch (err) {
		console.error('Error fetching image:', err)
		error(500, 'Failed to proxy image request')
	}
}
