import { useCallback, useEffect, useState } from 'react'
import { loadFeedPosts, saveFeedPosts, createPostId } from './feedStorage'
import { sortPostsChronological } from './feedUtils'
import { buildAuthorSnapshot } from './feedAuthor'

export function useFeedPosts() {
  const [posts, setPosts] = useState(() => sortPostsChronological(loadFeedPosts()))

  const refresh = useCallback(() => {
    setPosts(sortPostsChronological(loadFeedPosts()))
  }, [])

  useEffect(() => {
    const onUpdate = () => refresh()
    window.addEventListener('collab-feed-updated', onUpdate)
    window.addEventListener('storage', onUpdate)
    return () => {
      window.removeEventListener('collab-feed-updated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [refresh])

  const persist = useCallback((nextPosts) => {
    saveFeedPosts(nextPosts)
    setPosts(sortPostsChronological(nextPosts))
  }, [])

  const createPost = useCallback(
    ({ type, content, venture, media, user, projectTitle }) => {
      const author = buildAuthorSnapshot(user, venture || projectTitle)
      const newPost = {
        id: createPostId(),
        type,
        authorId: author.id,
        author,
        venture: venture || projectTitle || author.venture,
        content,
        media: media || null,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        comments: [],
        likedBy: [],
        dislikedBy: [],
      }
      const next = [newPost, ...loadFeedPosts()]
      persist(next)
      return newPost
    },
    [persist]
  )

  const vote = useCallback(
    (postId, voteType, currentUserId) => {
      const next = loadFeedPosts().map((post) => {
        if (post.id !== postId) return post
        const likedBy = [...(post.likedBy || [])].filter((id) => id !== currentUserId)
        const dislikedBy = [...(post.dislikedBy || [])].filter((id) => id !== currentUserId)
        let likes = post.likes || 0
        let dislikes = post.dislikes || 0
        const hadLike = post.likedBy?.includes(currentUserId)
        const hadDislike = post.dislikedBy?.includes(currentUserId)

        if (voteType === 'like') {
          if (hadLike) likes = Math.max(0, likes - 1)
          else {
            likes += 1
            if (hadDislike) dislikes = Math.max(0, dislikes - 1)
            likedBy.push(currentUserId)
          }
        } else if (voteType === 'dislike') {
          if (hadDislike) dislikes = Math.max(0, dislikes - 1)
          else {
            dislikes += 1
            if (hadLike) likes = Math.max(0, likes - 1)
            dislikedBy.push(currentUserId)
          }
        }

        return { ...post, likes, dislikes, likedBy, dislikedBy }
      })
      persist(next)
    },
    [persist]
  )

  const addComment = useCallback(
    (postId, content, currentUserId, authorSnapshot) => {
      const next = loadFeedPosts().map((post) => {
        if (post.id !== postId) return post
        return {
          ...post,
          comments: [
            ...(post.comments || []),
            {
              id: `comment-${Date.now()}`,
              authorId: currentUserId,
              author: authorSnapshot,
              content,
              createdAt: new Date().toISOString(),
            },
          ],
        }
      })
      persist(next)
    },
    [persist]
  )

  return { posts, refresh, createPost, vote, addComment }
}
