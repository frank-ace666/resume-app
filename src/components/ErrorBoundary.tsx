import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-xl font-semibold text-slate-800 mb-2">出了点问题</h1>
          <p className="text-sm text-slate-500 mb-4 max-w-md text-center">
            应用遇到了意外错误。请尝试刷新页面，或点击下方按钮重新开始。
          </p>
          <pre className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4 max-w-lg overflow-auto">
            {this.state.error?.message}
          </pre>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            重新开始
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
