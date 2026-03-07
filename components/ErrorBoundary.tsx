// @ts-nocheck — ErrorBoundary requires class component; project lacks @types/react
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crashed:', error, info);
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div style={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0a09',
          color: '#e7e5e4',
          padding: '2rem',
          textAlign: 'center' as const,
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: 'rgba(127, 29, 29, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '1.5rem',
          }}>
            !
          </div>
          <h1 style={{ fontSize: '1.5rem', fontFamily: 'Georgia, serif', marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#a8a29e', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            The app encountered an unexpected error.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#b45309',
              color: 'white',
              fontWeight: 600,
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              minHeight: '48px',
              fontSize: '1rem',
            }}
          >
            Tap to Restart
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
