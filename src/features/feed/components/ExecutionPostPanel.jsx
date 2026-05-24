import React, { useRef, useState } from 'react'
import Card from '../../../components/common/Card'
import Button from '../../../components/common/Button'
import useAuth from '../../../hooks/useAuth'

export default function ExecutionPostPanel({ ventureName, onPost }) {
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [content, setContent] = useState('')
  const [type, setType] = useState('milestone')
  const [media, setMedia] = useState(null)
  const [posting, setPosting] = useState(false)

  const handleMedia = (e) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
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
      await onPost({ type, content: text, media })
      setContent('')
      setMedia(null)
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setPosting(false)
    }
  }

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <Card hover={false} className="build-post-panel border-primary/15">
      <p className="text-xs uppercase tracking-wide text-text-muted mb-1">Share to Feed</p>
      <h2 className="text-base font-semibold text-text-primary">Post execution update</h2>
      <p className="text-xs text-text-muted mt-1 mb-4">
        Milestones and blockers publish to the public ecosystem timeline.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          {['milestone', 'blocker'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`feed-type-chip text-xs ${type === t ? `feed-type-chip--${t} feed-type-chip--active` : ''}`}
            >
              {t === 'milestone' ? 'Milestone' : 'Blocker'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="feed-avatar feed-avatar-sm shrink-0 mt-0.5">{initial}</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={type === 'blocker' ? 'Describe the blocker…' : 'What did your team ship?'}
            rows={3}
            className="flex-1 resize-none rounded-xl border border-border bg-bg-secondary/40 px-3 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
        </div>

        {ventureName && (
          <p className="text-xs text-text-muted px-1">
            Posting as <span className="text-text-secondary font-medium">{ventureName}</span>
          </p>
        )}

        {media && (
          <div className="relative rounded-lg overflow-hidden border border-border max-h-32">
            <img src={media} alt="Attachment" className="w-full object-cover max-h-32" />
            <button
              type="button"
              onClick={() => setMedia(null)}
              className="absolute top-1.5 right-1.5 rounded-md bg-bg-elevated/90 px-2 py-0.5 text-[10px] text-text-muted"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleMedia} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="feed-icon-action text-text-muted hover:text-primary text-xs"
            aria-label="Attach screenshot"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <Button type="submit" size="sm" disabled={!content.trim() || posting} className="flex-1 sm:flex-none">
            {posting ? 'Publishing…' : 'Publish to Feed'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
