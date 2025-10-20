import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const onboardingSteps = [
  {
    title: "Welcome to Quantum Canvas!",
    description: "Build hybrid quantum + classical ML workflows visually, no code needed.",
    illustration: (
      <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
        <circle cx="60" cy="75" r="40" stroke="#14b8a6" strokeWidth="3" fill="none" opacity="0.3" />
        <circle cx="60" cy="75" r="12" fill="#14b8a6" />
        <circle cx="140" cy="75" r="40" stroke="#f59e0b" strokeWidth="3" fill="none" opacity="0.3" />
        <circle cx="140" cy="75" r="12" fill="#f59e0b" />
        <line x1="72" y1="75" x2="128" y2="75" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        <text x="100" y="130" textAnchor="middle" fontSize="12" fill="#64748b">Quantum + Classical</text>
      </svg>
    )
  },
  {
    title: "What's Quantum Computing?",
    description: "Think of it like a super-powered computer that uses quantum physics to solve problems regular computers can't handle efficiently.",
    illustration: (
      <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
        <circle cx="100" cy="60" r="35" stroke="#14b8a6" strokeWidth="2" fill="rgba(20, 184, 166, 0.1)" />
        <ellipse cx="100" cy="60" rx="50" ry="15" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.5" />
        <ellipse cx="100" cy="60" rx="15" ry="50" stroke="#14b8a6" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="100" cy="25" r="4" fill="#f59e0b" />
        <circle cx="100" cy="95" r="4" fill="#f59e0b" />
        <text x="100" y="130" textAnchor="middle" fontSize="12" fill="#64748b">Quantum Qubit</text>
      </svg>
    )
  },
  {
    title: "What's Machine Learning?",
    description: "ML helps computers learn patterns from data, like teaching a computer to recognize cats or predict weather.",
    illustration: (
      <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
        <circle cx="40" cy="40" r="10" fill="#f59e0b" opacity="0.8" />
        <circle cx="40" cy="80" r="10" fill="#f59e0b" opacity="0.8" />
        <circle cx="40" cy="120" r="10" fill="#f59e0b" opacity="0.8" />
        <circle cx="100" cy="50" r="10" fill="#94a3b8" opacity="0.8" />
        <circle cx="100" cy="110" r="10" fill="#94a3b8" opacity="0.8" />
        <circle cx="160" cy="80" r="10" fill="#14b8a6" opacity="0.8" />
        <line x1="50" y1="40" x2="90" y2="50" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="50" y1="80" x2="90" y2="50" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="50" y1="120" x2="90" y2="110" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="110" y1="50" x2="150" y2="80" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="110" y1="110" x2="150" y2="80" stroke="#cbd5e1" strokeWidth="2" />
        <text x="100" y="145" textAnchor="middle" fontSize="12" fill="#64748b">Neural Network</text>
      </svg>
    )
  },
  {
    title: "Let's Build Together!",
    description: "Drag nodes from the left panel, connect them, and hit Run to see your hybrid workflow in action.",
    illustration: (
      <svg width="200" height="150" viewBox="0 0 200 150" fill="none">
        <rect x="20" y="50" width="50" height="40" rx="8" fill="rgba(20, 184, 166, 0.1)" stroke="#14b8a6" strokeWidth="2" />
        <rect x="90" y="50" width="50" height="40" rx="8" fill="rgba(20, 184, 166, 0.1)" stroke="#14b8a6" strokeWidth="2" />
        <rect x="160" y="50" width="50" height="40" rx="8" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" strokeWidth="2" />
        <line x1="70" y1="70" x2="90" y2="70" stroke="#14b8a6" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="140" y1="70" x2="160" y2="70" stroke="#14b8a6" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="45" y="75" textAnchor="middle" fontSize="10" fill="#14b8a6">Input</text>
        <text x="115" y="75" textAnchor="middle" fontSize="10" fill="#14b8a6">Process</text>
        <text x="185" y="75" textAnchor="middle" fontSize="10" fill="#f59e0b">Output</text>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#14b8a6" />
          </marker>
        </defs>
        <text x="100" y="130" textAnchor="middle" fontSize="12" fill="#64748b">Your Workflow</text>
      </svg>
    )
  }
];

function OnboardingModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="modal-overlay" onClick={handleSkip}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={handleSkip}
          aria-label="Close onboarding"
        >
          <X size={20} />
        </button>

        <div className="modal-body">
          <div className="illustration-container">
            {step.illustration}
          </div>

          <div className="step-content">
            <h2>{step.title}</h2>
            <p>{step.description}</p>
          </div>

          <div className="step-indicators">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
                role="button"
                tabIndex={0}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={handlePrev}
              disabled={isFirstStep}
              aria-label="Previous step"
            >
              <ChevronLeft size={18} />
              Back
            </button>

            <button className="btn-primary" onClick={handleNext}>
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          animation: slideUp 0.3s ease;
        }

        /* Dark mode styles */
        [data-theme="dark"] .modal-content {
          background-color: #1e293b;
          border-color: #334155;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .modal-close:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        [data-theme="dark"] .modal-close {
          color: #94a3b8;
        }

        [data-theme="dark"] .modal-close:hover {
          background-color: #334155;
          color: #f1f5f9;
        }

        .modal-body {
          padding: 48px 32px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }

        .illustration-container {
          width: 200px;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: quantum-breathe 3s ease-in-out infinite;
        }

        @keyframes quantum-breathe {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        .step-content {
          text-align: center;
          max-width: 400px;
        }

        .step-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        [data-theme="dark"] .step-content h2 {
          color: #f1f5f9;
        }

        .step-content p {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }

        [data-theme="dark"] .step-content p {
          color: #94a3b8;
        }

        .step-indicators {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        [data-theme="dark"] .indicator {
          background-color: #475569;
        }

        .indicator.active {
          width: 24px;
          border-radius: 4px;
          background-color: #14b8a6;
        }

        .indicator:hover {
          background-color: #94a3b8;
        }

        [data-theme="dark"] .indicator:hover {
          background-color: #64748b;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          width: 100%;
          justify-content: space-between;
        }

        .btn-primary,
        .btn-secondary {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .btn-primary {
          background-color: #14b8a6;
          color: white;
          box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
        }

        .btn-primary:hover {
          background-color: #0d9488;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
        }

        .btn-secondary {
          background-color: #f1f5f9;
          color: #0f172a;
          border: 1px solid #e2e8f0;
        }

        [data-theme="dark"] .btn-secondary {
          background-color: #334155;
          color: #f1f5f9;
          border-color: #475569;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #e2e8f0;
          border-color: #14b8a6;
        }

        [data-theme="dark"] .btn-secondary:hover:not(:disabled) {
          background-color: #475569;
          border-color: #14b8a6;
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
          }

          .modal-body {
            padding: 40px 24px 24px;
          }

          .step-content h2 {
            font-size: 1.25rem;
          }

          .step-content p {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}

export default OnboardingModal;