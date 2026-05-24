import React from 'react'
import Button from './Button'
import Card from './Card'

export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Route render error:', error, info)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <Card className="max-w-2xl mx-auto border-error/30" hover={false}>
        <h2 className="text-xl font-semibold text-text-primary">Something went wrong</h2>
        <p className="text-sm text-text-secondary mt-2">
          This page hit an unexpected error. You can retry or go back to Build.
        </p>
        <p className="text-xs text-text-muted mt-3 font-mono break-all">
          {error?.message || 'Unknown error'}
        </p>
        <div className="flex flex-wrap gap-2 mt-5">
          <Button size="sm" onClick={() => this.setState({ error: null })}>
            Try again
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              window.location.href = '/build'
            }}
          >
            Go to Build
          </Button>
        </div>
      </Card>
    )
  }
}
