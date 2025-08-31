
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center p-8">
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-8 max-w-2xl text-center">
                <h1 className="text-3xl font-bold text-red-300 mb-4">Application Error</h1>
                <p className="text-red-200 mb-6">
                    A critical error occurred and the application cannot continue. This is usually caused by a problem during rendering.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="text-left bg-gray-800 p-4 rounded-md">
                        <summary className="cursor-pointer font-semibold text-red-300">Error Details</summary>
                        <pre className="text-sm text-red-200 mt-2 whitespace-pre-wrap overflow-auto">
                            {this.state.error.toString()}
                            <br />
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </details>
                )}
                 <button 
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold"
                >
                    Reload Application
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
