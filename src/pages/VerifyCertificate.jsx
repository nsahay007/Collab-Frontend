import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import axios from '../services/axiosInstance'

export default function VerifyCertificate() {
  const { certificateId } = useParams()
  const [state, setState] = useState({ loading: true, error: '', data: null })

  useEffect(() => {
    let active = true
    axios.get(`/public/verify/${certificateId}`)
      .then((response) => {
        if (active) setState({ loading: false, error: '', data: response.data })
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            error: error?.response?.data?.message || 'Certificate could not be verified.',
            data: null
          })
        }
      })
    return () => {
      active = false
    }
  }, [certificateId])

  if (state.loading) {
    return <Card hover={false}>Checking certificate...</Card>
  }

  if (state.error) {
    return (
      <Card hover={false} className="border-error/30">
        <Badge variant="error">Invalid / Tampered</Badge>
        <h1 className="mt-4 text-2xl font-bold text-text-primary">Certificate not verified</h1>
        <p className="mt-2 text-text-secondary">{state.error}</p>
      </Card>
    )
  }

  const cert = state.data?.certificate || {}
  const valid = Boolean(state.data?.valid)

  return (
    <Card hover={false} className={valid ? 'border-success/30 bg-success/5' : 'border-error/30'}>
      <Badge variant={valid ? 'success' : 'error'}>
        {valid ? 'VALID CERTIFICATE' : 'INVALID / TAMPERED'}
      </Badge>
      <h1 className="mt-4 text-2xl font-bold text-text-primary">
        {valid ? 'Certificate verified' : 'Certificate mismatch detected'}
      </h1>
      <div className="mt-5 space-y-2 text-sm text-text-secondary">
        <p><strong>Certificate ID:</strong> {cert.certificateId}</p>
        <p><strong>Member:</strong> {cert.user?.name || 'Team Member'}</p>
        <p><strong>Role:</strong> {cert.role || 'Startup Team Member'}</p>
        <p><strong>Startup:</strong> {cert.startupName || cert.project?.title || 'Startup'}</p>
        <p><strong>Status:</strong> {cert.projectStatus || 'In Progress'}</p>
        <p className="break-all"><strong>SHA256:</strong> {cert.verificationHash || 'Not available'}</p>
        {cert.verificationUrl && (
          <p className="break-all"><strong>Verify URL:</strong> {cert.verificationUrl}</p>
        )}
      </div>
    </Card>
  )
}
