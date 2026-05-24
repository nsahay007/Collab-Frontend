export const FEED_TABS = [
  { id: 'all', label: 'All' },
  { id: 'milestone', label: 'Milestones' },
  { id: 'blocker', label: 'Blockers' },
  { id: 'trending', label: 'Trending' },
]

export function formatFeedTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function engagementScore(post) {
  const likes = post.likes || 0
  const dislikes = post.dislikes || 0
  const comments = post.comments?.length || 0
  return likes - dislikes + comments * 2
}

export function filterFeedPosts(posts, tab) {
  if (tab === 'all') return posts
  if (tab === 'milestone' || tab === 'blocker') {
    return posts.filter((p) => p.type === tab)
  }
  if (tab === 'trending') {
    const weekAgo = Date.now() - 7 * 24 * 3600000
    return [...posts]
      .filter((p) => new Date(p.createdAt).getTime() >= weekAgo)
      .sort((a, b) => engagementScore(b) - engagementScore(a))
  }
  return posts
}

export function sortPostsChronological(posts) {
  return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getTypeBadgeVariant(type) {
  return type === 'milestone' ? 'success' : 'warning'
}

export function getTypeLabel(type) {
  return type === 'milestone' ? 'Milestone' : 'Blocker'
}
