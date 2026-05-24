import { SEED_POSTS } from './feedSeed'

const STORAGE_KEY = 'collab-feed-posts-v1'

export function loadFeedPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return [...SEED_POSTS]
    const userPosts = JSON.parse(raw)
    if (!Array.isArray(userPosts)) return [...SEED_POSTS]
    return [...userPosts, ...SEED_POSTS]
  } catch {
    return [...SEED_POSTS]
  }
}

export function saveUserPosts(posts) {
  const userOnly = posts.filter((p) => p.id.startsWith('user-'))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly))
}

export function createPostId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
