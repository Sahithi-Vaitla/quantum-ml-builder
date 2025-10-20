import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Github, Linkedin, Twitter, Sparkles } from 'lucide-react';

function Homepage() {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState(null);
  
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">⚛️</span>
            <span className="logo-text">Quantum Canvas</span>
          </div>
          <div className="nav-links">
            <a href="#explanation" onClick={(e) => { e.preventDefault(); scrollToSection('explanation'); }}>About</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Features</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}>How It Works</a>
            <a href="https://github.com/yourusername/quantum-canvas" target="_blank" rel="noopener noreferrer">GitHub</a>
            <button className="cta-button" onClick={() => navigate('/app')}>
              Try Live Demo
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Next-Gen Quantum ML Platform</span>
          </div>
          <h1 className="hero-title">
            Build Quantum-ML Workflows Visually
          </h1>
          <p className="hero-description">
            The first drag-and-drop hybrid quantum-classical machine learning pipeline builder. 
            Design complex workflows without writing a single line of code.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate('/app')}>
              <span>Launch Platform</span>
              <ArrowRight size={20} />
            </button>
            <button className="secondary-button" onClick={() => scrollToSection('explanation')}>
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="video-container">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="hero-video"
            >
              <source src="/images/herosection-video.mp4" type="video/mp4" />
            </video>
            <div className="video-glow"></div>
          </div>
        </div>
      </section>

      {/* Explanation Section */}
      <section id="explanation" className="explanation">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">What is Quantum Machine Learning?</h2>
            <p className="section-description">
              Quantum Machine Learning combines quantum computing with AI to unlock computational possibilities 
              that transform drug discovery, financial modeling, and complex problem-solving.
            </p>
          </div>
          
          <div className="advanced-cards">
            {[
              {
                id: 'quantum',
                icon: '/images/quantum atom.png',
                title: 'Quantum Computing',
                subtitle: 'The Power of Quantum Mechanics',
                description: 'Quantum computers leverage superposition and entanglement to process information in fundamentally different ways than classical computers.',
                features: [
                  'Superposition: Process multiple possibilities simultaneously',
                  'Entanglement: Create impossible classical correlations',
                  'Quantum Gates: Manipulate quantum states',
                  'Exponential Speedup: Solve problems exponentially faster'
                ],
                gradient: 'from-blue-500 to-purple-600'
              },
              {
                id: 'ml',
                icon: '/images/classical neuron.png',
                title: 'Classical ML',
                subtitle: 'Learning from Data',
                description: 'Classical machine learning algorithms learn patterns from data, revolutionizing computer vision, NLP, and predictive analytics.',
                features: [
                  'Neural Networks: Learn complex patterns',
                  'Training: Optimize through backpropagation',
                  'Classification: Categorize data into classes',
                  'Regression: Predict continuous values'
                ],
                gradient: 'from-pink-500 to-red-600'
              },
              {
                id: 'hybrid',
                icon: '/images/data pipeline.png',
                title: 'Hybrid Workflows',
                subtitle: 'Best of Both Worlds',
                description: 'Combine classical preprocessing with quantum computation for practical applications on near-term quantum devices.',
                features: [
                  'Data Flow: Seamless classical-quantum transfer',
                  'Variational Algorithms: Quantum with classical feedback',
                  'Feature Encoding: Map data to quantum states',
                  'Result Interpretation: Extract meaningful insights'
                ],
                gradient: 'from-green-500 to-teal-600'
              },
              {
                id: 'browser',
                icon: '/images/browser window.png',
                title: 'In-Browser Platform',
                subtitle: 'Accessible Quantum Computing',
                description: 'Run quantum simulations entirely in your browser—no installation, no setup, no expensive hardware required.',
                features: [
                  'Zero Installation: Start building immediately',
                  'Visual Interface: Drag-and-drop design',
                  'Real-Time Simulation: Instant results',
                  'Educational: Learn through experimentation'
                ],
                gradient: 'from-orange-500 to-amber-600'
              }
            ].map((card) => (
              <div 
                key={card.id}
                className={`advanced-card ${expandedCard === card.id ? 'expanded' : ''}`}
                onMouseEnter={() => setExpandedCard(card.id)}
                onMouseLeave={() => setExpandedCard(null)}
              >
                <div className="card-glow"></div>
                <div className="card-inner">
                  <div className="card-icon-wrapper">
                    <img src={card.icon} alt={card.title} className="card-icon-img" />
                  </div>
                  <h3 className="card-title">{card.title}</h3>
                  <div className="card-expanded-content">
                    <p className="card-subtitle">{card.subtitle}</p>
                    <p className="card-desc">{card.description}</p>
                    <ul className="card-features">
                      {card.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Platform Features</h2>
            <p className="section-description">
              Everything you need to build production-ready quantum-ML workflows
            </p>
          </div>

          <div className="feature-grid">
            {[
              {
                img: '/images/hybridworkflow.png',
                title: 'Hybrid Workflow',
                desc: 'Seamlessly combine quantum and classical machine learning blocks in a single drag-and-drop workflow.'
              },
              {
                img: '/images/no code.png',
                title: 'No Code Required',
                desc: 'Build advanced quantum-ML solutions visually. Just drag, drop, and connect—no programming knowledge needed.'
              },
              {
                img: '/images/Opensource.png',
                title: 'Open Source',
                desc: 'Free for everyone, forever. Explore, customize, and contribute to advancing accessible quantum technology.'
              },
              {
                img: '/images/In-browser.png',
                title: 'Runs In Browser',
                desc: 'Everything runs instantly in your web browser—no installation, no setup, no hardware needed.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="feature-card-modern">
                <div className="feature-img-wrapper">
                  <img src={feature.img} alt={feature.title} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-description">Get started in four simple steps</p>
          </div>

          <div className="steps-container">
            {[
              {
                num: '01',
                img: '/images/drag node.png',
                title: 'Drag Nodes',
                desc: 'Choose from Quantum, ML, Input, or Output blocks and drag them onto the canvas'
              },
              {
                num: '02',
                img: '/images/connect nodes.png',
                title: 'Connect Blocks',
                desc: 'Link your blocks in any order to define your data pipeline and workflow'
              },
              {
                num: '03',
                img: '/images/Run nodes.png',
                title: 'Run Workflow',
                desc: 'Click "Run" to execute your workflow with real computation and instant feedback'
              },
              {
                num: '04',
                img: '/images/results of nodes.png',
                title: 'Analyze Results',
                desc: 'See live metrics, scientific charts, and quantum visualizations in real-time'
              }
            ].map((step, idx) => (
              <div key={idx} className="step-card">
                <div className="step-number">{step.num}</div>
                <div className="step-img-box">
                  <img src={step.img} alt={step.title} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="community">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Open Source & Community Driven</h2>
            <p className="section-description">
              Join our growing community advancing accessible quantum-ML technology
            </p>
          </div>

          <div className="community-content">
            <div className="community-visual">
              <img src="/images/join the community.png" alt="Community" />
            </div>
            <div className="community-actions">
              <a href="https://github.com/yourusername/quantum-canvas" className="community-btn">
                <Github size={20} />
                <span>Star on GitHub</span>
              </a>
              <a href="https://linkedin.com" className="community-btn">
                <Linkedin size={20} />
                <span>Share on LinkedIn</span>
              </a>
              <a href="https://twitter.com" className="community-btn">
                <Twitter size={20} />
                <span>Share on Twitter</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">⚛️</span>
              <span>Quantum Canvas</span>
            </div>
            <p className="footer-desc">The first visual quantum-ML workflow builder</p>
            <img src="/images/footer image cat.png" alt="Mascot" className="footer-cat" />
          </div>

          <div className="footer-section">
            <h4>Project</h4>
            <a href="https://github.com">GitHub</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/app'); }}>Launch App</a>
            <a href="#features">Features</a>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <a href="https://linkedin.com">LinkedIn</a>
            <a href="https://twitter.com">Twitter</a>
            <a href="mailto:hello@quantum.com">Email</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Quantum Canvas. Open source under MIT License.</p>
          <p>Made with ⚛️ by Sahithi Vaitla</p>
        </div>
      </footer>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .homepage {
          width: 100%;
          background: #ffffff;
        }

        /* Navigation */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          z-index: 100;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
        }

        .logo-icon {
          font-size: 2rem;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 40px;
        }

        .nav-links a {
          color: #64748b;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .nav-links a:hover {
          color: #0f172a;
        }

        .cta-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: inherit;
          font-size: 0.95rem;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
        }

        /* Hero Section - Gradient 1 */
        .hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 140px 60px 100px;
  background: linear-gradient(180deg, 
    #e8edff 0%, 
    #f4f7ff 50%, 
    #ffffff 100%
  );
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 600px;
  background: radial-gradient(circle at 50% 0%, 
    rgba(102, 126, 234, 0.15) 0%, 
    transparent 70%
  );
  pointer-events: none;
}

        .hero-content {
          max-width: 800px;
          text-align: center;
          z-index: 1;
          margin-bottom: 80px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 24px;
        }

        .hero-title {
          font-size: 4.5rem;
          font-weight: 800;
          margin: 0 0 24px 0;
          background: linear-gradient(135deg, #0f172a, #334155);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .hero-description {
          font-size: 1.25rem;
          color: #64748b;
          margin: 0 0 40px 0;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .primary-button {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 18px 36px;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
          font-family: inherit;
        }

        .primary-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px rgba(102, 126, 234, 0.35);
        }

        .secondary-button {
          background: white;
          color: #667eea;
          border: 2px solid #e2e8f0;
          padding: 18px 36px;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: inherit;
        }

        .secondary-button:hover {
          border-color: #667eea;
          transform: translateY(-3px);
        }

        .hero-visual {
          max-width: 1100px;
          width: 100%;
          z-index: 1;
        }

        .video-container {
          position: relative;
        }

        .hero-video {
          width: 100%;
          height: auto;
          border-radius: 24px;
          box-shadow: 
            0 40px 80px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(0, 0, 0, 0.05);
          display: block;
        }

        .video-glow {
          position: absolute;
          inset: -40px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.15), transparent 70%);
          z-index: -1;
          blur: 40px;
        }

        /* Section Container */
        .section-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 120px 60px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .section-title {
          font-size: 3rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 16px 0;
          letter-spacing: -0.02em;
        }

        .section-description {
          font-size: 1.2rem;
          color: #64748b;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Explanation Section - Gradient 2 */
       .explanation {
  background: linear-gradient(180deg,
    #ffffff 0%,
    #eff3ff 30%,
    #f5f7ff 70%,
    #ffffff 100%
  );
}

        /* Advanced Cards */
        .advanced-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .advanced-card {
          position: relative;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          cursor: pointer;
          min-height: 180px;
        }

        .advanced-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, 
            rgba(102, 126, 234, 0.05), 
            rgba(118, 75, 162, 0.05)
          );
          opacity: 0;
          transition: opacity 0.4s;
        }

        .advanced-card:hover::before {
          opacity: 1;
        }

        .card-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, 
            rgba(102, 126, 234, 0.15), 
            transparent 70%
          );
          opacity: 0;
          transition: opacity 0.4s;
        }

        .advanced-card:hover .card-glow {
          opacity: 1;
        }

        .advanced-card:hover {
          transform: translateY(-8px);
          box-shadow: 
            0 24px 48px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(102, 126, 234, 0.1);
          border-color: rgba(102, 126, 234, 0.2);
        }

        .advanced-card.expanded {
          min-height: 420px;
        }

        .card-inner {
          position: relative;
          z-index: 1;
        }

        .card-icon-wrapper {
          width: 72px;
          height: 72px;
          margin: 0 auto 20px;
          background: linear-gradient(135deg, #f8faff, #ffffff);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04);
        }

        .card-icon-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .card-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin: 0 0 16px 0;
        }

        .card-expanded-content {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .advanced-card.expanded .card-expanded-content {
          max-height: 500px;
          opacity: 1;
          margin-top: 16px;
        }

        .card-subtitle {
          font-size: 1.1rem;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 12px;
        }

        .card-desc {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .card-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .card-features li {
          font-size: 0.9rem;
          color: #475569;
          padding: 8px 0;
          padding-left: 24px;
          position: relative;
          line-height: 1.5;
        }

        .card-features li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #667eea;
          font-weight: 700;
        }

        /* Features Section - Gradient 3 */
        .features {
  background: linear-gradient(180deg,
    #ffffff 0%,
    #fff0f5 30%,
    #fef5ff 70%,
    #ffffff 100%
  );
}

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
        }

        .feature-card-modern {
          background: white;
          padding: 40px;
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: all 0.3s;
          text-align: center;
        }

        .feature-card-modern:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.1);
        }

        .feature-img-wrapper {
          width: 100%;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #f8faff, #ffffff);
          border-radius: 16px;
        }

        .feature-img-wrapper img {
          max-width: 80%;
          max-height: 80%;
          object-fit: contain;
        }

        .feature-card-modern h3 {
          font-size: 1.4rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        .feature-card-modern p {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* How It Works - Gradient 4 */
        .how-it-works {
  background: linear-gradient(180deg,
    #ffffff 0%,
    #ecfdf5 30%,
    #f0fdff 70%,
    #ffffff 100%
  );
}


        .steps-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 32px;
        }

        .step-card {
          background: white;
          padding: 32px;
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: all 0.3s;
          text-align: center;
        }

        .step-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.1);
        }

        .step-number {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
        }

        .step-img-box {
          width: 100%;
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          background: linear-gradient(135deg, #f8faff, #ffffff);
          border-radius: 12px;
        }

        .step-img-box img {
          max-width: 80%;
          max-height: 80%;
          object-fit: contain;
        }

        .step-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 12px 0;
        }

        .step-card p {
          font-size: 0.95rem;
          color: #64748b;
          line-height: 1.6;
        }

        /* Community - Gradient 5 */
        .community {
  background: linear-gradient(180deg,
    #ffffff 0%,
    #fff7ed 30%,
    #fffbeb 70%,
    #ffffff 100%
  );
}

        .community-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .community-visual img {
          max-width: 600px;
          width: 100%;
          border-radius: 20px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.1);
        }

        .community-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .community-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          color: #0f172a;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s;
        }

        .community-btn:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
        }

        /* Footer */
        .footer {
          background: #0f172a;
          color: white;
          padding: 60px 60px 30px;
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto 40px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 60px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .footer-desc {
          color: #94a3b8;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .footer-cat {
          width: 70px;
          height: auto;
        }

        .footer-section h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 16px 0;
        }

        .footer-section a {
          display: block;
          color: #94a3b8;
          text-decoration: none;
          margin-bottom: 12px;
          transition: color 0.2s;
        }

        .footer-section a:hover {
          color: white;
        }

        .footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding-top: 30px;
          border-top: 1px solid #334155;
          text-align: center;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .footer-bottom p {
          margin: 8px 0;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-title {
            font-size: 3rem;
          }
          
          .section-container {
            padding: 80px 40px;
          }

          .footer-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .hero {
            padding: 120px 24px 60px;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .section-container {
            padding: 60px 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default Homepage;