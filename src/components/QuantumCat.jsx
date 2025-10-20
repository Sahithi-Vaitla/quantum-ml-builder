import { useState } from 'react';

function QuantumCat() {
  const [isHovered, setIsHovered] = useState(false);
  const [clicks, setClicks] = useState(0);

  const handleClick = () => {
    setClicks(prev => prev + 1);
    
    // Fun messages based on clicks
    const messages = [
      "Meow! 🐱",
      "I'm in superposition! 😸",
      "Schrödinger says hi! 😺",
      "Quantum purring activated! 😻",
      "Wave function collapsed! 🌊"
    ];
    
    console.log(messages[clicks % messages.length]);
  };

  return (
    <div 
      className="quantum-cat"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className={`cat-container ${isHovered ? 'hover' : ''}`}>
        <div className="cat-emoji">🐱</div>
        {isHovered && (
          <div className="cat-tooltip">
            Schrödinger's Cat
            <br />
            <small>Click me! ({clicks} clicks)</small>
          </div>
        )}
      </div>

      <style jsx>{`
        .quantum-cat {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          cursor: pointer;
        }

        .cat-container {
          position: relative;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: float 3s ease-in-out infinite;
        }

        .cat-container.hover {
          transform: scale(1.2) rotate(5deg);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
        }

        .cat-emoji {
          font-size: 32px;
          animation: wiggle 2s ease-in-out infinite;
        }

        .cat-tooltip {
          position: absolute;
          bottom: 80px;
          right: 0;
          background: rgba(15, 23, 42, 0.95);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          animation: fadeInUp 0.3s ease;
        }

        .cat-tooltip::after {
          content: '';
          position: absolute;
          bottom: -8px;
          right: 24px;
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid rgba(15, 23, 42, 0.95);
        }

        .cat-tooltip small {
          opacity: 0.7;
          font-size: 0.75rem;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes wiggle {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-5deg);
          }
          75% {
            transform: rotate(5deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Quantum Glow Effect */
        .cat-container::before {
          content: '';
          position: absolute;
          inset: -4px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          opacity: 0.5;
          filter: blur(12px);
          z-index: -1;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}

export default QuantumCat;