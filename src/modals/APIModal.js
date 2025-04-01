import React, { useState, useEffect } from 'react';
import { Copy, Check, Play, ChevronDown, X, Loader2 } from 'lucide-react';
import styles from '../styles/Embedded_Modal.module.css';

const APIModal = ({ isOpen, onRequestClose, apiUrl }) => {
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('javascript');
  const [statusCode, setStatusCode] = useState(null);
  const [responseTime, setResponseTime] = useState(null);
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);

  const methods = ['GET', 'POST'];
  const methodColors = {
    GET: 'bg-green-600',
    POST: 'bg-blue-600'
  };

  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => setCopiedCode(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedCode]);

  const getJavaScriptCode = () => `
// Using fetch
fetch('${apiUrl}', {
  method: '${method}',
  headers: ${headers}${method !== 'GET' && method !== 'HEAD' ? `,
  body: ${body || '{}'}` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
  `.trim();

  const getPythonCode = () => `
# Using requests
import requests

headers = ${headers.replace(/\n/g, '\n')}

response = requests.${method.toLowerCase()}('${apiUrl}'${method !== 'GET' && method !== 'HEAD' ? `, 
                               json=${body || '{}'}` : ''}, 
                               headers=headers)
print(response.json())
  `.trim();

  const getCurlCode = () => `
curl -X ${method} \\
  '${apiUrl}' \\
  -H 'Content-Type: application/json' \\${method !== 'GET' && method !== 'HEAD' ? `
  -d '${body || '{}'}' \\` : ''}
  -H 'Accept: application/json'
  `.trim();

  const getActiveCode = () => {
    switch (activeTab) {
      case 'javascript': return getJavaScriptCode();
      case 'python': return getPythonCode();
      case 'curl': return getCurlCode();
      default: return getJavaScriptCode();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedCode(true);
  };

  const executeRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setStatusCode(null);
    setResponseTime(null);
    
    const startTime = performance.now();
    
    try {
      const parsedHeaders = JSON.parse(headers);
      const options = {
        method,
        headers: parsedHeaders,
      };
      
      if (method !== 'GET' && method !== 'HEAD' && body) {
        options.body = body;
      }
      
      const res = await fetch(apiUrl, options);
      setStatusCode(res.status);
      
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
      setResponseTime(Math.round(performance.now() - startTime));
    } catch (err) {
      setError(err.message);
      setResponseTime(Math.round(performance.now() - startTime));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusCodeColor = (code) => {
    if (!code) return 'bg-gray-100 text-gray-800';
    if (code >= 200 && code < 300) return 'bg-green-100 text-green-800';
    if (code >= 300 && code < 400) return 'bg-blue-100 text-blue-800';
    if (code >= 400 && code < 500) return 'bg-yellow-100 text-yellow-800';
    if (code >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`${styles.modalHeader} flex justify-between items-center p-4`}>
          <div className={styles.titleContainer}>
            <span className={styles.viewerTitle}>API Explorer</span>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.closeButton}
              onClick={onRequestClose}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6 dark:text-gray-100">
          {/* Endpoint and Method Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">API Endpoint</label>
              <div className="flex w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <input
                  type="text"
                  value={apiUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-sm font-mono"
                />
                <button 
                  className="px-3 bg-gray-100 dark:bg-gray-700 border-l border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(apiUrl);
                  }}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Method</label>
              <div className="relative">
                <button
                  onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 ${methodColors[method]} text-white`}
                >
                  <span className="font-mono font-bold">{method}</span>
                  <ChevronDown size={18} />
                </button>
                
                {showMethodDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {methods.map((m) => (
                      <button
                        key={m}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${m === method ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                        onClick={() => {
                          setMethod(m);
                          setShowMethodDropdown(false);
                        }}
                      >
                        <span className={`font-mono font-medium ${m === method ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{m}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Headers Editor */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Headers</label>
            <div className="relative rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className="w-full h-32 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none resize-y"
                placeholder="Enter headers in JSON format"
              />
            </div>
          </div>

          {/* Body Editor (Show only for non-GET methods) */}
          {method !== 'GET' && method !== 'HEAD' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Request Body</label>
              <div className="relative rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-32 p-3 font-mono text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none resize-y"
                  placeholder="Enter request body in JSON format"
                />
              </div>
            </div>
          )}

          {/* Code Example */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Example</label>
              <div className="flex items-center space-x-1 text-xs">
                <button 
                  onClick={() => setActiveTab('javascript')}
                  className={`px-2 py-1 rounded ${activeTab === 'javascript' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  JavaScript
                </button>
                <button 
                  onClick={() => setActiveTab('python')}
                  className={`px-2 py-1 rounded ${activeTab === 'python' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Python
                </button>
                <button 
                  onClick={() => setActiveTab('curl')}
                  className={`px-2 py-1 rounded ${activeTab === 'curl' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  cURL
                </button>
              </div>
            </div>
            <div className="relative rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden">
              <div className="absolute right-2 top-2">
                <button
                  onClick={copyCode}
                  className="p-1.5 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600"
                >
                  {copiedCode ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                </button>
              </div>
              <pre className="p-4 pt-12 max-h-64 overflow-y-auto text-sm font-mono">
                <code>{getActiveCode()}</code>
              </pre>
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={executeRequest}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center space-x-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Executing Request...</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span>Execute Request</span>
              </>
            )}
          </button>

          {/* Response Section */}
          {(response || error || loading) && (
            <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 p-3 flex justify-between items-center">
                <h3 className="font-medium">Response</h3>
                <div className="flex items-center space-x-3">
                  {statusCode && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusCodeColor(statusCode)}`}>
                      Status: {statusCode}
                    </span>
                  )}
                  {responseTime && (
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {responseTime}ms
                    </span>
                  )}
                </div>
              </div>
              
              <div className="relative">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
                    <div className="flex flex-col items-center">
                      <Loader2 size={32} className="animate-spin text-indigo-600" />
                      <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">Processing request...</span>
                    </div>
                  </div>
                )}
                
                <pre className={`p-4 max-h-64 overflow-y-auto text-sm font-mono ${
                  error ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                }`}>
                  {error || response || 'Awaiting response...'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIModal;