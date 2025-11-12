import React from 'react';
import { Button } from 'antd';
import { FrownOutlined } from '@ant-design/icons';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary Caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-card">
            <FrownOutlined className="error-boundary-icon" />
            <h2>Oops! Something went wrong</h2>
            <p>We encountered an error while loading this page.</p>
            <Button type="primary" onClick={this.handleReload}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
