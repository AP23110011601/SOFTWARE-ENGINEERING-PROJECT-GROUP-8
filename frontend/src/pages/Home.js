import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --g1: #0f4e2d;
    --g2: #166534;
    --g3: #15803d;
    --g4: #22c55e;
    --g5: #4ade80;
    --g6: #86efac;
    --cream: #f0fdf4;
    --cream2: #dcfce7;
    --gold: #22c55e;
    --gold2: #4ade80;
    --earth: #166534;
    --white: #ffffff;
    --dark: #064e3b;
    --text: #064e3b;
    --muted: #166534;
    --shadow: 0 24px 64px rgba(22,101,52,0.18);
    --shadow-sm: 0 6px 24px rgba(22,101,52,0.10);
    --radius: 16px;
    --radius-lg: 24px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text); overflow-x: hidden; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--cream2); }
  ::-webkit-scrollbar-thumb { background: var(--g3); border-radius: 3px; }

  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 999;
    background: rgba(250,247,240,0.94);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(45,122,80,0.12);
    height: 70px;
    display: flex; align-items: center;
    padding: 0 6%;
    justify-content: space-between;
    transition: box-shadow 0.3s;
  }
  .nav.scrolled { box-shadow: var(--shadow-sm); }
  .nav-logo {
    display: flex; align-items: center; gap: 10px; cursor: pointer;
    text-decoration: none;
  }
  .nav-logo-icon {
    width: 40px; height: 40px; background: linear-gradient(135deg, var(--g2), var(--g4));
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    font-size: 20px; box-shadow: 0 4px 14px rgba(45,122,80,0.35);
  }
  .nav-logo-text { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--g1); }
  .nav-logo-text span { color: var(--g3); }
  .nav-links { display: flex; align-items: center; gap: 8px; }
  .nav-link {
    padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500;
    color: var(--text); cursor: pointer; transition: all 0.2s; border: none; background: none;
    text-decoration: none;
  }
  .nav-link:hover { background: var(--g6); color: var(--g2); }
  
  .nav-btns { display: flex; align-items: center; gap: 10px; }
  .btn-outline {
    padding: 9px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
    border: 1.5px solid var(--g3); color: var(--g3); background: transparent;
    cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .btn-outline:hover { background: var(--g3); color: white; }
  
  .btn-solid {
    padding: 9px 20px; border-radius: 10px; font-size: 14px; font-weight: 600;
    border: none; color: white; background: linear-gradient(135deg, var(--g2), var(--g3));
    cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 14px rgba(45,122,80,0.3);
  }
  .btn-solid:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(45,122,80,0.4); }

  .hero {
    min-height: 100vh;
    background: linear-gradient(160deg, #dcfce7 0%, #bbf7d0 50%, #86efac 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 100px 6% 80px;
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute; inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2315803d' fill-opacity='0.04'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(21,128,61,0.15); border: 1px solid rgba(22,101,52,0.3);
    color: var(--g2); padding: 8px 18px; border-radius: 50px; font-size: 13px; font-weight: 600;
    margin-bottom: 32px; letter-spacing: 0.5px;
    animation: fadeDown 0.8s ease forwards;
  }
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(42px, 7vw, 84px);
    font-weight: 900; color: var(--g1); line-height: 1.05;
    margin-bottom: 24px;
    animation: fadeUp 0.8s ease 0.1s both;
  }
  .hero-title .accent { color: var(--g3); font-style: italic; }
  .hero-title .gold { color: var(--gold2); }
  .hero-subtitle {
    font-size: clamp(16px, 2vw, 20px); color: var(--g2);
    max-width: 600px; line-height: 1.7; margin-bottom: 48px;
    font-weight: 500;
    animation: fadeUp 0.8s ease 0.2s both;
  }
  .hero-btns {
    display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
    animation: fadeUp 0.8s ease 0.3s both;
  }
  
  .hero-btn-primary {
    padding: 16px 36px; border-radius: 14px; font-size: 16px; font-weight: 600;
    background: linear-gradient(135deg, var(--g3), var(--g4));
    color: white; border: none; cursor: pointer;
    box-shadow: 0 8px 32px rgba(21,128,61,0.4);
    transition: all 0.25s; font-family: 'DM Sans', sans-serif;
  }
  .hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(21,128,61,0.5); }
  
  .hero-btn-secondary {
    padding: 16px 36px; border-radius: 14px; font-size: 16px; font-weight: 600;
    background: rgba(21,128,61,0.1); color: var(--g2);
    border: 1.5px solid rgba(21,128,61,0.25); cursor: pointer;
    transition: all 0.25s; font-family: 'DM Sans', sans-serif;
    backdrop-filter: blur(10px);
  }
  .hero-btn-secondary:hover { background: rgba(21,128,61,0.18); }
  
  .hero-stats {
    display: flex; gap: 48px; margin-top: 72px; flex-wrap: wrap; justify-content: center;
    animation: fadeUp 0.8s ease 0.4s both;
  }
  .hero-stat { text-align: center; }
  .hero-stat-num { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: var(--g3); }
  .hero-stat-label { font-size: 13px; color: var(--g2); margin-top: 4px; letter-spacing: 0.5px; font-weight: 600; }

  .section { padding: 100px 6%; background: var(--cream); position: relative; z-index: 10; }
  .section-label {
    display: inline-flex; align-items: center; gap: 8px;
    color: var(--g3); font-size: 13px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; margin-bottom: 16px;
  }
  .section-label::before { content: ''; width: 24px; height: 2px; background: var(--g3); }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 4vw, 52px); font-weight: 700; color: var(--g1);
    line-height: 1.2; margin-bottom: 20px;
  }
  .section-title .accent { color: var(--g3); font-style: italic; }
  .section-sub { font-size: 17px; color: var(--muted); line-height: 1.7; max-width: 560px; }

  .features-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
    gap: 24px; margin-top: 60px;
  }
  .feature-card {
    background: white; border-radius: var(--radius-lg); padding: 36px 32px;
    border: 1px solid rgba(45,122,80,0.08);
    box-shadow: var(--shadow-sm);
    transition: all 0.3s; cursor: pointer; position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--g3), var(--g4));
    transform: scaleX(0); transform-origin: left; transition: transform 0.3s;
  }
  .feature-card:hover { transform: translateY(-6px); box-shadow: var(--shadow); }
  .feature-card:hover::before { transform: scaleX(1); }
  .feature-icon {
    width: 60px; height: 60px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; margin-bottom: 24px;
  }
  .feature-icon.blue { background: linear-gradient(135deg, #dcfce7, #bbf7d0); }
  .feature-icon.green { background: linear-gradient(135deg, #bbf7d0, #86efac); }
  .feature-icon.orange { background: linear-gradient(135deg, #86efac, #4ade80); }
  .feature-icon.purple { background: linear-gradient(135deg, #dcfce7, #86efac); }
  .feature-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: var(--g1); margin-bottom: 12px; }
  .feature-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

  .how-section { background: linear-gradient(135deg, #dcfce7, #bbf7d0); padding: 100px 6%; }
  .how-section .section-label { color: var(--g3); }
  .how-section .section-label::before { background: var(--g3); }
  .how-section .section-title { color: var(--g1); }
  .how-section .section-sub { color: var(--g2); }
  
  .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; margin-top: 60px; }
  .step-card { text-align: center; padding: 24px; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
  .step-num {
    width: 56px; height: 56px; border-radius: 50%;
    background: rgba(21,128,61,0.1); border: 1.5px solid rgba(21,128,61,0.2);
    color: var(--g3); font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
  }
  .step-title { color: var(--g1); font-size: 17px; font-weight: 700; margin-bottom: 10px; }
  .step-desc { color: var(--g2); font-size: 14px; line-height: 1.6; }

  .cta-section {
    background: linear-gradient(135deg, #4ade80, #22c55e);
    text-align: center; padding: 80px 6%;
  }
  .cta-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 4vw, 48px); font-weight: 700; color: white; margin-bottom: 16px; }
  .cta-sub { font-size: 17px; color: rgba(255,255,255,0.9); margin-bottom: 40px; }
  .cta-btn {
    padding: 18px 48px; border-radius: 14px; font-size: 17px; font-weight: 700;
    background: white; color: var(--g3); border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 8px 32px rgba(21,128,61,0.3); transition: all 0.25s;
  }
  .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(21,128,61,0.4); }

  .footer {
    background: var(--dark); padding: 60px 6% 32px;
  }
  .footer-top { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 40px; margin-bottom: 48px; }
  .footer-brand .nav-logo-text { color: white; font-size: 24px; }
  .footer-brand-desc { color: rgba(255,255,255,0.4); font-size: 14px; margin-top: 12px; max-width: 260px; line-height: 1.6; }
  .footer-col-title { color: white; font-size: 14px; font-weight: 600; margin-bottom: 16px; letter-spacing: 0.5px; }
  .footer-links { display: flex; flex-direction: column; gap: 10px; }
  .footer-link { color: rgba(255,255,255,0.4); font-size: 14px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
  .footer-link:hover { color: var(--g4); }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  .footer-copy { color: rgba(255,255,255,0.3); font-size: 13px; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
  
  @media (max-width: 900px) { .nav-links { display: none; } }
`;

function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`nav \${scrolled ? "scrolled" : ""}`}>
      <div className="nav-logo" onClick={() => navigate("/")}>
        <div className="nav-logo-icon">🌿</div>
        <div className="nav-logo-text">Agri<span>Smart</span></div>
      </div>
      <div className="nav-links">
        <span onClick={() => navigate("/login")} className="nav-link">Features</span>
        <span onClick={() => navigate("/login")} className="nav-link">How It Works</span>
        <span onClick={() => navigate("/login")} className="nav-link">About</span>
      </div>
      <div className="nav-btns">
        <button className="btn-outline" onClick={() => navigate("/login")}>Sign In</button>
        <button className="btn-solid" onClick={() => navigate("/login")}>Get Started</button>
      </div>
    </nav>
  );
}

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{css}</style>
      <Navbar />

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">⭐⭐⭐ IoT & AI Integration Engine</div>
        <h1 className="hero-title">
          Cultivate Success with <br/> <span className="accent">Smart Agriculture</span>
        </h1>
        <p className="hero-subtitle">
          Integrate physical ESP32 sensors with machine learning to absolutely automate your yields, calculate irrigation dynamically, and perfectly execute crop rotations mathematically.
        </p>
        <div className="hero-btns">
          <button className="hero-btn-primary" onClick={() => navigate("/login")}>Get Started</button>
          <button className="hero-btn-secondary" onClick={() => navigate("/login")}>View Demo</button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
             <div className="hero-stat-num">4x</div>
             <div className="hero-stat-label">MOISTURE ZONES</div>
          </div>
          <div className="hero-stat">
             <div className="hero-stat-num">98%</div>
             <div className="hero-stat-label">AI PREDICTIONS</div>
          </div>
          <div className="hero-stat">
             <div className="hero-stat-num">24/7</div>
             <div className="hero-stat-label">SYSTEM UPTIME</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section">
        <div className="section-label">Features</div>
        <h2 className="section-title">Built for <span className="accent">Absolute Precision</span></h2>
        <p className="section-sub">Experience fully scalable architectural monitoring combining robust IoT engineering with lightweight cloud execution pipelines.</p>
        
        <div className="features-grid">
          <div className="feature-card" onClick={() => navigate("/login")}>
            <div className="feature-icon green">🌱</div>
            <h3 className="feature-title">Smart Irrigation</h3>
            <p className="feature-desc">AI-driven irrigation recommendations based on real-time soil moisture and weather data from IoT sensors.</p>
          </div>
          <div className="feature-card" onClick={() => navigate("/login")}>
            <div className="feature-icon purple">🧠</div>
            <h3 className="feature-title">Crop Recommendation</h3>
            <p className="feature-desc">Enter N, P, K and soil parameters to get an AI-powered best crop prediction for your land.</p>
          </div>
          <div className="feature-card" onClick={() => navigate("/login")}>
            <div className="feature-icon blue">🔬</div>
            <h3 className="feature-title">Disease Detection</h3>
            <p className="feature-desc">Upload a leaf image and our TensorFlow model instantly identifies diseases and suggests cures.</p>
          </div>
          <div className="feature-card" onClick={() => navigate("/login")}>
            <div className="feature-icon orange">🔔</div>
            <h3 className="feature-title">Alerts System</h3>
            <p className="feature-desc">Get instant alerts for low moisture, high temperature, and tank level warnings with priority levels.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="workflow" className="how-section">
        <div className="section-label">Workflow</div>
        <h2 className="section-title">Your End-to-End <span className="accent">Lifecycle</span></h2>
        <p className="section-sub">Everything from physical root layers completely into cloud dashboards flawlessly integrated.</p>
        
        <div className="steps-grid">
           <div className="step-card" style={{cursor: "pointer"}} onClick={() => navigate("/login")}>
             <div className="step-num">1</div>
             <h4 className="step-title">Hardware Collection</h4>
             <p className="step-desc">Physical components like DHT11 fetch data locally natively passing through the Node.js API pipeline.</p>
           </div>
           <div className="step-card" style={{cursor: "pointer"}} onClick={() => navigate("/login")}>
             <div className="step-num">2</div>
             <h4 className="step-title">Node Integration</h4>
             <p className="step-desc">The secure Express application writes events immutably to your MongoDB Atlas arrays securely.</p>
           </div>
           <div className="step-card" style={{cursor: "pointer"}} onClick={() => navigate("/login")}>
             <div className="step-num">3</div>
             <h4 className="step-title">Python Models</h4>
             <p className="step-desc">Custom trained '.pkl' pipelines load securely inside our dedicated native Flask environment instance.</p>
           </div>
           <div className="step-card" style={{cursor: "pointer"}} onClick={() => navigate("/login")}>
             <div className="step-num">4</div>
             <h4 className="step-title">Dynamic Dashboards</h4>
             <p className="step-desc">Users see a beautifully constructed React view indicating calculated inputs directly to them natively.</p>
           </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">Upgrade To Next-Gen Farming.</h2>
        <p className="cta-sub">No overcomplicated setups, extremely powerful deep integration, visually stunning outputs.</p>
        <button className="cta-btn" onClick={() => navigate("/login")}>System Link Init</button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
           <div className="footer-brand">
             <div className="nav-logo-text">Agri<span style={{color: "var(--g4)"}}>Smart</span></div>
             <p className="footer-brand-desc">Data-driven support engineering powered entirely by custom Machine Learning endpoints natively.</p>
           </div>
           <div className="footer-links">
             <span className="footer-col-title">Documentation</span>
             <span className="footer-link" onClick={() => navigate("/login")}>ML Features</span>
             <span className="footer-link" onClick={() => navigate("/login")}>REST Architecture</span>
             <span className="footer-link" onClick={() => navigate("/login")}>ESP32 Manual</span>
           </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Smart Agriculture Decision Engine. Final Viva Ready.</span>
        </div>
      </footer>
    </>
  );
};

export default Home;