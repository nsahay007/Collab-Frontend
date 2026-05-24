import React, { useRef, useState } from 'react'
import Button from '../../../components/common/Button'
import useAuth from '../../../hooks/useAuth'

export default function FeedComposer({ onPost }) {
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [content, setContent] = useState('')
  const [type, setType] = useState('milestone')
  const [venture, setVenture] = useState('')
  const [media, setMedia] = useState(null)
  const [posting, setPosting] = useState(false)

  const handleMedia = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setMedia(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = content.trim()
    if (!text || posting) return
    setPosting(true)
    try {
      await onPost({
        type,
        content: text,
        venture: venture.trim() || undefined,
        media,
      })
      setContent('')
      setVenture('')
      setMedia(null)
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setPosting(false)
    }
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <form onSubmit={handleSubmit} className="feed-composer">
      <div className="flex gap-3">
        <div className="feed-avatar shrink-0">{initial}</div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            {['milestone', 'blocker'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`feed-type-chip ${type === t ? `feed-type-chip--${t} feed-type-chip--active` : ''}`}
              >
                {t === 'milestone' ? 'Milestone' : 'Blocker'}
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you building today?"
            rows={3}
            className="feed-composer-input w-full resize-none bg-transparent text-[15px] text-text-primary placeholder-text-muted border-0 outline-none ring-0"
          />
          <input
            type="text"
            value={venture}
            onChange={(e) => setVenture(e.target.value)}
            placeholder="Startup / project name (optional)"
            className="w-full rounded-lg border border-border bg-bg-secondary/50 px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
          {media && (
            <div className="relative rounded-xl overflow-hidden border border-border max-h-48">
              <img src={media} alt="Attachment preview" className="w-full object-cover max-h-48" />
              <button
                type="button"
                onClick={() => setMedia(null)}
                className="absolute top-2 right-2 rounded-lg bg-bg-elevated/90 px-2 py-1 text-xs text-text-secondary"
              >
                Remove
              </button>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleMedia} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="feed-icon-action text-text-muted hover:text-primary"
                aria-label="Attach screenshot"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <Button type="submit" size="sm" disabled={!content.trim() || posting}>
              {posting ? 'Posting…' : 'Post update'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
