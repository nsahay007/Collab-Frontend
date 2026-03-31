import React, { useEffect, useState } from 'react'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import { getLeaderboard } from '../features/user/userAPI'
import { getAllColleges } from '../features/college/collegeAPI'

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [colleges, setColleges] = useState([])
  const [collegeFilter, setCollegeFilter] = useState('all')

  const loadLeaderboard = async (college = collegeFilter) => {
    try {
      setLoading(true)
      setError('')
      const response = await getLeaderboard(college)
      setLeaders(response?.users || [])
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
      setError('Unable to load leaderboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [])

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const data = await getAllColleges()
        if (Array.isArray(data)) {
          setColleges(data)
        }
      } catch (err) {
        console.error('Failed to load colleges', err)
      }
    }
    loadColleges()
  }, [])

  const applyFilter = () => loadLeaderboard(collegeFilter)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Leaderboard</h1>
          <p className="text-text-secondary">Top builders, collaborators, and validators on Collab.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <select
            value={collegeFilter}
            onChange={(event) => setCollegeFilter(event.target.value)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All colleges</option>
            {colleges.map((college) => (
              <option key={college._id} value={college._id}>{college.name}</option>
            ))}
          </select>
          <Button variant="secondary" className="w-full sm:w-auto" onClick={applyFilter}>Apply</Button>
        </div>
      </div>

      {loading ? (
        <Card className="text-center">Loading leaderboard...</Card>
      ) : error ? (
        <Card className="text-center text-error">{error}</Card>
      ) : leaders.length === 0 ? (
        <Card className="text-center">No users yet.</Card>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {leaders.map((leader, index) => (
              <Card key={leader._id || index}>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>#{index + 1}</span>
                  <span className="font-semibold text-primary">{leader.points ?? 0} pts</span>
                </div>
                <div className="mt-2">
                  <div className="font-medium text-text-primary">{leader.name || 'User'}</div>
                  <div className="text-xs text-text-muted">{leader.college?.name || '—'}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(leader.badges || []).length > 0 ? leader.badges.map((badge) => (
                    <Badge key={badge} variant="default">{badge}</Badge>
                  )) : <span className="text-xs text-text-muted">No badges</span>}
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-0 overflow-hidden hidden md:block">
            <div className="grid grid-cols-12 gap-3 px-6 py-3 border-b border-border bg-bg-secondary text-xs uppercase text-text-muted">
              <div className="col-span-1">#</div>
              <div className="col-span-4">User</div>
              <div className="col-span-3">College</div>
              <div className="col-span-2">Points</div>
              <div className="col-span-2">Badges</div>
            </div>
            {leaders.map((leader, index) => (
              <div key={leader._id || index} className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-border last:border-b-0">
                <div className="col-span-1 text-text-secondary">{index + 1}</div>
                <div className="col-span-4">
                  <div className="font-medium text-text-primary">{leader.name || 'User'}</div>
                </div>
                <div className="col-span-3 text-text-secondary">{leader.college?.name || '—'}</div>
                <div className="col-span-2 font-semibold text-primary">{leader.points ?? 0}</div>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {(leader.badges || []).length > 0 ? leader.badges.map((badge) => (
                    <Badge key={badge} variant="default">{badge}</Badge>
                  )) : <span className="text-xs text-text-muted">—</span>}
                </div>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  )
}
