import { X, FileText, Database, Columns, Grid, Upload } from 'lucide-react';

function InputConfigModal({ isOpen, onClose, csvData }) {
  if (!isOpen) return null;

  // SIMPLE CHECK - Same as PreprocessConfigModal that works!
  const hasData = csvData && csvData.data && csvData.data.length > 0;

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
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Input Data Configuration</h2>
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
              <Upload size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
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
              }}>
                Please upload a CSV file using the "Upload CSV" button in the navbar
              </p>
            </div>
          ) : (
            <>
              {/* Data Statistics */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Dataset Information</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    border: '1px solid #86efac',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <Database style={{ color: '#059669', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px'
                      }}>Total Rows</div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#1f2937'
                      }}>{csvData.shape?.[0] || csvData.data.length}</div>
                    </div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    border: '1px solid #86efac',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <Columns style={{ color: '#059669', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px'
                      }}>Total Columns</div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#1f2937'
                      }}>{csvData.shape?.[1] || csvData.meta?.fields?.length || 0}</div>
                    </div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    border: '1px solid #86efac',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <Grid style={{ color: '#059669', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px'
                      }}>File Name</div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#1f2937',
                        wordBreak: 'break-all'
                      }}>{csvData.metadata?.filename || 'data.csv'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column Information */}
              {csvData.meta?.fields && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#374151'
                  }}>Columns ({csvData.meta.fields.length})</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '12px'
                  }}>
                    {csvData.meta.fields.map((field, index) => {
                      const sampleValue = csvData.data[0]?.[field];
                      const dataType = typeof sampleValue === 'number' || !isNaN(Number(sampleValue)) 
                        ? 'numeric' 
                        : 'string';
                      
                      return (
                        <div key={index} style={{
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '12px'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#1f2937'
                            }}>{field}</span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 8px',
                              borderRadius: '4px',
                              background: dataType === 'numeric' ? '#dbeafe' : '#fef3c7',
                              color: dataType === 'numeric' ? '#1e40af' : '#92400e'
                            }}>
                              {dataType === 'numeric' ? '123' : 'ABC'}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Sample: <code style={{
                              background: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontFamily: "'Courier New', monospace",
                              color: '#059669'
                            }}>{String(sampleValue)}</code>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Data Preview */}
              <div>
                <h3 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#374151'
                }}>Data Preview (First 10 Rows)</h3>
                <div style={{
                  overflowX: 'auto',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px'
                  }}>
                    <thead style={{ background: '#f9fafb' }}>
                      <tr>
                        <th style={{
                          padding: '12px 16px',
                          textAlign: 'center',
                          fontWeight: 600,
                          color: '#9ca3af',
                          borderBottom: '2px solid #e5e7eb',
                          whiteSpace: 'nowrap',
                          background: '#f3f4f6',
                          width: '50px'
                        }}>#</th>
                        {csvData.meta?.fields?.map((field, index) => (
                          <th key={index} style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#374151',
                            borderBottom: '2px solid #e5e7eb',
                            whiteSpace: 'nowrap'
                          }}>{field}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.data.slice(0, 10).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td style={{
                            padding: '10px 16px',
                            color: '#9ca3af',
                            borderBottom: '1px solid #f3f4f6',
                            textAlign: 'center',
                            background: '#f3f4f6',
                            fontWeight: 600
                          }}>{rowIndex + 1}</td>
                          {csvData.meta?.fields?.map((field, colIndex) => (
                            <td key={colIndex} style={{
                              padding: '10px 16px',
                              color: '#6b7280',
                              borderBottom: '1px solid #f3f4f6'
                            }}>{String(row[field])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 28px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#f9fafb'
        }}>
          <button style={{
            padding: '12px 28px',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            border: 'none',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white'
          }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputConfigModal;