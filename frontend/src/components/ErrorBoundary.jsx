import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-danger-500/10 text-danger-500">
            <AlertTriangle size={28} />
          </div>
          <h1 className="font-display text-2xl font-bold text-neutral-900">Something went wrong</h1>
          <p className="max-w-sm text-sm text-neutral-500">
            An unexpected error occurred. Try reloading the page — if it keeps happening, please contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-600"
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
