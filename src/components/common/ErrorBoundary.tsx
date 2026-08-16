import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          backgroundColor: '#F8FAFC'
        }}>
          <div style={{
            maxWidth: '520px',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '40px 32px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              margin: '0 auto 20px auto'
            }}>
              <FaExclamationTriangle />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
              Something Went Wrong
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: '1.6', margin: '0 0 28px 0' }}>
              We encountered a temporary issue while loading this page. You can safely return to the marketplace or refresh the page.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#007A55',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaHome /> Go to Homepage
              </button>

              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#F1F5F9',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaRedo /> Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
