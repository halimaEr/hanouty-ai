import { useState, useEffect, useRef } from "react";
import { authServices } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, AlertCircle, Loader2, LogIn, UserPlus } from "lucide-react";

// Canvas des particules (Bleu Océan)
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    
    // Palette Bleue pour bien ressortir sur le blanc
    const COLORS = ["#3B82F6", "#2563EB", "#60A5FA", "#0EA5E9"];
    
    // Plus de particules, plus opaques
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1, // Taille augmentée
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: Math.random() * 0.7 + 0.3, // Opacité forte (30% à 100%)
    }));
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dessin des points
      pts.forEach((p) => {
        p.x = (p.x + p.dx + canvas.width) % canvas.width;
        p.y = (p.y + p.dy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.a;
        ctx.fill();
      });
      
      // Dessin des chaînes de connexion
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 100) { // Distance de connexion
            ctx.beginPath();
            ctx.strokeStyle = "#3B82F6"; 
            ctx.globalAlpha = (1 - d / 100) * 0.4; // Lignes bien visibles
            ctx.lineWidth = 0.8;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1, // S'assure que c'est au fond
      }}
    />
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ nom: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [showPendingMessage, setShowPendingMessage] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    authServices
      .login({ email: form.email, password: form.password })
      .then((res) => {
        const token = res.data.access_token;
        authServices.saveToken(token);
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.role;
        if (role === "admin") navigate("/admin/dash");
        else if (role === "user") navigate("/user/dash");
      })
      .catch(() => setError("Email ou mot de passe incorrect."))
      .finally(() => setLoading(false));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    authServices
      .registrerUser({ nom: form.nom, email: form.email, password: form.password })
      .then(() => setShowPendingMessage(true))
      .catch((err) =>
        setError(err.response?.data?.detail || "Erreur lors de l'inscription.")
      )
      .finally(() => setLoading(false));
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setForm({ nom: "", email: "", password: "" });
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after {
          box-sizing: border-box; margin: 0; padding: 0;
          font-family: 'DM Sans', sans-serif;
        }
        
        .auth-page {
          min-height: 100vh;
          display: flex;
          background: #FFFFFF; /* FOND BLANC GLOBAL POUR LE CÔTÉ DROIT */
          overflow: hidden;
          position: relative;
        }

        /* ════ SLIDING OVERLAY PANEL (SOMBRE & BLEU) ════ */
        .overlay-container {
          position: absolute;
          top: 0; left: 0; width: 50%; height: 100%;
          overflow: hidden; z-index: 100; /* Passe au-dessus du formulaire */
          transition: transform 0.7s cubic-bezier(0.77, 0, 0.175, 1);
          box-shadow: 10px 0 30px rgba(0,0,0,0.15);
        }
        .auth-page.register-mode .overlay-container {
          transform: translateX(100%);
          box-shadow: -10px 0 30px rgba(0,0,0,0.15);
        }
        
        /* Ce panel a son fond sombre OPAQUE pour cacher le formulaire en dessous */
        .overlay-panel {
          position: absolute; inset: 0;
          background: linear-gradient(145deg, #0B1120 0%, #172554 55%, #0F172A 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 60px 48px; overflow: hidden;
        }
        
        .overlay-panel::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px);
          background-size: 52px 52px; z-index: 0;
        }
        
        .deco-glow {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; z-index: 0;
        }

        /* ════ LOGO & TEXTES (OVERLAY SOMBRE) ════ */
        .left-logo {
          width: 72px; height: 72px; border-radius: 20px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(96,165,250,0.3);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px; position: relative; z-index: 10;
          box-shadow: 0 0 30px rgba(59,130,246,0.2);
        }
        .logo-letter {
          font-size: 36px; font-weight: 900;
          background: linear-gradient(135deg, #60A5FA, #3B82F6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; letter-spacing: -1px;
        }
        .left-title {
          font-size: 38px; font-weight: 800; color: #FFFFFF;
          letter-spacing: -1.5px; margin-bottom: 12px; text-align: center;
          line-height: 1.15; position: relative; z-index: 10;
        }
        .left-title span {
          background: linear-gradient(90deg, #60A5FA, #3B82F6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .left-sub {
          font-size: 15px; color: rgba(255,255,255,0.6);
          text-align: center; line-height: 1.7; max-width: 290px; position: relative; z-index: 10;
        }
        .left-dots {
          display: flex; gap: 8px; margin-top: 52px; position: relative; z-index: 10;
        }
        .dot-item {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.2); transition: all 0.4s ease;
        }
        .dot-item.active {
          background: linear-gradient(90deg, #60A5FA, #3B82F6);
          width: 26px; border-radius: 4px; box-shadow: 0 0 10px rgba(59,130,246,0.5);
        }

        /* ════ FORMS CONTAINER (FOND TRANSPARENT POUR VOIR LE BLANC ET LES PARTICULES) ════ */
        .forms-container { position: absolute; inset: 0; display: flex; z-index: 10; }
        
        .form-side {
          width: 50%; min-width: 380px; flex-shrink: 0; display: flex; flex-direction: column;
          align-items: center; justify-content: center; padding: 48px 40px;
          background: transparent; /* TRANSPARENT = Laisse voir le fond blanc et le canvas global */
          transition: transform 0.7s cubic-bezier(0.77, 0, 0.175, 1);
        }
        .form-side-login { margin-left: 50%; }
        .form-side-register {
          margin-left: 0; position: absolute; right: 0; top: 0; bottom: 0; width: 50%;
          transform: translateX(100%);
        }
        .auth-page.register-mode .form-side-login { transform: translateX(-200%); }
        .auth-page.register-mode .form-side-register { right: auto; left: 0; transform: translateX(0); }

        @media (max-width: 768px) {
          .overlay-container { display: none; }
          .form-side { width: 100%; margin-left: 0 !important; position: static !important; transform: none !important; }
          .form-side-register { display: none; }
          .auth-page.register-mode .form-side-login { display: none; transform: none; }
          .auth-page.register-mode .form-side-register { display: flex; position: static; transform: none; }
        }

        /* ════ TEXTES DES FORMULAIRES (MODE CLAIR/BLANC) ════ */
        .form-wrap { width: 100%; max-width: 360px; position: relative; z-index: 20; }
        
        /* Ajout d'un léger fond blanc flouté derrière le texte pour garantir la lisibilité sur les particules */
        .form-wrap::before {
          content: ''; position: absolute; inset: -30px;
          background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          border-radius: 24px; z-index: -1; pointer-events: none;
        }

        .form-eye {
          font-size: 11px; letter-spacing: 3px; font-weight: 800;
          background: linear-gradient(90deg, #3B82F6, #2563EB);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 12px; display: block;
        }
        .form-title {
          font-size: 32px; font-weight: 800; color: #0F172A; /* Sombre sur fond blanc */
          letter-spacing: -0.8px; margin-bottom: 8px;
        }
        .form-sub { font-size: 14px; color: #64748B; margin-bottom: 32px; font-weight: 500; }

        /* ════ INPUTS (FOND BLANC SUR FOND BLANC) ════ */
        .input-group { margin-bottom: 16px; }
        .input-label {
          display: block; font-size: 13px; font-weight: 700;
          color: #475569; margin-bottom: 8px; letter-spacing: 0.3px;
        }
        .input-wrap {
          display: flex; align-items: center; gap: 12px;
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px; padding: 14px 16px;
          transition: all 0.2s ease;
        }
        .input-wrap:focus-within {
          border-color: #3B82F6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.15);
        }
        .input-wrap input {
          border: none; outline: none; background: transparent;
          font-size: 14px; color: #0F172A; flex: 1; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
        }
        .input-wrap input::placeholder { color: #94A3B8; font-weight: 400; }
        
        .input-wrap input:-webkit-autofill,
        .input-wrap input:-webkit-autofill:hover, 
        .input-wrap input:-webkit-autofill:focus, 
        .input-wrap input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #FFFFFF inset !important;
          -webkit-text-fill-color: #0F172A !important;
          caret-color: #0F172A !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* ════ ALERTS ════ */
        .alert {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 14px; border-radius: 12px;
          font-size: 13.5px; font-weight: 600; margin-bottom: 20px; line-height: 1.4;
        }
        .alert-error  { background: #FEF2F2; color: #E11D48; border: 1px solid #FECDD3; }
        .alert-success { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }

        /* ════ BOUTON SUBMIT (BLEU VIBRANT) ════ */
        .btn-submit {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%);
          color: #FFFFFF; font-size: 15px; font-weight: 700;
          border: none; border-radius: 12px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.25s ease; margin-top: 12px; letter-spacing: 0.3px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 15px rgba(59,130,246,0.3);
        }
        .btn-submit::after {
          content: ''; position: absolute;
          top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.5s ease;
        }
        .btn-submit:hover:not(:disabled)::after { left: 150%; }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59,130,246,0.4);
        }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ════ DIVIDER & SWITCH ════ */
        .divider {
          display: flex; align-items: center; gap: 16px;
          margin: 28px 0; color: #94A3B8; font-size: 13px; font-weight: 600;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1.5px; background: #E2E8F0;
        }
        
        .switch-text { text-align: center; font-size: 14px; color: #64748B; font-weight: 500;}
        .switch-link {
          color: #3B82F6; font-weight: 800; cursor: pointer; transition: color 0.2s;
        }
        .switch-link:hover { color: #2563EB; text-decoration: underline; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .form-wrap { animation: fadeUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        /* ════ ANIMATIONS SLIDE-IN SUCCES ════ */
        .form-inner-container { position: relative; width: 100%; }
        .register-form-content { transition: opacity 0.4s ease, transform 0.4s ease; }
        .register-form-content.hidden { opacity: 0; transform: scale(0.95); pointer-events: none; }
        
        .success-slide-in {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; background: #FFFFFF; z-index: 10;
          transform: translateY(40px); opacity: 0; pointer-events: none;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .success-slide-in.visible { transform: translateY(0); opacity: 1; pointer-events: auto; }
        
        .success-icon-wrap {
          width: 72px; height: 72px; border-radius: 50%;
          background: #EFF6FF; border: 2px solid #BFDBFE;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px; color: #3B82F6;
          box-shadow: 0 0 30px rgba(59,130,246,0.15);
        }
        .success-slide-in h3 { font-size: 24px; font-weight: 800; color: #0F172A; margin-bottom: 12px; }
        .success-slide-in p { font-size: 15px; color: #64748B; line-height: 1.6; margin-bottom: 32px; font-weight: 500;}
      `}</style>

      <div className={`auth-page${!isLogin ? " register-mode" : ""}`}>
        
        {/* LE CANVAS GLOBAL QUI COUVRE TOUT LE FOND BLANC */}
        <ParticleCanvas />

        {/* SLIDING OVERLAY (Le panneau sombre qui cache la moitié du canvas) */}
        <div className="overlay-container">
          <div className="overlay-panel">
            
            {/* Un DEUXIÈME Canvas exclusivement pour la zone sombre */}
            <ParticleCanvas />
            
            <div className="deco-glow" />
            <div className="left-logo">
              <span className="logo-letter">H</span>
            </div>
            <div className="left-title">
              Hanouty<span>.AI</span>
            </div>
            <div className="left-sub">
              Système de détection IA pour points de vente alimentaires
            </div>
            <div className="left-dots">
              <div className={`dot-item ${isLogin ? "active" : ""}`} />
              <div className={`dot-item ${!isLogin ? "active" : ""}`} />
              <div className="dot-item" />
            </div>
          </div>
        </div>

        {/* FORMS CONTAINER (La zone Transparente sur le Blanc) */}
        <div className="forms-container">
          
          {/* ════ LOGIN ════ */}
          <div className="form-side form-side-login">
            <div className="form-wrap">
              <span className="form-eye">ACCÈS SÉCURISÉ</span>
              <div className="form-title">Connexion</div>
              <div className="form-sub">Entrez vos identifiants pour accéder à votre espace.</div>
              {error && isLogin && (
                <div className="alert alert-error">
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  {error}
                </div>
              )}
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label className="input-label">Adresse email</label>
                  <div className="input-wrap">
                    <Mail size={16} color="#94A3B8" />
                    <input
                      name="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Mot de passe</label>
                  <div className="input-wrap">
                    <Lock size={16} color="#94A3B8" />
                    <input
                      name="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                    ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Chargement...</>
                    : <><LogIn size={18} /> Se connecter</>
                  }
                </button>
              </form>
              <div className="divider">ou</div>
              <div className="switch-text">
                Pas encore de compte ?{" "}
                <span className="switch-link" onClick={switchMode}>S'inscrire</span>
              </div>
            </div>
          </div>

          {/* ════ REGISTER ════ */}
          <div className="form-side form-side-register">
            <div className="form-wrap">
              <div className="form-inner-container">
                
                {/* SUCCESS MESSAGE */}
                <div className={`success-slide-in ${showPendingMessage ? 'visible' : ''}`}>
                  <div className="success-icon-wrap">
                    <UserPlus size={32} />
                  </div>
                  <h3>Demande envoyée !</h3>
                  <p>Votre compte est en attente de validation par un administrateur.</p>
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={() => { switchMode(); setTimeout(() => setShowPendingMessage(false), 400); }}
                  >
                    Retour à la connexion
                  </button>
                </div>

                {/* REGISTER FORM */}
                <div className={`register-form-content ${showPendingMessage ? 'hidden' : ''}`}>
                  <span className="form-eye">ACCÈS SÉCURISÉ</span>
                  <div className="form-title">Créer un compte</div>
                  <div className="form-sub">Remplissez le formulaire pour demander un accès.</div>
                  
                  {error && !isLogin && (
                    <div className="alert alert-error">
                      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="alert alert-success">
                      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                      {success}
                    </div>
                  )}
                  
                  <form onSubmit={handleRegister}>
                    <div className="input-group">
                      <label className="input-label">Nom complet</label>
                      <div className="input-wrap">
                        <User size={16} color="#94A3B8" />
                        <input
                          name="nom"
                          placeholder="Votre nom"
                          value={form.nom}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Adresse email</label>
                      <div className="input-wrap">
                        <Mail size={16} color="#94A3B8" />
                        <input
                          name="email"
                          type="email"
                          placeholder="exemple@email.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Mot de passe</label>
                      <div className="input-wrap">
                        <Lock size={16} color="#94A3B8" />
                        <input
                          name="password"
                          type="password"
                          placeholder="••••••••••••"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading
                        ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Chargement...</>
                        : <><UserPlus size={18} /> S'inscrire</>
                      }
                    </button>
                  </form>
                  <div className="divider">ou</div>
                  <div className="switch-text">
                    Déjà un compte ?{" "}
                    <span className="switch-link" onClick={switchMode}>Se connecter</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}