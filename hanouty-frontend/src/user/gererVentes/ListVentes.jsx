import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, Pencil, Trash2, Package, Loader2, Search, 
  AlertTriangle, Calendar, Scale, ShoppingCart, DollarSign
} from "lucide-react";
import { ventesServices } from "../../services/ventesServices"; 
import { authServices } from "../../services/authServices";     

function ParticleCanvas() {
  const canvasRef = useRef(null);
  // ... (Code ParticleCanvas identique à votre fichier, je le laisse tel quel pour brevité) ...
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; 
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

export default function ListeVentes() {
  const navigate = useNavigate();
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  
  // État pour la modale : on stocke l'objet complet de la vente/ligne sélectionnée
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const userId = authServices.getUserId(); 
        
        if (!userId) throw new Error("Utilisateur non connecté");

        const res = await ventesServices.getVentesParUserId(userId);
        setHistorique(res.data || res); 
      } catch (err) {
        console.error("ERROR:", err);
        setError("Impossible de charger l'historique des ventes.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const filtered = historique.filter((item) => {
    const term = search.toLowerCase();
    const nomProduit = item.produit?.nom?.toLowerCase() || "";
    const dateStr = item.date ? new Date(item.date).toLocaleDateString('fr-FR') : "";
    return nomProduit.includes(term) || dateStr.includes(term);
  });

  const formatPrice = (price) => {
    if (price === null || price === undefined) return "-";
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // --- LOGIQUE DE SUPPRESSION ---
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    // IMPORTANT : Il faut récupérer l'ID de la VENTE, pas de la ligne.
    // Si votre backend renvoie 'vente_id' dans chaque ligne, utilisez-le.
    // Sinon, adaptez selon votre structure de données.
    const venteId = itemToDelete.vente_id; 

    if (!venteId) {
        alert("Erreur : Impossible d'identifier la vente à supprimer (ID manquant).");
        setItemToDelete(null);
        return;
    }

    setIsDeleting(true);
    try {
        // Appel au service pour supprimer la VENTE entière
        await ventesServices.supprimerVente(venteId);
        
        // Mise à jour locale de l'UI : On retire TOUTES les lignes qui appartiennent à cette vente
        setHistorique(prev => prev.filter(h => h.vente_id !== venteId));
        
    } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression : " + (err.response?.data?.detail || err.message));
    } finally {
        setIsDeleting(false);
        setItemToDelete(null);
    }
  };

  return (
    <div title="Historique des Ventes">
      {/* ... (STYLE CSS IDENTIQUE À VOTRE CODE PRÉCÉDENT) ... */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes rotate-wire { to { --angle: 360deg; } }
        .theme-container { --bg-main: #F8FAFC; --bg-pattern: rgba(59,130,246,0.06); --bg-card: rgba(255, 255, 255, 0.85); --text-main: #0F172A; --text-sub: #64748B; --border: rgba(59,130,246,0.15); --search-bg: #FFFFFF; --search-border: rgba(59,130,246,0.2); --shadow-card: 0 4px 20px rgba(59,130,246,0.05); --particle-op: 0.25; --glow-op: 0; --icon-bg: #EFF6FF; --icon-color: #3B82F6; --btn-edit-bg: #EFF6FF; --btn-edit-txt: #2563EB; --btn-edit-border: #BFDBFE; --btn-del-bg: #FEF2F2; --btn-del-txt: #E11D48; --btn-del-border: #FECDD3; --modal-overlay: rgba(15, 23, 42, 0.4); --modal-bg: #FFFFFF; }
        html.dark .theme-container { --bg-main: #0B1120; --bg-pattern: rgba(59,130,246,0.04); --bg-card: rgba(15, 23, 42, 0.65); --text-main: #F8FAFC; --text-sub: rgba(255, 255, 255, 0.5); --border: rgba(59,130,246,0.15); --search-bg: rgba(255, 255, 255, 0.03); --search-border: rgba(59,130,246,0.2); --shadow-card: 0 4px 20px rgba(0,0,0,0.2); --particle-op: 1; --glow-op: 1; --icon-bg: rgba(59,130,246,0.15); --icon-color: #60A5FA; --btn-edit-bg: rgba(59,130,246,0.15); --btn-edit-txt: #60A5FA; --btn-edit-border: rgba(59,130,246,0.3); --btn-del-bg: rgba(225,29,72,0.15); --btn-del-txt: #FB7185; --btn-del-border: rgba(225,29,72,0.3); --modal-overlay: rgba(0, 0, 0, 0.8); --modal-bg: #1e293b; }
        .theme-container { position: relative; background: var(--bg-main); min-height: calc(100vh - 40px); border-radius: 20px; overflow: hidden; padding: 40px; border: 1px solid var(--border); font-family: 'DM Sans', sans-serif; box-sizing: border-box; transition: background 0.4s ease; }
        .theme-container::before { content: ''; position: absolute; inset: 0; z-index: 0; background-image: radial-gradient(var(--bg-pattern) 1px, transparent 1px); background-size: 24px 24px; }
        .deco-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%); top: -100px; right: -100px; pointer-events: none; z-index: 0; opacity: var(--glow-op); }
        .content-layer { position: relative; z-index: 10; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .page-title { font-size: 26px; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; }
        .page-sub   { font-size: 14px; color: var(--text-sub); margin-top: 4px; }
        .search-bar { display: flex; align-items: center; gap: 12px; background: var(--search-bg); border: 1px solid var(--search-border); border-radius: 14px; padding: 12px 18px; margin-bottom: 32px; max-width: 400px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
        .search-bar input { border: none; outline: none; font-size: 14px; color: var(--text-main); background: transparent; flex: 1; font-family: 'DM Sans', sans-serif; }
        .table-container { background: var(--bg-card); border-radius: 18px; backdrop-filter: blur(16px); border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow-card); }
        .prod-table { width: 100%; border-collapse: collapse; font-family: 'DM Sans', sans-serif; }
        .prod-table th { text-align: left; padding: 18px 20px; font-size: 12px; font-weight: 700; color: var(--text-sub); text-transform: uppercase; border-bottom: 1px solid var(--border); background: rgba(59,130,246,0.03); }
        .prod-table td { padding: 16px 20px; font-size: 14px; color: var(--text-main); border-bottom: 1px solid var(--border); vertical-align: middle; }
        .prod-table tr:hover td { background: rgba(59,130,246,0.04); }
        .product-name-cell { display: flex; align-items: center; gap: 12px; }
        .prod-icon-box { width: 38px; height: 38px; border-radius: 10px; background: var(--icon-bg); color: var(--icon-color); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
        .name-text { font-weight: 700; color: var(--text-main); }
        .action-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; background: transparent; }
        .btn-del-action { color: var(--btn-del-txt); }
        .btn-del-action:hover { background: var(--btn-del-bg); border-color: var(--btn-del-border); }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; }
        .empty-icon { width: 80px; height: 80px; border-radius: 24px; background: rgba(59,130,246,0.08); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .modal-overlay { position: fixed; inset: 0; background: var(--modal-overlay); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-box { background: var(--modal-bg); border-radius: 16px; padding: 32px; width: 100%; max-width: 400px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); border: 1px solid var(--border); animation: popIn 0.2s ease-out; }
        @keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .modal-actions { display: flex; gap: 12px; margin-top: 24px; }
        .btn-modal-cancel { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-sub); cursor: pointer; font-weight: 600; }
        .btn-danger { flex: 1; padding: 10px; border-radius: 8px; border: none; background: #ef4444; color: white; cursor: pointer; font-weight: 600; }
        .btn-danger:hover { background: #dc2626; }
        .btn-danger:disabled { background: #fca5a5; cursor: not-allowed; }
      `}</style>

      <div className="theme-container">
        <ParticleCanvas />
        <div className="deco-glow" />

        <div className="content-layer">
          <div className="page-header">
            <div>
              <div className="page-title">Historique des Ventes</div>
            </div>
          </div>

          {!loading && !error && historique.length > 0 && (
            <div className="search-bar">
              <Search size={18} color="var(--text-sub)" />
              <input placeholder="Rechercher par produit ou date..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}

          {loading && <div className="empty-state"><Loader2 size={40} color="#3B82F6" className="animate-spin" /><p style={{ marginTop: 16, color: "var(--text-sub)" }}>Chargement...</p></div>}
          {error && <div className="empty-state"><AlertTriangle size={48} color="#E11D48" /><p style={{ marginTop: 16, color: "var(--text-main)", fontWeight: "bold" }}>{error}</p></div>}

          {!loading && !error && (filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><ShoppingCart size={36} color="#3B82F6" /></div>
                <div className="page-title" style={{fontSize: 20}}>Aucune vente trouvée</div>
              </div>
            ) : (
              <div className="table-container">
                <table className="prod-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Produit</th>
                      <th style={{ width: '12%' }}>Date</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>Qté</th>
                      <th style={{ width: '15%' }}>Poids</th>
                      <th style={{ width: '13%' }}>Prix Unit.</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Total</th>
                      <th style={{ width: '5%', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, index) => {
                        const prod = item.produit || {};
                        const totalLigne = (prod.prix || 0) * (item.quantite || 0);
                        
                        return (
                            <tr key={`${item.date}-${index}`}>
                                <td>
                                    <div className="product-name-cell">
                                        <div className="prod-icon-box"><Package size={18} /></div>
                                        <div><div className="name-text">{prod.nom || "Inconnu"}</div></div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--text-sub)', fontSize: '13px'}}>
                                        <Calendar size={14} />{formatDate(item.date)}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{background: 'rgba(59,130,246,0.1)', color: '#3B82F6', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px'}}>{item.quantite}</span>
                                </td>
                                <td>
                                    {prod.poids_valeur ? (
                                        <div style={{display:'flex', alignItems:'center', gap:'6px', color:'var(--text-main)', fontSize: '13px'}}>
                                            <Scale size={14} color="var(--text-sub)" />{prod.poids_valeur} <span style={{color:'var(--text-sub)'}}>{prod.poids_unite || ''}</span>
                                        </div>
                                    ) : <span style={{color:'var(--text-sub)', fontSize:'12px'}}>-</span>}
                                </td>
                                <td><div style={{color: 'var(--text-main)', fontSize: '13px'}}>{formatPrice(prod.prix)}</div></td>
                                <td style={{ textAlign: 'right', fontWeight: '700', color: '#10B981', fontSize: '14px' }}>{formatPrice(totalLigne)}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="action-btn btn-del-action" onClick={() => setItemToDelete(item)} title="Supprimer la vente">
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal de Confirmation Suppression */}
      {itemToDelete && (
        <div className="modal-overlay" onClick={() => !isDeleting && setItemToDelete(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{textAlign: 'center', marginBottom: 20}}>
                <div style={{background: '#fef2f2', color: '#ef4444', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
                    {isDeleting ? <Loader2 className="animate-spin" size={24} /> : <Trash2 size={24} />}
                </div>
                <h3 style={{margin: 0, color: 'var(--text-main)', fontSize: 18}}>
                    {isDeleting ? "Suppression en cours..." : "Supprimer cette vente ?"}
                </h3>
                <p style={{margin: '8px 0 0', color: 'var(--text-sub)', fontSize: 14}}>
                    Vous êtes sur le point de supprimer définitivement la vente contenant <strong>{itemToDelete.produit?.nom}</strong> et tous les articles associés à cette transaction.
                </p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setItemToDelete(null)} disabled={isDeleting}>Annuler</button>
              <button className="btn-danger" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? "..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}