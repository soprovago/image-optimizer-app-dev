import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * @class ErrorBoundary
 * @description A component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the component tree.
 *
 * @example
 * <ErrorBoundary
 *   fallback={<CustomErrorComponent />}
 *   onError={(error, errorInfo) => logErrorToService(error, errorInfo)}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  /**
   * Update state so the next render will show the fallback UI.
   * @param {Error} error - The error that was caught
   * @returns {Object} - Updated state with error information
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Handle the error, log it to the console and call the onError callback if provided.
   * @param {Error} error - The error that was caught
   * @param {Object} errorInfo - React component stack information
   */
  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Set the error info in state
    this.setState({ errorInfo });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset the error state
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({
              error: this.state.error,
              errorInfo: this.state.errorInfo,
              resetError: this.resetError
            })
          : this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <p>Component stack:</p>
            <pre>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            onClick={this.resetError}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '15px'
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    // If there's no error, render the children
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  /**
   * The components that this ErrorBoundary wraps
   */
  children: PropTypes.node.isRequired,
  
  /**
   * Custom component to be rendered in case of an error
   * Can be a React element or a render prop function that receives the error and reset function
   */
  fallback: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func
  ]),
  
  /**
   * Callback function that is called when an error is caught
   */
  onError: PropTypes.func
};

export default ErrorBoundary;

