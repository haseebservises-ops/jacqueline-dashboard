import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state to show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#b91c1c' }}>
                    <h1>Something went wrong.</h1>
                    <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fca5a5', marginTop: '1rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>Error Message:</h3>
                        <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{this.state.error && this.state.error.toString()}</pre>
                    </div>
                    {this.state.errorInfo && (
                        <details style={{ marginTop: '1rem', cursor: 'pointer' }}>
                            <summary>Stack Trace</summary>
                            <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem', background: '#f3f4f6', padding: '1rem', overflowX: 'auto' }}>
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '2rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
