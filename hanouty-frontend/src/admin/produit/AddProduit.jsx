import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Package, Check, Sparkles, Loader2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { produitServices } from "../../services/produitServices";
import { marqueServices } from "../../services/marqueServices";
import { authServices } from "../../services/authServices";
import { categorieServices } from "../../services/categorieServices";

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; 
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    
    // Palette Glace & Océan
    const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#0EA5E9", "#38BDF8"];
    
    const pts = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.38, dy: (Math.random() - 0.5) * 0.38,
      color: COLORS[Math.floor(Math.random() * COLORS.length)], a: Math.random() * 0.55 + 0.2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x = (p.x + p.dx + canvas.width) % canvas.width; p.y = (p.y + p.dy + canvas.height) % canvas.height;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.globalAlpha = p.a; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 88) {
            ctx.beginPath(); ctx.strokeStyle = "#3B82F6"; ctx.globalAlpha = (1 - d / 88) * 0.15;
            ctx.lineWidth = 0.6; ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1; animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0, opacity: "var(--particle-op)", transition: "opacity 0.5s ease" }} />;
}

export default function AddProduit() {
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [poidsValeur, setPoidsValeur] = useState("");
  const [poidsUnite, setPoidsUnite] = useState("kg");
  const [marqueId, setMarqueId] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [marques, setMarques] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        const userRes = await authServices.getUserConnecte();
        setCurrentUserId(userRes.data.id);
        const [marquesRes, catRes] = await Promise.all([
          marqueServices.getAllMarques(),
          categorieServices.getAllCategories()
        ]);
        setMarques(marquesRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données initiales.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom.trim() || !prix || !marqueId || !categorieId) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setError("");
    setLoading(true);
    const payload = {
      nom: nom,
      prix: parseFloat(prix),
      poids_valeur: poidsValeur ? parseFloat(poidsValeur) : null,
      poids_unite: poidsUnite,
      user_id: currentUserId,
      marque_id: marqueId,
      categorie_id: categorieId
    };
    try {
      await produitServices.addProduit(payload);
      setSuccess(true);
      setTimeout(() => navigate("/admin/produits"), 1500);
    } catch (err) {
      const message = err.response?.data?.detail || "Erreur lors de l'ajout du produit.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div title="Nouveau Produit">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        
        @property --angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
        }
        @keyframes rotate-wire { to { --angle: 360deg; } }

        /* ════ VARIABLES THEME CLAIR (OCÉAN) ════ */
        .theme-container {
          --bg-main: #F8FAFC;
          --bg-pattern: rgba(59,130,246,0.06);
          --bg-glass: rgba(255, 255, 255, 0.85); 
          --text-main: #0F172A;
          --text-sub: #64748B;
          --border: rgba(59,130,246,0.15);
          
          --icon-bg: #EFF6FF;
          --icon-border: #BFDBFE;
          --icon-color: #3B82F6;
          --icon-glow: rgba(59,130,246,0.15);

          --input-bg: #FFFFFF;
          --input-border: rgba(59,130,246,0.2);
          --input-focus: #3B82F6;
          --shadow-card: 0 10px 40px rgba(59,130,246,0.08);
          --particle-op: 0.25;
          --glow-op: 0;
          
          --wire-glow-color: rgba(59,130,246,0.4);

          --btn-cancel-bg: transparent;
          --btn-cancel-text: #475569;
          --btn-cancel-border: #CBD5E1;
          --btn-cancel-hover: rgba(59,130,246,0.05);

          --btn-submit-bg: transparent;
          --btn-submit-border: #3B82F6;
          --btn-submit-text: #3B82F6;
          --btn-submit-hover-bg: #3B82F6;
          --btn-submit-hover-text: #ffffff;
        }

        /* ════ VARIABLES THEME SOMBRE (NUIT BLEUTÉE) ════ */
        html.dark .theme-container {
          --bg-main: #0B1120;
          --bg-pattern: rgba(59,130,246,0.04);
          --bg-glass: rgba(15, 23, 42, 0.65); 
          --text-main: #F8FAFC;
          --text-sub: rgba(255,255,255,0.6);
          --border: rgba(59,130,246,0.2);
          
          --icon-bg: rgba(59,130,246,0.15);
          --icon-border: rgba(59,130,246,0.3);
          --icon-color: #60A5FA;
          --icon-glow: rgba(59,130,246,0.25);

          --input-bg: rgba(255,255,255,0.03);
          --input-border: rgba(59,130,246,0.2);
          --input-focus: #3B82F6;
          --shadow-card: 0 15px 50px rgba(0,0,0,0.5);
          --particle-op: 1;
          --glow-op: 1;
          
          --wire-glow-color: rgba(96,165,250,0.6);

          --btn-cancel-bg: transparent;
          --btn-cancel-text: rgba(255,255,255,0.7);
          --btn-cancel-border: rgba(255,255,255,0.2);
          --btn-cancel-hover: rgba(59,130,246,0.1);

          --btn-submit-bg: transparent;
          --btn-submit-border: #60A5FA;
          --btn-submit-text: #60A5FA;
          --btn-submit-hover-bg: #60A5FA;
          --btn-submit-hover-text: #ffffff;
        }

        .theme-container {
          position: relative; background: var(--bg-main); min-height: calc(100vh - 40px); border-radius: 20px;
          overflow: hidden; padding: 40px 20px; border: 1px solid var(--border); font-family: 'DM Sans', sans-serif; box-sizing: border-box;
          transition: background 0.4s ease, border-color 0.4s ease;
        }

        .theme-container::before {
          content: ''; position: absolute; inset: 0; z-index: 0;
          background-image: radial-gradient(var(--bg-pattern) 1px, transparent 1px);
          background-size: 24px 24px; transition: background-image 0.4s ease;
        }

        .deco-glow {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%);
          top: 40%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; z-index: 0;
          opacity: var(--glow-op); transition: opacity 0.5s ease;
        }

        .form-page { display: flex; justify-content: center; align-items: center; position: relative; z-index: 10; min-height: 100%; width: 100%; flex-direction: column;}
        
        .form-back-container { width: 100%; max-width: 600px; margin-bottom: 20px;}
        .form-back { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--text-sub); text-decoration: none; transition: color 0.2s; }
        .form-back:hover { color: #3B82F6; }

        .glass-card { 
          width: 100%; max-width: 600px;
          background: var(--bg-glass); border-radius: 24px; border: 1px solid var(--border); box-shadow: var(--shadow-card); 
          transition: background 0.4s, border 0.4s; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); 
          padding: 40px 32px; display: flex; flex-direction: column; align-items: center; position: relative; 
        }

        .glass-card::after {
          content: ''; position: absolute; inset: -2px; border-radius: 26px; padding: 2px; 
          background: conic-gradient(
            from var(--angle), transparent 50%, rgba(59,130,246,0.1) 70%, #2563EB 90%, #60A5FA 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: rotate-wire 2.5s linear infinite; pointer-events: none; 
          filter: drop-shadow(0 0 8px var(--wire-glow-color)); z-index: 1;
        }

        .form-header-icon, .form-header-title, .form-body { position: relative; z-index: 10; width: 100%; }
        
        .form-header-icon {
          width: 64px; height: 64px; border-radius: 50%; background: var(--icon-bg); border: 2px solid var(--icon-border);
          display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 0 24px var(--icon-glow);
          color: var(--icon-color); transition: all 0.3s;
        }
        
        .form-header-title { font-size: 24px; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; margin-bottom: 32px; text-align: center;}

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .field-group { margin-bottom: 20px; width: 100%; }
        
        .field-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-sub); margin-bottom: 10px; }
        .field-required { color: #E11D48; }

        .field-input, .field-select {
          width: 100%; padding: 14px 18px; background: var(--input-bg); border: 1px solid var(--input-border);
          border-radius: 12px; font-size: 15px; color: var(--text-main); outline: none; transition: all 0.2s ease; font-family: 'DM Sans', sans-serif;
        }
        .field-select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23888' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 1rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em;
        }
        .field-input:focus, .field-select:focus { border-color: var(--input-focus); box-shadow: 0 0 0 4px rgba(59,130,246,0.15); }
        .field-input.has-error, .field-select.has-error { border-color: #E11D48; background: rgba(225,29,72,0.05); }

        .field-select option {
            background-color: var(--bg-main); 
            color: var(--text-main);
        }

        .form-actions { display: flex; gap: 12px; margin-top: 12px; width: 100%;}
        
        .btn-cancel { 
          flex: 0 0 auto; padding: 14px 24px; border-radius: 12px; border: 1px solid var(--btn-cancel-border); background: var(--btn-cancel-bg); 
          font-size: 14px; font-weight: 600; color: var(--btn-cancel-text); cursor: pointer; text-decoration: none; display: flex; align-items: center; transition: all 0.2s; 
        }
        .btn-cancel:hover { background: var(--input-bg); border-color: var(--border); color: var(--text-main); }

        .btn-submit { 
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 24px; border-radius: 12px; 
          font-size: 14px; font-weight: 700; cursor: pointer; position: relative; transition: all 0.2s ease; 
        }
        .btn-submit.default { background: var(--btn-submit-bg); border: 1px solid var(--btn-submit-border); color: var(--btn-submit-text); }
        .btn-submit.default:hover:not(:disabled) { background: var(--btn-submit-hover-bg); color: var(--btn-submit-hover-text); transform: translateY(-2px); box-shadow: 0 6px 20px var(--icon-glow); }
        .btn-submit.success-state { background: linear-gradient(135deg, #10B981, #059669); border: none; color: white; box-shadow: 0 4px 15px rgba(16,185,129,0.3); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid var(--icon-bg); border-top-color: var(--icon-color); animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="theme-container">
        <ParticleCanvas />
        <div className="deco-glow" />

        <div className="form-page">
          <div className="form-back-container">
            <Link to="/admin/produits" className="form-back"><ArrowLeft size={16} /> Retour aux produits</Link>
          </div>

          <div className="glass-card">
            <div className="form-header-icon"><Package size={26} /></div>
            <div className="form-header-title">Nouveau Produit</div>
            
            <div className="form-body">
              {initialLoading ? (
                 <div style={{display:'flex', justifyContent:'center', padding:'20px'}}>
                    <Loader2 size={24} className="animate-spin" color="var(--icon-color)" />
                 </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  
                  <div className="field-group">
                    <label className="field-label">Nom du produit <span className="field-required">*</span></label>
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className={`field-input${error && !nom ? " has-error" : ""}`}
                      autoFocus
                    />
                  </div>

                  <div className="form-row">
                    <div className="field-group">
                      <label className="field-label">Marque <span className="field-required">*</span></label>
                      <select
                        value={marqueId}
                        onChange={(e) => setMarqueId(e.target.value)}
                        className={`field-select${error && !marqueId ? " has-error" : ""}`}
                      >
                        <option value="">Sélectionner...</option>
                        {marques.map((m) => (
                          <option key={m.id} value={m.id}>{m.nom}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group">
                      <label className="field-label">Catégorie <span className="field-required">*</span></label>
                      <select
                        value={categorieId}
                        onChange={(e) => setCategorieId(e.target.value)}
                        className={`field-select${error && !categorieId ? " has-error" : ""}`}
                      >
                        <option value="">Sélectionner...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field-group">
                      <label className="field-label">Prix (DH) <span className="field-required">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        value={prix}
                        onChange={(e) => setPrix(e.target.value)}
                        className={`field-input${error && !prix ? " has-error" : ""}`}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="field-group">
                      <label className="field-label">Poids</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={poidsValeur}
                          onChange={(e) => setPoidsValeur(e.target.value)}
                          className="field-input"
                          placeholder="Valeur"
                          style={{ flex: 2 }}
                        />
                        <select
                          value={poidsUnite}
                          onChange={(e) => setPoidsUnite(e.target.value)}
                          className="field-select"
                          style={{ flex: 1 }}
                        >
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="lb">lb</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="field-error" style={{ marginBottom: '10px', justifyContent: 'center', background: 'rgba(225,29,72,0.05)', padding: '10px', borderRadius: '8px', color: '#E11D48', display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', fontWeight:600 }}>
                      <span>⚠</span> {error}
                    </div>
                  )}

                  <div className="form-actions">
                    <Link to="/admin/produits" className="btn-cancel">Annuler</Link>
                    <button type="submit" disabled={loading || success} className={`btn-submit ${success ? "success-state" : "default"}`}>
                      {success ? <><Check size={17} /> Ajouté !</> : loading ? <div className="spinner" /> : <><Sparkles size={16} /> Créer le produit</>}
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}