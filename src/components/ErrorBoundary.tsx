/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Global Error Boundary Component
 * Catches and handles React errors gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('Error caught by boundary:', error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Send to monitoring service (Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send to audit log
    this.logToAudit(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // TODO: Integrate with error monitoring service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    try {
      fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(err => {
        console.error('Failed to log error to service:', err);
      });
    } catch (err) {
      console.error('Error logging failed:', err);
    }
  }

  private logToAudit(error: Error, errorInfo: ErrorInfo) {
    try {
      fetch('/api/audit/system-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'SYSTEM_ERROR',
          user: 'System',
          details: `${error.message}\n\nStack: ${error.stack}\n\nComponent Stack: ${errorInfo.componentStack}`,
          severity: 'Critical',
          status: 'Error',
        }),
      }).catch(err => {
        console.error('Failed to log to audit:', err);
      });
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const subject = encodeURIComponent('Bug Report: Application Error');
    const body = encodeURIComponent(
      `Error Message: ${error?.message}\n\n` +
      `Stack Trace:\n${error?.stack}\n\n` +
      `Component Stack:\n${errorInfo?.componentStack}\n\n` +
      `URL: ${window.location.href}\n` +
      `User Agent: ${navigator.userAgent}\n` +
      `Timestamp: ${new Date().toISOString()}`
    );
    window.location.href = `mailto:support@hotel-erp.com?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
              <div className="flex items-center gap-3 text-white">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Something went wrong</h1>
                  <p className="text-red-100 text-sm mt-1">
                    We apologize for the inconvenience
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  What happened?
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The application encountered an unexpected error. Our team has been
                  automatically notified and will investigate the issue.
                </p>
              </div>

              {/* Error Details (Collapsible) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-slate-50 rounded-lg border border-slate-200">
                  <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
                    Error Details (Development Only)
                  </summary>
                  <div className="px-4 py-3 border-t border-slate-200 space-y-3">
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-500 mb-1">
                        Error Message:
                      </div>
                      <div className="text-xs font-mono text-red-600 bg-red-50 p-2 rounded">
                        {this.state.error.message}
                      </div>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-500 mb-1">
                          Stack Trace:
                        </div>
                        <pre className="text-xs font-mono text-slate-700 bg-slate-100 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-500 mb-1">
                          Component Stack:
                        </div>
                        <pre className="text-xs font-mono text-slate-700 bg-slate-100 p-2 rounded overflow-x-auto max-h-48 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Error Count Warning */}
              {this.state.errorCount > 1 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-amber-900">
                        Multiple Errors Detected
                      </h3>
                      <p className="text-xs text-amber-700 mt-1">
                        This error has occurred {this.state.errorCount} times. Consider
                        reloading the page or contacting support if the issue persists.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  What can you do?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium text-sm"
                  >
                    <RefreshCw size={18} />
                    Try Again
                  </button>
                  <button
                    onClick={this.handleReload}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition font-medium text-sm border border-slate-200"
                  >
                    <RefreshCw size={18} />
                    Reload Page
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition font-medium text-sm border border-slate-200"
                  >
                    <Home size={18} />
                    Go to Home
                  </button>
                  <button
                    onClick={this.handleReportBug}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition font-medium text-sm border border-slate-200"
                  >
                    <Bug size={18} />
                    Report Bug
                  </button>
                </div>
              </div>

              {/* Support Info */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Need Help?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If this problem persists, please contact our support team at{' '}
                  <a
                    href="mailto:support@hotel-erp.com"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    support@hotel-erp.com
                  </a>{' '}
                  or call our helpline. Include the error details above if possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
