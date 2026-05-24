const STORAGE_KEY = 'collab-feed-posts-v1'

export const FEED_STORAGE_KEY = STORAGE_KEY

export function loadFeedPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const posts = JSON.parse(raw)
    return Array.isArray(posts) ? posts : []
  } catch {
    return []
  }
}

export function saveFeedPosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('collab-feed-updated'))
  }
}

export function createPostId() {
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
