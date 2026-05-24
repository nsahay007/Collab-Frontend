import { useCallback, useEffect, useState } from 'react'
import { loadFeedPosts, saveFeedPosts, createPostId } from './feedStorage'
import { sortPostsChronological } from './feedUtils'
import { buildAuthorSnapshot } from './feedAuthor'
import axios from '../../services/axiosInstance'

const normalizePost = (post) => ({
  ...post,
  id: post.id || post._id || createPostId(),
  likes: Number(post.likes || post.likedBy?.length || 0),
  dislikes: Number(post.dislikes || post.dislikedBy?.length || 0),
  comments: Array.isArray(post.comments) ? post.comments : [],
  likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
  dislikedBy: Array.isArray(post.dislikedBy) ? post.dislikedBy : [],
})

export function useFeedPosts() {
  const [posts, setPosts] = useState(() => sortPostsChronological(loadFeedPosts()))

  const refresh = useCallback(async () => {
    try {
      const response = await axios.get('/feed/posts')
      const nextPosts = (response?.data?.posts || []).map(normalizePost)
      saveFeedPosts(nextPosts)
      setPosts(sortPostsChronological(nextPosts))
    } catch (error) {
      setPosts(sortPostsChronological(loadFeedPosts()))
    }
  }, [])

  useEffect(() => {
    refresh()
    const onUpdate = () => {
      setPosts(sortPostsChronological(loadFeedPosts()))
    }
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
    async ({ type, content, venture, media, user, projectTitle }) => {
      const author = buildAuthorSnapshot(user, venture || projectTitle)
      const response = await axios.post('/feed/posts', {
        type,
        content,
        venture: venture || projectTitle || author.venture,
        projectTitle,
        media: media || null,
      })
      const newPost = normalizePost(response?.data?.post || {
        id: createPostId(),
        type,
        authorId: author.id,
        author,
        venture: venture || projectTitle || author.venture,
        content,
        media: media || null,
        createdAt: new Date().toISOString(),
      })
      const next = [newPost, ...loadFeedPosts().filter((post) => post.id !== newPost.id)]
      persist(next)
      return newPost
    },
    [persist]
  )

  const vote = useCallback(
    async (postId, voteType, currentUserId) => {
      try {
        const response = await axios.post(`/feed/posts/${postId}/vote`, { voteType })
        const updated = normalizePost(response?.data?.post || {})
        const next = loadFeedPosts().map((post) => (post.id === postId ? updated : post))
        persist(next)
        return
      } catch (error) {
        // Keep the UI responsive if the network is temporarily unavailable.
      }

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
    async (postId, content, currentUserId, authorSnapshot) => {
      try {
        const response = await axios.post(`/feed/posts/${postId}/comments`, { content })
        const updated = normalizePost(response?.data?.post || {})
        const next = loadFeedPosts().map((post) => (post.id === postId ? updated : post))
        persist(next)
        return
      } catch (error) {
        // Fall back to local comment persistence if the API cannot be reached.
      }

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
