import React, { useState } from 'react'
import Badge from '../../../components/common/Badge'
import { SEED_BUILDERS } from '../feedSeed'
import { formatFeedTime, getTypeBadgeVariant, getTypeLabel } from '../feedUtils'
import FeedComments from './FeedComments'

export default function FeedPostCard({
  post,
  currentUserId,
  currentUserName,
  onVote,
  onAddComment,
  onOpenProfile,
}) {
  const [showComments, setShowComments] = useState(false)

  const author =
    post.authorId === currentUserId
      ? {
          id: currentUserId,
          name: currentUserName || 'You',
          venture: post.venture,
        }
      : SEED_BUILDERS[post.authorId] || { name: 'Builder', venture: post.venture }

  const userVote = post.likedBy?.includes(currentUserId)
    ? 'like'
    : post.dislikedBy?.includes(currentUserId)
      ? 'dislike'
      : null

  return (
    <article className="feed-post">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onOpenProfile(post.authorId)}
          className="feed-avatar shrink-0 hover:ring-2 hover:ring-primary/30 transition-shadow duration-150"
          aria-label={`View ${author.name}'s builder profile`}
        >
          {author.name.charAt(0)}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              type="button"
              onClick={() => onOpenProfile(post.authorId)}
              className="font-semibold text-[15px] text-text-primary hover:underline text-left"
            >
              {author.name}
            </button>
            {post.venture && (
              <>
                <span className="text-text-muted text-sm">·</span>
                <span className="text-sm text-text-muted truncate">{post.venture}</span>
              </>
            )}
            <span className="text-text-muted text-sm">·</span>
            <time className="text-sm text-text-muted">{formatFeedTime(post.createdAt)}</time>
            <Badge variant={getTypeBadgeVariant(post.type)} className="ml-auto sm:ml-1">
              {getTypeLabel(post.type)}
            </Badge>
          </div>

          <p className="mt-2 text-[15px] text-text-primary leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>

          {post.media && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border">
              <img src={post.media} alt="Post attachment" className="w-full max-h-80 object-cover" />
            </div>
          )}

          <div className="feed-actions mt-3">
            <button
              type="button"
              onClick={() => onVote(post.id, 'like')}
              className={`feed-action ${userVote === 'like' ? 'feed-action--active-like' : ''}`}
              aria-pressed={userVote === 'like'}
              aria-label="Helpful"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a1 1 0 01.789 1.592l-3.805 5.092a1 1 0 01-.789.408H10v6a1 1 0 01-1-1v-4.764a1 1 0 00-.211-.632l-3.805-5.092A1 1 0 016.236 10H10V4a1 1 0 011-1h2a1 1 0 011 1v6z" />
              </svg>
              <span>{post.likes || 0}</span>
            </button>
            <button
              type="button"
              onClick={() => onVote(post.id, 'dislike')}
              className={`feed-action ${userVote === 'dislike' ? 'feed-action--active-dislike' : ''}`}
              aria-pressed={userVote === 'dislike'}
              aria-label="Not helpful"
            >
              <svg className="h-4 w-4 scale-y-[-1]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a1 1 0 01.789 1.592l-3.805 5.092a1 1 0 01-.789.408H10v6a1 1 0 01-1-1v-4.764a1 1 0 00-.211-.632l-3.805-5.092A1 1 0 016.236 10H10V4a1 1 0 011-1h2a1 1 0 011 1v6z" />
              </svg>
              <span>{post.dislikes || 0}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowComments((p) => !p)}
              className={`feed-action ${showComments ? 'feed-action--active-comment' : ''}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments?.length || 0}</span>
            </button>
          </div>

          {showComments && (
            <FeedComments
              comments={post.comments}
              postType={post.type}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onAddComment={(content) => onAddComment(post.id, content)}
            />
          )}
        </div>
      </div>
    </article>
  )
}
