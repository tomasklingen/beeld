import { browser } from '$app/environment'
import { writable } from 'svelte/store'

const STORAGE_KEY = 'beeld.reddit.visitedSubs'
const MAX_ITEMS = 8

export type SubredditHistoryItem = {
	sub: string
	visitedAt: number
}

function normalizeSub(value: string): string {
	const trimmed = value
		.trim()
		.replace(/^\/r\//i, '')
		.replace(/^\/+/, '')
		.replace(/\/+$/, '')
	return trimmed
}

function readStoredHistory(): SubredditHistoryItem[] {
	if (!browser) {
		return []
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) {
			return []
		}

		const parsed: unknown = JSON.parse(raw)
		if (!Array.isArray(parsed)) {
			return []
		}

		return parsed
			.filter((entry): entry is SubredditHistoryItem => {
				if (typeof entry !== 'object' || entry === null) {
					return false
				}

				const record = entry as Record<string, unknown>
				const maybeSub = record.sub
				const maybeVisitedAt = record.visitedAt
				return typeof maybeSub === 'string' && typeof maybeVisitedAt === 'number'
			})
			.map((entry) => ({
				sub: normalizeSub(entry.sub),
				visitedAt: entry.visitedAt,
			}))
			.filter((entry) => entry.sub.length > 0)
			.slice(0, MAX_ITEMS)
	} catch {
		return []
	}
}

export const visitedSubs = writable<SubredditHistoryItem[]>(readStoredHistory())

if (browser) {
	visitedSubs.subscribe((items) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
	})
}

export function addVisitedSub(rawSub: string): void {
	if (!browser) {
		return
	}

	const sub = normalizeSub(rawSub)
	if (!sub) {
		return
	}

	visitedSubs.update((items) => {
		const withoutDuplicate = items.filter((item) => item.sub.toLowerCase() !== sub.toLowerCase())
		return [{ sub, visitedAt: Date.now() }, ...withoutDuplicate].slice(0, MAX_ITEMS)
	})
}

export function removeVisitedSub(rawSub: string): void {
	if (!browser) {
		return
	}

	const sub = normalizeSub(rawSub)
	if (!sub) {
		return
	}

	visitedSubs.update((items) =>
		items.filter((item) => item.sub.toLowerCase() !== sub.toLowerCase())
	)
}
