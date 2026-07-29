import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Layers, Loader2, Search, AlertTriangle, Tag } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { categorieServices } from "../../services/categorieServices";

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    
    const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#0EA5E9", "#38BDF8"];
    
    const pts = Array.from({ length: 50 }, () => ({
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
            ctx.beginPath(); ctx.strokeStyle = "#3B82F6"; ctx.globalAlpha = (1 - d / 88) * 0.13;
            ctx.lineWidth = 0.5; ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
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

export default function ListCategorie() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = () => {
    setLoading(true);
    setError(null);
    categorieServices
      .getAllCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setError("Impossible de charger les catégories."))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    categorieServices
      .supprimerCategorie(id)
      .then(() => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setDeleteId(null);
        setDeleteName("");
      })
      .catch(() => alert("Erreur lors de la suppression. Vérifiez si la catégorie est utilisée."));
  };

  const filtered = categories.filter((c) =>
    c.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div title="Catégories">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        
        @property --angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
        }
        @keyframes rotate-wire {
            to { --angle: 360deg; }
        }

        /* ════ VARIABLES THEME CLAIR (OCÉAN & LUXE) ════ */
        .theme-container {
          --bg-main: #F8FAFC;
          --bg-pattern: rgba(59,130,246,0.06);
          --bg-card: #FFFFFF;
          --text-main: #0F172A;
          --text-sub: #64748B;
          --border: #E2E8F0;
          --search-bg: #FFFFFF;
          --search-border: #E2E8F0;
          --shadow-card: 0 4px 15px rgba(0,0,0,0.03);
          
          --wire-glow-color: rgba(59,130,246,0.4);
          --particle-op: 0.25;
          --glow-op: 0;
          
          /* Modal Effet Glace */
          --modal-overlay: rgba(15, 23, 42, 0.4);
          --modal-bg: rgba(255, 255, 255, 0.65); 
          --modal-shadow: 0 24px 60px rgba(0,0,0,0.15);
          
          --btn-edit-txt: #64748B; --btn-edit-border: #E2E8F0;
          --btn-del-txt: #64748B;  --btn-del-border: #E2E8F0;
          
          --icon-premium-bg: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
          --icon-premium-color: #3B82F6;
        }

        /* ════ VARIABLES THEME SOMBRE (NUIT BLEUTÉE) ════ */
        html.dark .theme-container {
          --bg-main: #0B1120;
          --bg-pattern: rgba(59,130,246,0.04);
          --bg-card: #0F172A;
          --text-main: #F8FAFC;
          --text-sub: rgba(255, 255, 255, 0.5);
          --border: rgba(59,130,246,0.2);
          --search-bg: rgba(255, 255, 255, 0.03);
          --search-border: rgba(59,130,246,0.2);
          --shadow-card: 0 4px 20px rgba(0,0,0,0.2);
          
          --wire-glow-color: rgba(96,165,250,0.6);
          --particle-op: 1;
          --glow-op: 1;
          
          /* Modal Effet Glace sombre */
          --modal-overlay: rgba(10, 8, 15, 0.8);
          --modal-bg: rgba(15, 23, 42, 0.65); 
          --modal-shadow: 0 15px 50px rgba(0,0,0,0.6);
          
          --btn-edit-txt: rgba(255,255,255,0.5); --btn-edit-border: rgba(59,130,246,0.2);
          --btn-del-txt: rgba(255,255,255,0.5);  --btn-del-border: rgba(59,130,246,0.2);
          
          --icon-premium-bg: linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0.15) 100%);
          --icon-premium-color: #60A5FA;
        }

        .theme-container {
          position: relative; background: var(--bg-main); min-height: calc(100vh - 40px); border-radius: 20px;
          overflow: hidden; padding: 40px; border: 1px solid var(--border); font-family: 'DM Sans', sans-serif; box-sizing: border-box;
          transition: background 0.4s ease, border-color 0.4s ease;
        }

        .theme-container::before {
          content: ''; position: absolute; inset: 0; z-index: 0;
          background-image: radial-gradient(var(--bg-pattern) 1px, transparent 1px);
          background-size: 24px 24px; transition: background-image 0.4s ease;
        }
        
        .deco-glow {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
          top: -100px; right: -100px; pointer-events: none; z-index: 0; opacity: var(--glow-op); transition: opacity 0.5s ease;
        }

        .content-layer { position: relative; z-index: 10; }

        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .page-title { font-size: 26px; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; transition: color 0.4s; }
        .page-sub   { font-size: 14px; color: var(--text-sub); margin-top: 4px; transition: color 0.4s; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%);
          color: #fff; font-size: 14px; font-weight: 700; padding: 12px 22px; border-radius: 12px; border: none; cursor: pointer; text-decoration: none;
          box-shadow: 0 4px 20px rgba(59,130,246,0.3); transition: all 0.2s ease;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(59,130,246,0.4); filter: brightness(1.1); }

        .search-bar {
          display: flex; align-items: center; gap: 12px;
          background: var(--search-bg); border: 1px solid var(--search-border); border-radius: 14px; padding: 12px 18px; margin-bottom: 32px; max-width: 400px; 
          transition: all 0.3s; box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .search-bar:focus-within { border-color: #3B82F6; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        .search-bar input { border: none; outline: none; font-size: 14px; color: var(--text-main); background: transparent; flex: 1; font-family: 'DM Sans', sans-serif; }
        .search-bar input::placeholder { color: var(--text-sub); opacity: 0.7; }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }

        /* ════ LA CARTE CATÉGORIE (LUXE) ════ */
        .cat-card {
          background: var(--bg-card); border-radius: 20px; 
          border: 1px solid var(--border); padding: 32px 24px 24px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; 
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease; position: relative;
          box-shadow: var(--shadow-card);
        }
        
        .cat-card:hover { 
          transform: translateY(-6px); 
          box-shadow: 0 15px 35px rgba(59,130,246,0.1); 
          border-color: transparent; 
        }

        /* LE FIL BLEU NÉON AU SURVOL */
        .cat-card::after {
          content: ''; position: absolute; inset: -2px; border-radius: 22px; padding: 2px; 
          background: conic-gradient(
            from var(--angle), transparent 50%, rgba(59,130,246,0.1) 70%, #2563EB 90%, #60A5FA 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.4s ease;
          animation: rotate-wire 2.5s linear infinite; pointer-events: none; 
          filter: drop-shadow(0 0 8px var(--wire-glow-color)); z-index: 1;
        }
        .cat-card:hover::after { opacity: 1; }

        /* LE LOGO (ICÔNE LAYERS POUR CATÉGORIE) */
        .brand-logo-container { 
          position: relative; z-index: 10;
          width: 64px; height: 64px; border-radius: 16px; 
          background: var(--icon-premium-bg);
          border: 1px solid rgba(59,130,246,0.2);
          display: flex; align-items: center; justify-content: center; 
          color: var(--icon-premium-color);
          box-shadow: inset 0 2px 5px rgba(255,255,255,0.5), 0 5px 15px rgba(59,130,246,0.08);
          transition: all 0.4s ease;
        }
        html.dark .brand-logo-container { box-shadow: inset 0 2px 5px rgba(255,255,255,0.05), 0 5px 15px rgba(0,0,0,0.5); }
        .cat-card:hover .brand-logo-container {
          transform: scale(1.05); color: #2563EB; box-shadow: inset 0 2px 5px rgba(255,255,255,0.5), 0 8px 25px rgba(59,130,246,0.2);
        }
        html.dark .cat-card:hover .brand-logo-container { color: #93C5FD; }

        .cat-name { 
          position: relative; z-index: 10;
          font-size: 18px; font-weight: 800; color: var(--text-main); text-align: center; letter-spacing: -0.5px; transition: color 0.4s; 
        }

        /* ════ BOUTONS D'ACTION (ÉLÉGANTS ET DISCRETS) ════ */
        .card-actions { display: flex; gap: 12px; width: 100%; margin-top: 12px; position: relative; z-index: 10; }
        
        .action-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; padding: 10px; border-radius: 12px; 
          background: transparent; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        
        /* Bouton Éditer */
        .action-btn.edit { border: 1px solid var(--btn-edit-border); color: var(--btn-edit-txt); }
        .action-btn.edit:hover { 
          border-color: #3B82F6; color: #3B82F6; 
          background: rgba(59,130,246,0.05);
          box-shadow: 0 4px 15px rgba(59,130,246,0.15);
          transform: translateY(-2px);
        }
        
        /* Bouton Supprimer */
        .action-btn.delete { border: 1px solid var(--btn-del-border); color: var(--btn-del-txt); }
        .action-btn.delete:hover { 
          border-color: #E11D48; color: #E11D48; 
          background: rgba(225,29,72,0.05);
          box-shadow: 0 4px 15px rgba(225,29,72,0.15);
          transform: translateY(-2px);
        }

        /* EMPTY STATES */
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; }
        .empty-icon { width: 80px; height: 80px; border-radius: 24px; background: rgba(59,130,246,0.08); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 0 30px rgba(59,130,246,0.05); }
        .empty-title { font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
        .empty-sub   { font-size: 14px; color: var(--text-sub); margin-bottom: 28px; max-width: 300px; line-height: 1.5; }

        /* ════ MODAL ANIMÉ (FIL ROUGE) ════ */
        .modal-overlay { 
          position: fixed; inset: 0; background: var(--modal-overlay); 
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); 
          display: flex; align-items: center; justify-content: center; 
          z-index: 1000; transition: background 0.4s; 
        }

        .modal-box { 
          background: var(--modal-bg); 
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-radius: 24px; padding: 32px; width: 100%; max-width: 380px; margin: 16px; 
          box-shadow: var(--modal-shadow); position: relative; 
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          display: flex; flex-direction: column; align-items: center;
        }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .modal-box::after {
          content: ''; position: absolute; inset: -2px; border-radius: 26px; padding: 2px; 
          background: conic-gradient(
            from var(--angle), transparent 50%, rgba(225,29,72,0.1) 70%, #E11D48 90%, #ff1a40 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: rotate-wire 2s linear infinite; pointer-events: none; 
          filter: drop-shadow(0 0 8px rgba(225,29,72,0.6));
        }

        .modal-icon, .modal-title, .modal-sub, .modal-actions { position: relative; z-index: 10; }
        .modal-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(225,29,72,0.1); border: 1px solid rgba(225,29,72,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .modal-title { font-size: 20px; font-weight: 800; color: var(--text-main); text-align: center; margin-bottom: 10px; }
        .modal-sub   { font-size: 14px; color: var(--text-sub); text-align: center; margin-bottom: 28px; line-height: 1.6; }
        .modal-name  { font-weight: 700; color: var(--text-main); }
        .modal-actions { display: flex; gap: 12px; width: 100%;}
        
        .btn-modal-cancel { flex: 1; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: transparent; font-size: 14px; font-weight: 600; color: var(--text-sub); cursor: pointer; transition: all 0.2s; }
        .btn-modal-cancel:hover { background: var(--search-bg); color: var(--text-main); border-color: var(--search-border); }
        
        .btn-danger { flex: 1; padding: 12px; border-radius: 12px; border: none; background: linear-gradient(135deg, #F43F5E, #E11D48); font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; box-shadow: 0 4px 15px rgba(225,29,72,0.25); transition: all 0.2s; }
        .btn-danger:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(225,29,72,0.35); }
      `}</style>

      <div className="theme-container">
        <ParticleCanvas />
        <div className="deco-glow" />

        <div className="content-layer">
          <div className="page-header">
            <div>
              <div className="page-title">Catégories</div>
              <div className="page-sub">Organisez vos produits par familles</div>
            </div>
            <Link to="/admin/categories/add" className="btn-primary">
              <Plus size={18} /> Nouvelle catégorie
            </Link>
          </div>

          {!loading && !error && categories.length > 0 && (
            <div className="search-bar">
              <Search size={18} color="var(--text-sub)" />
              <input placeholder="Rechercher une catégorie..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <Loader2 size={40} color="#3B82F6" style={{ animation: "spin 1s linear infinite" }} />
              <p style={{ color: "var(--text-sub)", marginTop: 16, fontSize: 14, fontWeight: 500 }}>Chargement des catégories...</p>
            </div>
          )}

          {error && (
            <div className="empty-state">
              <AlertTriangle size={48} color="#E11D48" />
              <p style={{ color: "var(--text-main)", fontWeight: 800, marginTop: 16, fontSize: 16 }}>{error}</p>
              <button style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onClick={fetchCategories}>Réessayer</button>
            </div>
          )}

          {!loading && !error && (
            filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Layers size={36} color="#3B82F6" /></div>
                <div className="empty-title">Aucune catégorie trouvée</div>
                <div className="empty-sub">{search ? `Aucun résultat pour "${search}"` : "C'est un peu vide par ici. Commencez par ajouter votre première catégorie !"}</div>
                {!search && <Link to="/admin/categories/add" className="btn-primary"><Plus size={16} /> Ajouter une catégorie</Link>}
              </div>
            ) : (
              <div className="grid">
                {filtered.map((cat) => {
                  return (
                    <div key={cat.id} className="cat-card">
                      {/* Icône "Layers" élégante pour les Catégories */}
                      <div className="brand-logo-container">
                        <Layers size={28} strokeWidth={1.5} />
                      </div>
                      
                      <div className="cat-name">{cat.nom}</div>
                      
                      {/* Boutons Ghost */}
                      <div className="card-actions">
                        <button className="action-btn edit" onClick={() => navigate(`/admin/categories/edit/${cat.id}`)}>
                          <Pencil size={15} /> 
                        </button>
                        <button className="action-btn delete" onClick={() => { setDeleteId(cat.id); setDeleteName(cat.nom); }}>
                          <Trash2 size={15} /> 
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* MODAL DE SUPPRESSION (NÉON ROUGE) */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon"><Trash2 size={28} color="#E11D48" /></div>
            <div className="modal-title">Supprimer la catégorie ?</div>
            <div className="modal-sub">
              La catégorie <span className="modal-name">"{deleteName}"</span> sera définitivement supprimée.
              <br/><br/>
              <span style={{fontSize:'12.5px', color:'#E11D48', fontWeight: 600}}>Attention: Assurez-vous qu'aucun produit n'y est associé.</span>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setDeleteId(null)}>Annuler</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteId)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}