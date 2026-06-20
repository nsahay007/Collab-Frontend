const STORAGE_KEY = 'collab-feed-posts-v1'
let memoryPosts = []

export const FEED_STORAGE_KEY = STORAGE_KEY

export function loadFeedPosts() {
  return memoryPosts
}

export function saveFeedPosts(posts) {
  memoryPosts = Array.isArray(posts) ? posts : []
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('collab-feed-updated'))
  }
}

export function createPostId() {
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
