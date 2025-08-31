/**
 * Determines if a URL needs to be proxied through our image proxy
 * to avoid CORS issues (particularly in Firefox)
 */
export function needsProxy(url: string): boolean {
	if (!url || typeof url !== 'string') {
		return false
	}
	return (
		url.startsWith('https://i.redd.it/') ||
		url.startsWith('https://preview.redd.it/') ||
		url.includes('.thumbs.redditmedia.com')
	)
}

/**
 * Converts a Reddit image URL to use our proxy route
 */
export function getProxiedImageUrl(originalUrl: string): string {
	if (!needsProxy(originalUrl)) {
		return originalUrl
	}

	try {
		// Validate URL format
		// oxlint-disable-next-line no-new
		new URL(originalUrl)
		const encodedUrl = encodeURIComponent(originalUrl)
		return `/api/image?url=${encodedUrl}`
	} catch (error) {
		console.warn(`Invalid URL for proxy: ${originalUrl}`, error)
		return originalUrl // Return original URL if encoding fails
	}
}

/**
 * Reddit special thumbnail values that are not actual URLs
 */
const REDDIT_SPECIAL_THUMBNAILS = new Set(['nsfw', 'spoiler', 'self', 'default', 'image'])

/**
 * Gets the appropriate image URL, using proxy if needed
 */
export function getImageUrl(url: string): string {
	if (!url || typeof url !== 'string') {
		console.warn('getImageUrl called with invalid URL:', url)
		return url || '' // Return empty string for null/undefined
	}

	// Filter out Reddit's special thumbnail values that are not actual URLs
	if (REDDIT_SPECIAL_THUMBNAILS.has(url)) {
		console.log(url)
		return ''
	}

	// Check if it's a valid URL
	try {
		// oxlint-disable-next-line
		new URL(url)
	} catch {
		console.warn('getImageUrl called with invalid URL format:', url)
		return ''
	}

	return needsProxy(url) ? getProxiedImageUrl(url) : url
}
