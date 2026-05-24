import React from 'react'
import { useParams } from 'react-router-dom'
import StartupWorkspacePage from '../features/execution/StartupWorkspacePage'

export default function ProjectDetail() {
  const { id } = useParams()
  return <StartupWorkspacePage projectId={id} viewMode="workspace" />
}
