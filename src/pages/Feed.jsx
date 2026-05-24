import React, { useCallback, useMemo, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { useMotionToast } from '../components/common/MotionToast'
import FeedComposer from '../features/feed/components/FeedComposer'
import FeedTabs from '../features/feed/components/FeedTabs'
import FeedPostCard from '../features/feed/components/FeedPostCard'
import BuilderProfileModal from '../features/feed/components/BuilderProfileModal'
import { SEED_BUILDERS } from '../features/feed/feedSeed'
import { loadFeedPosts, saveUserPosts, createPostId } from '../features/feed/feedStorage'
import {
  filterFeedPosts,
  sortPostsChronological,
} from '../features/feed/feedUtils'

export default function Feed() {
  const { user } = useAuth()
  const { showToast } = useMotionToast()
  const [posts, setPosts] = useState(() => sortPostsChronological(loadFeedPosts()))
  const [activeTab, setActiveTab] = useState('all')
  const [profileBuilderId, setProfileBuilderId] = useState(null)
  const [profileOverride, setProfileOverride] = useState(null)

  const currentUserId = user?.id || user?._id || 'current-user'
  const currentUserName = user?.name || 'You'

  const persistUserPosts = useCallback((nextPosts) => {
    saveUserPosts(nextPosts)
  }, [])

  const displayedPosts = useMemo(() => {
    const filtered = filterFeedPosts(posts, activeTab)
    return activeTab === 'trending' ? filtered : sortPostsChronological(filtered)
  }, [posts, activeTab])

  const handlePost = useCallback(
    async ({ type, content, venture, media }) => {
      const newPost = {
        id: createPostId(),
        type,
        authorId: currentUserId,
        venture: venture || user?.primaryCategory || undefined,
        content,
        media: media || null,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        comments: [],
        likedBy: [],
        dislikedBy: [],
      }
      setPosts((prev) => {
        const next = [newPost, ...prev]
        persistUserPosts(next)
        return next
      })
      showToast(
        type === 'milestone' ? 'Milestone shared with the ecosystem' : 'Blocker posted — builders can help',
        type === 'milestone' ? 'success' : 'primary'
      )
    },
    [currentUserId, user?.primaryCategory, persistUserPosts, showToast]
  )

  const handleVote = useCallback(
    (postId, voteType) => {
      setPosts((prev) => {
        const next = prev.map((post) => {
          if (post.id !== postId) return post
          const likedBy = [...(post.likedBy || [])].filter((id) => id !== currentUserId)
          const dislikedBy = [...(post.dislikedBy || [])].filter((id) => id !== currentUserId)
          let likes = post.likes || 0
          let dislikes = post.dislikes || 0
          const hadLike = post.likedBy?.includes(currentUserId)
          const hadDislike = post.dislikedBy?.includes(currentUserId)

          if (voteType === 'like') {
            if (hadLike) {
              likes = Math.max(0, likes - 1)
            } else {
              likes += 1
              if (hadDislike) dislikes = Math.max(0, dislikes - 1)
              likedBy.push(currentUserId)
            }
          } else if (voteType === 'dislike') {
            if (hadDislike) {
              dislikes = Math.max(0, dislikes - 1)
            } else {
              dislikes += 1
              if (hadLike) likes = Math.max(0, likes - 1)
              dislikedBy.push(currentUserId)
            }
          }

          return { ...post, likes, dislikes, likedBy, dislikedBy }
        })
        persistUserPosts(next)
        return next
      })
    },
    [currentUserId, persistUserPosts]
  )

  const handleAddComment = useCallback(
    async (postId, content) => {
      setPosts((prev) => {
        const next = prev.map((post) => {
          if (post.id !== postId) return post
          return {
            ...post,
            comments: [
              ...(post.comments || []),
              {
                id: `comment-${Date.now()}`,
                authorId: currentUserId,
                content,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        })
        persistUserPosts(next)
        return next
      })
    },
    [currentUserId, persistUserPosts]
  )

  const handleOpenProfile = useCallback(
    (authorId) => {
      if (authorId === currentUserId) {
        setProfileOverride({
          id: currentUserId,
          name: currentUserName,
          role: user?.role === 'admin' ? 'Admin' : 'Builder',
          skills: user?.skills?.length ? user.skills : ['Building'],
          venture: user?.primaryCategory || 'Your startup workspace',
          email: user?.showContactToTeam ? user?.email : undefined,
        })
        setProfileBuilderId(null)
      } else {
        setProfileOverride(null)
        setProfileBuilderId(authorId)
      }
    },
    [currentUserId, currentUserName, user]
  )

  const closeProfile = () => {
    setProfileBuilderId(null)
    setProfileOverride(null)
  }

  return (
    <div className="feed-page">
      <header className="feed-header sticky top-[68px] z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 border-b border-border bg-bg-main/85 backdrop-blur-xl">
        <div className="feed-column mx-auto">
          <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Ecosystem</p>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Execution Feed</h1>
          <p className="text-sm text-text-muted mt-1 hidden sm:block">
            Public building activity — milestones, blockers, and collaborative problem-solving.
          </p>
          <div className="mt-4">
            <FeedTabs activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </header>

      <div className="feed-column mx-auto pb-12">
        <section className="feed-composer-wrap border-b border-border">
          <FeedComposer onPost={handlePost} />
        </section>

        <section className="feed-stream" aria-label="Execution updates">
          {displayedPosts.length === 0 ? (
            <div className="feed-empty">
              <p className="text-text-secondary text-sm">No posts in this view yet.</p>
              <p className="text-text-muted text-xs mt-1">Share a milestone or ask for help on a blocker.</p>
            </div>
          ) : (
            displayedPosts.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onVote={handleVote}
                onAddComment={handleAddComment}
                onOpenProfile={handleOpenProfile}
              />
            ))
          )}
        </section>
      </div>

      <BuilderProfileModal
        builderId={profileBuilderId}
        builderOverride={profileOverride}
        open={Boolean(profileBuilderId || profileOverride)}
        onClose={closeProfile}
      />
    </div>
  )
}
