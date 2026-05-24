import React, { useRef, useState } from 'react'
import { PhaseHero, QuestionCard, SavePhaseBar } from '../PipelinePrimitives'
import Button from '../../../../components/common/Button'
import useAuth from '../../../../hooks/useAuth'

function FeedPostForm({ type, ventureName, onPost, showToast }) {
  const { user } = useAuth()
  const fileRef = useRef(null)
  const [content, setContent] = useState('')
  const [media, setMedia] = useState(null)
  const [posting, setPosting] = useState(false)
  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  const handleMedia = (e) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setMedia(reader.result)
    reader.readAsDataURL(file)
  }

  const submit = async () => {
    const text = content.trim()
    if (!text || posting) return
    setPosting(true)
    try {
      await onPost({ type, content: text, media })
      setContent('')
      setMedia(null)
      if (fileRef.current) fileRef.current.value = ''
      showToast?.(
        type === 'milestone' ? 'Milestone posted to Feed' : 'Blocker shared on Feed',
        'success'
      )
    } finally {
      setPosting(false)
    }
  }

  const isBlocker = type === 'blocker'

  return (
    <div className={`pipeline-feed-form ${isBlocker ? 'pipeline-feed-form--blocker' : 'pipeline-feed-form--milestone'}`}>
      <div className="flex gap-2 mb-3">
        <div className="feed-avatar feed-avatar-sm shrink-0">{initial}</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">
            {isBlocker ? 'Post a blocker' : 'Post a milestone'}
          </p>
          <p className="text-xs text-text-muted">
            {isBlocker
              ? 'Ask the ecosystem for help — technical, team, or execution blockers.'
              : 'Share public execution momentum with other builders.'}
          </p>
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder={
          isBlocker
            ? 'What is blocking progress? What help do you need?'
            : 'What did your team ship? Be specific about outcomes.'
        }
        className="pipeline-textarea w-full"
      />
      {ventureName && (
        <p className="text-xs text-text-muted mt-2">Posting for {ventureName}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <label className="text-xs text-primary cursor-pointer hover:underline">
          Attach image
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={handleMedia} />
        </label>
        {media && <span className="text-xs text-success">Image attached</span>}
      </div>
      <Button className="w-full mt-4" onClick={submit} disabled={posting}>
        {posting ? 'Publishing…' : isBlocker ? 'Share blocker to Feed' : 'Share milestone to Feed'}
      </Button>
    </div>
  )
}

export default function PhasePublic({ phase, project, onPost, showToast }) {
  return (
    <div className="pipeline-phase pipeline-phase--public space-y-5">
      <PhaseHero phase={phase} progress={phase.progress} themeClass="pipeline-theme-public" />
      <p className="text-sm text-text-secondary rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        Public building turns private execution into ecosystem momentum. Posts appear on the{' '}
        <strong className="text-text-primary">Feed</strong> for other builders.
      </p>

      <QuestionCard
        number={1}
        title="Post a milestone"
        why="Show the community what your startup shipped — builds credibility and attracts collaborators."
      >
        <FeedPostForm type="milestone" ventureName={project.title} onPost={onPost} showToast={showToast} />
      </QuestionCard>

      <QuestionCard
        number={2}
        title="Post a blocker"
        why="Transparent blockers invite help from students who have solved similar problems."
      >
        <FeedPostForm type="blocker" ventureName={project.title} onPost={onPost} showToast={showToast} />
      </QuestionCard>
    </div>
  )
}
