import { useState, useMemo } from 'react';
import { X, Settings, Sliders, Eye, EyeOff, Activity, Split } from 'lucide-react';

function PreprocessConfigModal({ isOpen, onClose, csvData, onApply }) {
  const [operation, setOperation] = useState('normalize');
  const [trainSplit, setTrainSplit] = useState(70);
  const [pcaComponents, setPcaComponents] = useState(2);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  // SIMPLE CHECK
  const hasData = csvData && csvData.data && csvData.data.length > 0;

  // Calculate preview of transformation
  const transformedPreview = useMemo(() => {
    if (!hasData || !showPreview || !csvData.meta || !csvData.meta.fields) return null;

    try {
      const numericColumns = csvData.meta.fields.filter(field => {
        const sample = csvData.data[0][field];
        return typeof sample === 'number' || !isNaN(Number(sample));
      });

      if (numericColumns.length === 0) {
        return { error: 'No numeric columns found in the dataset' };
      }

      const sampleSize = Math.min(5, csvData.data.length);
      const originalSample = csvData.data.slice(0, sampleSize).map(row => 
        numericColumns.map(col => {
          const val = parseFloat(row[col]);
          return isNaN(val) ? 0 : val;
        })
      );

      let transformed;
      let transformedColumns = numericColumns;

      switch (operation) {
        case 'normalize':
          transformed = normalizeData(originalSample);
          break;
        case 'standardize':
          transformed = standardizeData(originalSample);
          break;
        case 'pca':
          const components = Math.min(pcaComponents, numericColumns.length);
          transformed = originalSample.map(row => row.slice(0, components));
          transformedColumns = Array.from({ length: components }, (_, i) => `PC${i + 1}`);
          break;
        default:
          transformed = originalSample;
      }

      return {
        original: originalSample,
        transformed,
        originalColumns: numericColumns,
        transformedColumns
      };
    } catch (error) {
      console.error('Preview error:', error);
      return { error: 'Error generating preview' };
    }
  }, [csvData, operation, pcaComponents, showPreview, hasData]);

  const normalizeData = (data) => {
    if (!data || data.length === 0) return data;
    const cols = data[0].length;
    const normalized = Array(data.length).fill(null).map(() => Array(cols));
    
    for (let col = 0; col < cols; col++) {
      const values = data.map(row => row[col]);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      
      for (let row = 0; row < data.length; row++) {
        normalized[row][col] = (data[row][col] - min) / range;
      }
    }
    return normalized;
  };

  const standardizeData = (data) => {
    if (!data || data.length === 0) return data;
    const cols = data[0].length;
    const standardized = Array(data.length).fill(null).map(() => Array(cols));
    
    for (let col = 0; col < cols; col++) {
      const values = data.map(row => row[col]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance) || 1;
      
      for (let row = 0; row < data.length; row++) {
        standardized[row][col] = (data[row][col] - mean) / std;
      }
    }
    return standardized;
  };

  const handleApply = () => {
    const config = {
      operation,
      trainSplit,
      pcaComponents: operation === 'pca' ? pcaComponents : null
    };
    onApply(config);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '900px',
        maxHeight: '85vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Preprocessing Configuration</h2>
          </div>
          <button style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '8px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white'
          }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '28px'
        }}>
          {!hasData ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <Activity size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
              <p style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#374151',
                margin: '0 0 8px 0'
              }}>No data loaded yet</p>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>Connect an Input node with CSV data first</p>
            </div>
          ) : (
            <>
              {/* Operation Selection */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  color: '#374151'
                }}>
                  <Sliders size={18} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Preprocessing Operation</h3>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <button
                    style={{
                      background: operation === 'normalize' ? 'linear-gradient(135deg, #667eea15, #764ba215)' : 'white',
                      border: `2px solid ${operation === 'normalize' ? '#667eea' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      boxShadow: operation === 'normalize' ? '0 4px 12px rgba(102, 126, 234, 0.2)' : 'none'
                    }}
                    onClick={() => setOperation('normalize')}
                  >
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1f2937',
                      marginBottom: '6px'
                    }}>Normalize</div>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginBottom: '10px'
                    }}>Scale data to [0, 1]</div>
                    <div style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '12px',
                      color: '#667eea',
                      background: '#f3f4f6',
                      padding: '6px 10px',
                      borderRadius: '6px'
                    }}>x' = (x - min) / (max - min)</div>
                  </button>

                  <button
                    style={{
                      background: operation === 'standardize' ? 'linear-gradient(135deg, #667eea15, #764ba215)' : 'white',
                      border: `2px solid ${operation === 'standardize' ? '#667eea' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      boxShadow: operation === 'standardize' ? '0 4px 12px rgba(102, 126, 234, 0.2)' : 'none'
                    }}
                    onClick={() => setOperation('standardize')}
                  >
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1f2937',
                      marginBottom: '6px'
                    }}>Standardize</div>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginBottom: '10px'
                    }}>Mean = 0, Std = 1</div>
                    <div style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '12px',
                      color: '#667eea',
                      background: '#f3f4f6',
                      padding: '6px 10px',
                      borderRadius: '6px'
                    }}>x' = (x - μ) / σ</div>
                  </button>

                  <button
                    style={{
                      background: operation === 'pca' ? 'linear-gradient(135deg, #667eea15, #764ba215)' : 'white',
                      border: `2px solid ${operation === 'pca' ? '#667eea' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      boxShadow: operation === 'pca' ? '0 4px 12px rgba(102, 126, 234, 0.2)' : 'none'
                    }}
                    onClick={() => setOperation('pca')}
                  >
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1f2937',
                      marginBottom: '6px'
                    }}>PCA</div>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginBottom: '10px'
                    }}>Reduce dimensions</div>
                    <div style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '12px',
                      color: '#667eea',
                      background: '#f3f4f6',
                      padding: '6px 10px',
                      borderRadius: '6px'
                    }}>Project to n components</div>
                  </button>
                </div>

                {/* PCA Components Slider */}
                {operation === 'pca' && csvData?.meta?.fields && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: '#f9fafb',
                    borderRadius: '10px'
                  }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '12px',
                      color: '#374151',
                      fontSize: '14px'
                    }}>
                      Number of Components: <strong>{pcaComponents}</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={Math.min(10, (csvData?.meta?.fields?.length || 10))}
                      value={pcaComponents}
                      onChange={(e) => setPcaComponents(parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        height: '6px',
                        borderRadius: '3px',
                        background: '#e5e7eb',
                        outline: 'none',
                        WebkitAppearance: 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Train/Test Split */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                  color: '#374151'
                }}>
                  <Split size={18} />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Train/Test Split</h3>
                </div>
                
                <div style={{
                  background: '#f9fafb',
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    height: '50px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'width 0.3s ease',
                      width: `${trainSplit}%`,
                      background: 'linear-gradient(135deg, #10b981, #059669)'
                    }}>
                      <span style={{
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>Train: {trainSplit}%</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'width 0.3s ease',
                      width: `${100 - trainSplit}%`,
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)'
                    }}>
                      <span style={{
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>Test: {100 - trainSplit}%</span>
                    </div>
                  </div>
                  
                  <input
                    type="range"
                    min="50"
                    max="90"
                    step="5"
                    value={trainSplit}
                    onChange={(e) => setTrainSplit(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#e5e7eb',
                      outline: 'none',
                      WebkitAppearance: 'none',
                      marginBottom: '16px'
                    }}
                  />
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>Training Samples:</span>
                      <span style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#1f2937'
                      }}>{Math.floor((csvData?.data?.length || 0) * trainSplit / 100)}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>Testing Samples:</span>
                      <span style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#1f2937'
                      }}>{Math.ceil((csvData?.data?.length || 0) * (100 - trainSplit) / 100)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '20px 0'
              }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: showPreview ? '#667eea' : 'white',
                    border: '2px solid #667eea',
                    borderRadius: '10px',
                    color: showPreview ? 'white' : '#667eea',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                  {showPreview ? 'Hide' : 'Show'} Transformation Preview
                </button>
              </div>

              {/* Transformation Preview */}
              {showPreview && transformedPreview && (
                <div style={{
                  background: '#f9fafb',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  marginBottom: '20px'
                }}>
                  <h3 style={{
                    margin: '0 0 20px 0',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#374151'
                  }}>Transformation Preview (First 5 Rows)</h3>
                  
                  {transformedPreview.error ? (
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'center',
                      color: '#991b1b'
                    }}>
                      <p>{transformedPreview.error}</p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto 1fr',
                      gap: '20px',
                      alignItems: 'start'
                    }}>
                      <div>
                        <h4 style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#6b7280',
                          margin: '0 0 12px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Original Data</h4>
                        <div style={{
                          overflowX: 'auto',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '12px'
                          }}>
                            <thead>
                              <tr>
                                {transformedPreview.originalColumns.map((col, i) => (
                                  <th key={i} style={{
                                    background: '#f3f4f6',
                                    padding: '8px 12px',
                                    textAlign: 'left',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#374151',
                                    borderBottom: '1px solid #e5e7eb',
                                    whiteSpace: 'nowrap'
                                  }}>{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {transformedPreview.original.map((row, i) => (
                                <tr key={i}>
                                  {row.map((val, j) => (
                                    <td key={j} style={{
                                      padding: '8px 12px',
                                      color: '#6b7280',
                                      borderBottom: '1px solid #f3f4f6',
                                      fontFamily: "'Courier New', monospace"
                                    }}>{val.toFixed(3)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div style={{
                        fontSize: '24px',
                        color: '#667eea',
                        fontWeight: 'bold',
                        paddingTop: '40px'
                      }}>→</div>

                      <div>
                        <h4 style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#6b7280',
                          margin: '0 0 12px 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Transformed Data</h4>
                        <div style={{
                          overflowX: 'auto',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '12px'
                          }}>
                            <thead>
                              <tr>
                                {transformedPreview.transformedColumns.map((col, i) => (
                                  <th key={i} style={{
                                    background: '#f3f4f6',
                                    padding: '8px 12px',
                                    textAlign: 'left',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#374151',
                                    borderBottom: '1px solid #e5e7eb',
                                    whiteSpace: 'nowrap'
                                  }}>{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {transformedPreview.transformed.map((row, i) => (
                                <tr key={i}>
                                  {row.map((val, j) => (
                                    <td key={j} style={{
                                      padding: '8px 12px',
                                      color: '#667eea',
                                      fontWeight: 500,
                                      borderBottom: '1px solid #f3f4f6',
                                      fontFamily: "'Courier New', monospace"
                                    }}>{val.toFixed(3)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 28px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          background: '#f9fafb'
        }}>
          <button style={{
            padding: '12px 28px',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            background: 'white',
            color: '#374151',
            border: '2px solid #e5e7eb'
          }} onClick={onClose}>
            Cancel
          </button>
          <button 
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: hasData ? 'pointer' : 'not-allowed',
              border: 'none',
              background: hasData ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
              color: 'white',
              opacity: hasData ? 1 : 0.5
            }}
            onClick={handleApply}
            disabled={!hasData}
          >
            Apply Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreprocessConfigModal;