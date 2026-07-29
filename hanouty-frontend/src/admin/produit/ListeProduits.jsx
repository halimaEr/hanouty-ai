import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Pencil, Trash2, Package, Loader2, Search, 
  AlertTriangle, Tag, Layers, Scale 
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { produitServices } from "../../services/produitServices";
import { authServices } from "../../services/authServices";

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

export default function ListeProduits() {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const userRes = await authServices.getUserConnecte();
        const user = userRes.data;
        setCurrentUser(user);
        const userId = user.id || user.sub; 
        if (!userId) {
          throw new Error("User ID introuvable");
        }
        const prodRes = await produitServices.getProduitsAvecDetails();
        setProduits(prodRes.data);
      } catch (err) {
        console.log("ERROR:", err.response?.data || err.message);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleDelete = (id) => {
    produitServices
      .supprimerProduit(id)
      .then(() => {
        setProduits((prev) => prev.filter((p) => p.id !== id));
        setDeleteId(null);
        setDeleteName("");
      })
      .catch(() => alert("Erreur lors de la suppression."));
  };

  const filtered = produits.filter((p) => {
    const term = search.toLowerCase();
    const nomMatch = p.nom?.toLowerCase().includes(term);
    const marqueMatch = p.marque?.nom?.toLowerCase().includes(term);
    const catMatch = p.categorie?.nom?.toLowerCase().includes(term);
    return nomMatch || marqueMatch || catMatch;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(price || 0);
  };

  return (
    <div title="Mes Produits">
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
          --bg-card: rgba(255, 255, 255, 0.85); /* Effet glace clair */
          --text-main: #0F172A;
          --text-sub: #64748B;
          --border: rgba(59,130,246,0.15);
          --search-bg: #FFFFFF;
          --search-border: rgba(59,130,246,0.2);
          --shadow-card: 0 4px 20px rgba(59,130,246,0.05);
          --particle-op: 0.25;
          --glow-op: 0;
          
          --modal-overlay: rgba(15, 23, 42, 0.4);
          --modal-bg: rgba(255, 255, 255, 0.65); 
          --modal-shadow: 0 24px 60px rgba(0,0,0,0.15);
          
          --icon-bg: #EFF6FF; --icon-color: #3B82F6;
          --btn-edit-bg: #EFF6FF; --btn-edit-txt: #2563EB; --btn-edit-border: #BFDBFE;
          --btn-del-bg: #FEF2F2;  --btn-del-txt: #E11D48;  --btn-del-border: #FECDD3;
          
          /* Badges */
          --badge-brand-bg: #F0FDF4; --badge-brand-txt: #10B981; --badge-brand-border: #D1FAE5;
          --badge-cat-bg: #F5F3FF; --badge-cat-txt: #8B5CF6; --badge-cat-border: #EDE9FE;
        }

        /* ════ VARIABLES THEME SOMBRE (NUIT BLEUTÉE) ════ */
        html.dark .theme-container {
          --bg-main: #0B1120;
          --bg-pattern: rgba(59,130,246,0.04);
          --bg-card: rgba(15, 23, 42, 0.65); /* Effet glace sombre pour le tableau */
          --text-main: #F8FAFC;
          --text-sub: rgba(255, 255, 255, 0.5);
          --border: rgba(59,130,246,0.15);
          --search-bg: rgba(255, 255, 255, 0.03);
          --search-border: rgba(59,130,246,0.2);
          --shadow-card: 0 4px 20px rgba(0,0,0,0.2);
          --particle-op: 1;
          --glow-op: 1;
          
          --modal-overlay: rgba(10, 8, 15, 0.8);
          --modal-bg: rgba(15, 23, 42, 0.65); 
          --modal-shadow: 0 15px 50px rgba(0,0,0,0.6);
          
          --icon-bg: rgba(59,130,246,0.15); --icon-color: #60A5FA;
          --btn-edit-bg: rgba(59,130,246,0.15); --btn-edit-txt: #60A5FA; --btn-edit-border: rgba(59,130,246,0.3);
          --btn-del-bg: rgba(225,29,72,0.15);   --btn-del-txt: #FB7185;  --btn-del-border: rgba(225,29,72,0.3);
          
          /* Badges Sombre */
          --badge-brand-bg: rgba(16,185,129,0.15); --badge-brand-txt: #34D399; --badge-brand-border: rgba(16,185,129,0.3);
          --badge-cat-bg: rgba(139,92,246,0.15); --badge-cat-txt: #A78BFA; --badge-cat-border: rgba(139,92,246,0.3);
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

        /* ════ LE TABLEAU GLASSMORPHISM ════ */
        .table-container {
          background: var(--bg-card); border-radius: 18px; 
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border); overflow: hidden;
          box-shadow: var(--shadow-card); transition: all 0.3s;
        }
        
        .prod-table { width: 100%; border-collapse: collapse; font-family: 'DM Sans', sans-serif; }
        
        .prod-table th {
          text-align: left; padding: 18px 20px;
          font-size: 12px; font-weight: 700; color: var(--text-sub); 
          text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border); 
          background: rgba(59,130,246,0.03); 
        }
        
        .prod-table td {
          padding: 16px 20px; font-size: 14px; color: var(--text-main); 
          border-bottom: 1px solid var(--border); vertical-align: middle;
        }
        
        .prod-table tr:last-child td { border-bottom: none; }
        .prod-table tr:hover td { background: rgba(59,130,246,0.04); } 

        /* Badges et Icônes */
        .product-name-cell { display: flex; align-items: center; gap: 12px; }
        .prod-icon-box {
            width: 38px; height: 38px; border-radius: 10px;
            background: var(--icon-bg); color: var(--icon-color); border: 1px solid var(--border);
            display: flex; align-items: center; justify-content: center;
        }
        .name-text { font-weight: 700; color: var(--text-main); }
        
        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 20px; font-size: 12.5px; font-weight: 600;
        }
        .badge-brand { background: var(--badge-brand-bg); color: var(--badge-brand-txt); border: 1px solid var(--badge-brand-border); }
        .badge-cat   { background: var(--badge-cat-bg); color: var(--badge-cat-txt); border: 1px solid var(--badge-cat-border); }

        .action-btn {
          width: 34px; height: 34px; border-radius: 10px; border: 1px solid transparent;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; background: transparent;
        }
        .btn-edit-action { color: var(--btn-edit-txt); }
        .btn-edit-action:hover { background: var(--btn-edit-bg); border-color: var(--btn-edit-border); color: #2563EB;}
        .btn-del-action { color: var(--btn-del-txt); }
        .btn-del-action:hover { background: var(--btn-del-bg); border-color: var(--btn-del-border); color: #E11D48;}

        /* Empty & Loading States */
        .empty-state, .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; }
        .empty-icon { width: 80px; height: 80px; border-radius: 24px; background: rgba(59,130,246,0.08); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 0 30px rgba(59,130,246,0.05); }
        .empty-title { font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
        .empty-sub   { font-size: 14px; color: var(--text-sub); margin-bottom: 28px; max-width: 300px; line-height: 1.5; }

        /* ════ MODAL DE SUPPRESSION (FIL ROUGE) ════ */
        .modal-overlay { position: fixed; inset: 0; background: var(--modal-overlay); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; transition: background 0.4s; }
        .modal-box { background: var(--modal-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-radius: 24px; padding: 32px; width: 100%; max-width: 380px; margin: 16px; box-shadow: var(--modal-shadow); position: relative; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; flex-direction: column; align-items: center; }
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .modal-box::after {
          content: ''; position: absolute; inset: -2px; border-radius: 26px; padding: 2px; 
          background: conic-gradient(from var(--angle), transparent 50%, rgba(244,63,94,0.1) 70%, #F43F5E 90%, #ff1a40 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
          animation: rotate-wire 2s linear infinite; pointer-events: none; filter: drop-shadow(0 0 8px rgba(244,63,94,0.6));
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
          
          {/* Header */}
          <div className="page-header">
            <div>
              <div className="page-title">Produits</div>
              <div className="page-sub">Gérez votre catalogue et vos stocks</div>
            </div>
            <Link to="/admin/produits/add" className="btn-primary">
              <Plus size={18} />
              Nouveau produit
            </Link>
          </div>

          {/* Search */}
          {!loading && !error && produits.length > 0 && (
            <div className="search-bar">
              <Search size={18} color="var(--text-sub)" />
              <input
                placeholder="Rechercher par nom, marque ou catégorie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="empty-state">
              <Loader2 size={40} color="#3B82F6" style={{ animation: "spin 1s linear infinite" }} />
              <p style={{ color: "var(--text-sub)", marginTop: 16, fontSize: 14, fontWeight: 500 }}>Chargement des produits...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="empty-state">
              <AlertTriangle size={48} color="#E11D48" />
              <p style={{ color: "var(--text-main)", fontWeight: 800, marginTop: 16, fontSize: 16 }}>{error}</p>
              <button style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, background: "rgba(59,130,246,0.1)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.2)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} onClick={() => window.location.reload()}>Réessayer</button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Package size={36} color="#3B82F6" />
                </div>
                <div className="empty-title">Aucun produit trouvé</div>
                <div className="empty-sub">
                  {search ? `Aucun résultat pour "${search}"` : "Commencez par ajouter votre premier produit"}
                </div>
                {!search && (
                  <Link to="/admin/produits/add" className="btn-primary">
                    <Plus size={16} /> Ajouter un produit
                  </Link>
                )}
              </div>
            ) : (
              <div className="table-container">
                <table className="prod-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Produit</th>
                      <th style={{ width: '15%' }}>Marque</th>
                      <th style={{ width: '15%' }}>Catégorie</th>
                      <th style={{ width: '15%' }}>Prix</th>
                      <th style={{ width: '15%' }}>Poids</th>
                      <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr key={p.id}>
                        {/* Name Column */}
                        <td>
                          <div className="product-name-cell">
                            <div className="prod-icon-box">
                              <Package size={18} />
                            </div>
                            <span className="name-text">{p.nom}</span>
                          </div>
                        </td>
                        {/* Brand Column */}
                        <td>
                          {p.marque ? (
                            <span className="badge badge-brand">
                              <Tag size={12} /> {p.marque.nom}
                            </span>
                          ) : (
                            <span style={{color:'var(--text-sub)', fontSize:'12px', fontWeight:600}}>N/A</span>
                          )}
                        </td>
                        {/* Category Column */}
                        <td>
                          {p.categorie ? (
                            <span className="badge badge-cat">
                              <Layers size={12} /> {p.categorie.nom}
                            </span>
                          ) : (
                             <span style={{color:'var(--text-sub)', fontSize:'12px', fontWeight:600}}>N/A</span>
                          )}
                        </td>
                        {/* Price Column */}
                        <td>
                          <div style={{display:'flex', alignItems:'center', gap:'6px', fontWeight:700, color: 'var(--text-main)'}}>
                            {formatPrice(p.prix)}
                          </div>
                        </td>
                        {/* Weight Column */}
                        <td>
                           <div style={{display:'flex', alignItems:'center', gap:'6px', color:'var(--text-sub)', fontWeight: 500}}>
                            <Scale size={14} /> 
                            {p.poids_valeur ? `${p.poids_valeur} ${p.poids_unite || ''}` : '-'}
                          </div>
                        </td>
                        {/* Actions Column */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                            <button
                               className="action-btn btn-edit-action"
                              onClick={() => navigate(`/admin/produits/edit/${p.id}`)}
                              title="Modifier"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                               className="action-btn btn-del-action"
                              onClick={() => { setDeleteId(p.id); setDeleteName(p.nom); }}
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <Trash2 size={28} color="#E11D48" />
            </div>
            <div className="modal-title">Supprimer le produit ?</div>
            <div className="modal-sub">
              Le produit <span className="modal-name">"{deleteName}"</span> sera définitivement supprimé. Cette action est irréversible.
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