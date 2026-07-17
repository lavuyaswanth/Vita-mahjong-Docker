import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// Last-resort catch for uncaught render errors: without this a single throw
// anywhere in the tree leaves the player staring at a blank white screen.
// Styles are inline so the screen renders even if the stylesheet failed.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            padding: '24px',
            textAlign: 'center',
            background: '#0a2916',
            color: '#f5efe0',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          <div style={{ fontSize: '52px' }} aria-hidden="true">🀄</div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Oops — the tiles got scrambled!</h1>
          <p style={{ margin: 0, maxWidth: '340px', opacity: 0.85 }}>
            Something went wrong. Reload to keep playing — your progress is saved.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '12px 28px',
              fontSize: '17px',
              fontWeight: 700,
              borderRadius: '12px',
              border: '2px solid #c9a84c',
              background: '#1c4d2e',
              color: '#f5efe0',
              cursor: 'pointer'
            }}
          >
            Reload Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
