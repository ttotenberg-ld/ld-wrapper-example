import { useState } from 'react';
import { useNetworkMonitor } from '../hooks/useNetworkMonitor';

const NetworkMonitor = () => {
  const { requests, clearRequests } = useNetworkMonitor();
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [copiedStates, setCopiedStates] = useState({});

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffa500'; // orange
      case 'completed':
        return '#28a745'; // green
      case 'error':
        return '#dc3545'; // red
      default:
        return '#6c757d'; // gray
    }
  };

  const formatJson = (obj) => {
    if (typeof obj === 'string') {
      try {
        // Try to parse the string as JSON and format it
        const parsed = JSON.parse(obj);
        return JSON.stringify(parsed, null, 2);
      } catch {
        // If it's not valid JSON, return the string as-is
        return obj;
      }
    }
    if (obj === null || obj === undefined) {
      return String(obj);
    }
    // For objects, arrays, etc., format with proper indentation
    return JSON.stringify(obj, null, 2);
  };

  const formatRequestBody = (body) => {
    if (!body) return '';
    
    // Handle different body types
    if (typeof body === 'string') {
      // First try to parse as JSON for pretty formatting
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        // If not JSON, check if it's a URL-encoded string
        if (body.includes('=') && body.includes('&')) {
          // Format URL-encoded data with line breaks
          return body.split('&').map(param => decodeURIComponent(param)).join('\n');
        }
        // Return as-is if it's just a regular string
        return body;
      }
    }
    
    // For FormData, ArrayBuffer, etc.
    if (body instanceof FormData) {
      const entries = [];
      for (let [key, value] of body.entries()) {
        entries.push(`${key}: ${value}`);
      }
      return entries.join('\n');
    }
    
    // For objects, format as JSON
    return JSON.stringify(body, null, 2);
  };

  const copyToClipboard = async (text, requestId, section) => {
    try {
      await navigator.clipboard.writeText(text);
      const key = `${requestId}-${section}`;
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        const key = `${requestId}-${section}`;
        setCopiedStates(prev => ({ ...prev, [key]: true }));
        setTimeout(() => {
          setCopiedStates(prev => ({ ...prev, [key]: false }));
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const toggleExpanded = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const containerStyle = {
    maxWidth: '100%',
    margin: '20px 0',
    fontFamily: 'monospace',
    backgroundColor: '#ffffff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '0'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px 8px 0 0',
    borderBottom: '1px solid #dee2e6'
  };

  const contentStyle = {
    padding: '10px'
  };

  const requestItemStyle = {
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    marginBottom: '8px',
    overflow: 'hidden',
    backgroundColor: '#ffffff'
  };

  const requestHeaderStyle = (status) => ({
    padding: '12px 15px',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeft: `4px solid ${getStatusColor(status)}`,
    color: '#212529'
  });

  const requestDetailsStyle = {
    padding: '15px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #dee2e6',
    color: '#212529'
  };

  const sectionStyle = {
    marginBottom: '15px'
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: '8px',
    fontSize: '14px'
  };

  const sectionHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  };

  const codeBlockStyle = {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '12px',
    maxHeight: '200px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    border: '1px solid #e9ecef',
    color: '#212529',
    textAlign: 'left'
  };

  const buttonStyle = {
    padding: '8px 12px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const clearButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d'
  };

  const copyButtonStyle = {
    padding: '4px 8px',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500'
  };

  const copiedButtonStyle = {
    ...copyButtonStyle,
    backgroundColor: '#6c757d'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    color: '#6c757d',
    padding: '40px 20px',
    backgroundColor: '#ffffff'
  };

  const detailRowStyle = {
    marginBottom: '8px',
    color: '#212529'
  };

  if (requests.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#212529' }}>🌐 LaunchDarkly Network Monitor</h3>
        </div>
        <div style={emptyStateStyle}>
          <p>
            No LaunchDarkly network requests captured yet. 
            <br />
            <small style={{ color: '#868e96' }}>The monitor will capture requests to *.launchdarkly.com domains automatically.</small>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, color: '#212529' }}>🌐 LaunchDarkly Network Monitor ({requests.length})</h3>
        <button onClick={clearRequests} style={clearButtonStyle}>
          Clear All
        </button>
      </div>

      <div style={contentStyle}>
        {requests.map((request) => (
          <div key={request.id} style={requestItemStyle}>
            <div 
              style={requestHeaderStyle(request.status)}
              onClick={() => toggleExpanded(request.id)}
            >
              <div style={{ color: '#212529' }}>
                <strong>{request.method}</strong> {new URL(request.url).pathname}
                {request.duration && <span style={{ color: '#6c757d' }}> ({request.duration}ms)</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  color: getStatusColor(request.status),
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {request.status.toUpperCase()}
                  {request.responseStatus && ` ${request.responseStatus}`}
                </span>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>
                  {expandedRequest === request.id ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {expandedRequest === request.id && (
              <div style={requestDetailsStyle}>
                <div style={sectionStyle}>
                  <div style={labelStyle}>📍 Request Details</div>
                  <div style={detailRowStyle}><strong>URL:</strong> {request.url}</div>
                  <div style={detailRowStyle}><strong>Method:</strong> {request.method}</div>
                  <div style={detailRowStyle}><strong>Type:</strong> {request.type}</div>
                  <div style={detailRowStyle}><strong>Timestamp:</strong> {new Date(request.timestamp).toLocaleTimeString()}</div>
                  {request.duration && <div style={detailRowStyle}><strong>Duration:</strong> {request.duration}ms</div>}
                </div>

                {Object.keys(request.headers).length > 0 && (
                  <div style={sectionStyle}>
                    <div style={labelStyle}>📨 Request Headers</div>
                    <div style={codeBlockStyle}>
                      {formatJson(request.headers)}
                    </div>
                  </div>
                )}

                {request.body && (
                  <div style={sectionStyle}>
                    <div style={sectionHeaderStyle}>
                      <div style={labelStyle}>📦 Request Body</div>
                      <button
                        onClick={() => copyToClipboard(formatRequestBody(request.body), request.id, 'body')}
                        style={copiedStates[`${request.id}-body`] ? copiedButtonStyle : copyButtonStyle}
                      >
                        {copiedStates[`${request.id}-body`] ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div style={codeBlockStyle}>
                      {formatRequestBody(request.body)}
                    </div>
                  </div>
                )}

                {request.responseStatus && (
                  <div style={sectionStyle}>
                    <div style={labelStyle}>📥 Response Details</div>
                    <div style={detailRowStyle}><strong>Status:</strong> {request.responseStatus}</div>
                    {request.error && <div style={{ color: '#dc3545', ...detailRowStyle }}><strong>Error:</strong> {request.error}</div>}
                  </div>
                )}

                {request.responseHeaders && Object.keys(request.responseHeaders).length > 0 && (
                  <div style={sectionStyle}>
                    <div style={labelStyle}>📨 Response Headers</div>
                    <div style={codeBlockStyle}>
                      {formatJson(request.responseHeaders)}
                    </div>
                  </div>
                )}

                {request.responseBody && (
                  <div style={sectionStyle}>
                    <div style={labelStyle}>📦 Response Body</div>
                    <div style={codeBlockStyle}>
                      {typeof request.responseBody === 'string' 
                        ? request.responseBody 
                        : formatJson(request.responseBody)
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkMonitor; 