import { Play, Save, FolderOpen, HelpCircle, Moon, Sun, Upload } from 'lucide-react';

function Navbar({ 
  darkMode, 
  onToggleDarkMode, 
  onRun, 
  onSave, 
  onLoad, 
  onShowOnboarding,
  onUploadCSV,
  hasUploadedData 
}) {
  
  const handleLoadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = onLoad;
    input.click();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo-container">
          <div className="logo-icon">⚛️</div>
          <div className="logo-text">
            <h1>Quantum Canvas</h1>
            <p>Hybrid ML Builder</p>
          </div>
        </div>
      </div>

      <div className="navbar-center">
        <button className="btn-run" onClick={onRun}>
          <Play size={18} fill="white" />
          <span>Run</span>
        </button>

        <button className="btn-upload" onClick={onUploadCSV}>
          <Upload size={18} />
          <span>{hasUploadedData ? 'Replace CSV' : 'Upload CSV'}</span>
          {hasUploadedData && <div className="upload-indicator" />}
        </button>
      </div>

      <div className="navbar-right">
        <button className="icon-btn" onClick={onSave} title="Save Workflow">
          <Save size={20} />
        </button>

        <button className="icon-btn" onClick={handleLoadClick} title="Load Workflow">
          <FolderOpen size={20} />
        </button>

        <button className="icon-btn" onClick={onShowOnboarding} title="Help">
          <HelpCircle size={20} />
        </button>

        <button 
          className="icon-btn theme-toggle" 
          onClick={onToggleDarkMode} 
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <style jsx>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 64px;
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .navbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          font-size: 28px;
          animation: quantum-spin 20s linear infinite;
        }

        @keyframes quantum-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .logo-text h1 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.2;
          transition: color 0.3s ease;
        }

        .logo-text p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.2;
          transition: color 0.3s ease;
        }

        .navbar-center {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-run {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        }

        .btn-run:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        }

        .btn-run:active {
          transform: translateY(0);
        }

        .btn-upload {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
          position: relative;
        }

        .btn-upload:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .btn-upload:active {
          transform: translateY(0);
        }

        .upload-indicator {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse-indicator 2s ease-in-out infinite;
        }

        @keyframes pulse-indicator {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          color: var(--text-secondary);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .icon-btn:active {
          transform: scale(0.95);
        }

        .theme-toggle {
          position: relative;
        }

        .theme-toggle:hover {
          background: var(--bg-hover);
          color: var(--quantum-accent);
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0 16px;
          }

          .logo-text h1 {
            font-size: 1rem;
          }

          .logo-text p {
            display: none;
          }

          .btn-run span,
          .btn-upload span {
            display: none;
          }

          .btn-run,
          .btn-upload {
            padding: 10px;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;