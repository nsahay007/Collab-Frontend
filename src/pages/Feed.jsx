import React, { useCallback, useMemo, useState } from 'react'
import useAuth from '../hooks/useAuth'
import FeedTabs from '../features/feed/components/FeedTabs'
import FeedPostCard from '../features/feed/components/FeedPostCard'
import FeedEmptyState from '../features/feed/components/FeedEmptyState'
import BuilderProfileModal from '../features/feed/components/BuilderProfileModal'
import { useFeedPosts } from '../features/feed/useFeedPosts'
import { filterFeedPosts, sortPostsChronological } from '../features/feed/feedUtils'
import { buildAuthorSnapshot, resolveProfileFromPost } from '../features/feed/feedAuthor'

export default function Feed() {
  const { user } = useAuth()
  const { posts, vote, addComment } = useFeedPosts()
  const [activeTab, setActiveTab] = useState('all')
  const [profileBuilder, setProfileBuilder] = useState(null)

  const currentUserId = user?.id || user?._id || 'current-user'
  const currentUserName = user?.name || 'You'

  const displayedPosts = useMemo(() => {
    const filtered = filterFeedPosts(posts, activeTab)
    return activeTab === 'trending' ? filtered : sortPostsChronological(filtered)
  }, [posts, activeTab])

  const handleVote = useCallback(
    (postId, voteType) => vote(postId, voteType, currentUserId),
    [vote, currentUserId]
  )

  const handleAddComment = useCallback(
    (postId, content) => {
      const authorSnapshot = buildAuthorSnapshot(user, undefined)
      addComment(postId, content, currentUserId, authorSnapshot)
    },
    [addComment, currentUserId, user]
  )

  const handleOpenProfile = useCallback(
    (post) => {
      setProfileBuilder(resolveProfileFromPost(post, currentUserId, user, currentUserName))
    },
    [currentUserId, user, currentUserName]
  )

  return (
    <div className="feed-page">
      <header className="feed-header sticky top-[68px] z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 border-b border-border bg-bg-main/90 backdrop-blur-xl">
        <div className="feed-column mx-auto">
          <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Ecosystem</p>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Execution Feed</h1>
          <p className="text-sm text-text-muted mt-1">
            Public activity from builders — milestones, blockers, and collaborative progress.
          </p>
          <div className="mt-4">
            <FeedTabs activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </header>

      <div className="feed-column mx-auto pb-16">
        <section className="feed-stream" aria-label="Ecosystem activity timeline">
          {displayedPosts.length === 0 ? (
            <FeedEmptyState tab={activeTab} />
          ) : (
            displayedPosts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onVote={handleVote}
                onAddComment={handleAddComment}
                onOpenProfile={() => handleOpenProfile(post)}
              />
            ))
          )}
        </section>
      </div>

      <BuilderProfileModal
        builderOverride={profileBuilder}
        open={Boolean(profileBuilder)}
        onClose={() => setProfileBuilder(null)}
      />
    </div>
  )
}
