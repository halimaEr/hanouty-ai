import { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/AdminLayout";
import { imageServices } from "../../services/imageServices";
import { produitServices } from "../../services/produitServices";
import { Loader2, AlertTriangle, Search, Package, Plus, Pencil, Trash2, Tag, Layers, Link as LinkIcon, MoreVertical } from "lucide-react";

// 1. PARTICULES EN ARRIÈRE-PLAN (PALETTE BLEU OCÉAN)
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; 
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    
    // Palette Glace & Océan (Correction ici)
    const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#0EA5E9", "#38BDF8"];
    
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5, dx: (Math.random() - 0.5) * 0.38, dy: (Math.random() - 0.5) * 0.38,
      color: COLORS[Math.floor(Math.random() * COLORS.length)], 
      a: Math.random() * 0.6 + 0.4, 
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
            ctx.beginPath(); 
            ctx.strokeStyle = "#3B82F6"; // Correction de la couleur de la ligne ici
            ctx.globalAlpha = (1 - d / 88) * 0.25; 
            ctx.lineWidth = 0.8; ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
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

export default function NewImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [imageToLabel, setImageToLabel] = useState(null);
  const [produits, setProduits] = useState([]);
  const [produitsLoading, setProduitsLoading] = useState(false);
  const [produitChoisi, setProduitChoisi] = useState("");
  const [assignEnCours, setAssignEnCours] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => { fetchImages(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchImages = async () => {
    try {
      const res = await imageServices.getNewImages();
      setImages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id) => {
    setOpenMenuId(null);
    setImageToDelete(id);
    setShowConfirmModal(true);
  };
  
  const cancelDelete = () => { setShowConfirmModal(false); setImageToDelete(null); };
  
  const confirmDelete = async () => {
    if (!imageToDelete) return;
    try {
      await imageServices.supprimerImage(imageToDelete);
      setImages(prev => prev.filter(img => img.id !== imageToDelete));
      setShowConfirmModal(false);
      setImageToDelete(null);
    } catch (err) { console.error(err); }
  };

  const openLabelModal = async (img) => {
    setOpenMenuId(null);
    setImageToLabel(img);
    setProduitChoisi("");
    setShowLabelModal(true);
    if (produits.length === 0) {
      setProduitsLoading(true);
      try {
        const res = await produitServices.getProduitsAvecDetails();
        setProduits(res.data);
      } catch (err) { console.error(err); }
      finally { setProduitsLoading(false); }
    }
  };

  const closeLabelModal = () => { setShowLabelModal(false); setImageToLabel(null); setProduitChoisi(""); };

  const confirmLabel = async () => {
    if (!produitChoisi) return;
    setAssignEnCours(true);
    try {
      await imageServices.lierImageAuProduit(imageToLabel.id, produitChoisi);
      setImages(prev => prev.filter(img => img.id !== imageToLabel.id));
      closeLabelModal();
    } catch (err) { console.error(err); }
    finally { setAssignEnCours(false); }
  };

  const labelProduit = (p) => {
    const parts = [p.nom];
    if (p.categorie?.nom) parts.push(p.categorie.nom);
    if (p.marque?.nom) parts.push(p.marque.nom);
    if (p.prix != null) parts.push(`${p.prix} MAD`);
    return parts.join(" — ");
  };

  return (
    <div title="Images">
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
          --bg-card: rgba(255, 255, 255, 0.85);
          --text-main: #0F172A;
          --text-sub: #64748B;
          --border: rgba(59,130,246,0.15);
          --search-bg: #FFFFFF;
          --search-border: rgba(59,130,246,0.2);
          --shadow-card: 0 4px 20px rgba(59,130,246,0.05);
          
          --particle-op: 0.25;
          --glow-op: 0;
          
          --modal-overlay: rgba(15, 23, 42, 0.4);
          --modal-bg: rgba(255, 255, 255, 0.85); 
          --modal-shadow: 0 24px 60px rgba(0,0,0,0.15);
          
          --input-bg: #FFFFFF;
          --input-border: #E2E8F0;
          --input-focus: #3B82F6;

          --wire-glow-color-blue: rgba(59,130,246,0.4);
          --wire-glow-color-red: rgba(225,29,72,0.4);

          --btn-cancel-bg: transparent;
          --btn-cancel-text: #475569;
          --btn-cancel-border: #CBD5E1;
          --btn-cancel-hover: rgba(59,130,246,0.05);

          --icon-bg: #EFF6FF;
          --icon-color: #3B82F6;
        }

        /* ════ VARIABLES THEME SOMBRE (NUIT BLEUTÉE) ════ */
        html.dark .theme-container {
          --bg-main: #0B1120;
          --bg-pattern: rgba(59,130,246,0.04);
          --bg-card: rgba(15, 23, 42, 0.65);
          --text-main: #F8FAFC;
          --text-sub: rgba(255, 255, 255, 0.5);
          --border: rgba(59,130,246,0.15);
          --search-bg: rgba(255, 255, 255, 0.03);
          --search-border: rgba(59,130,246,0.2);
          --shadow-card: 0 4px 20px rgba(0,0,0,0.2);
          
          --particle-op: 1; 
          --glow-op: 1;
          
          --modal-overlay: rgba(10, 8, 15, 0.8);
          --modal-bg: rgba(15, 23, 42, 0.85); 
          --modal-shadow: 0 15px 50px rgba(0,0,0,0.6);
          
          --input-bg: rgba(255,255,255,0.03);
          --input-border: rgba(59,130,246,0.2);
          --input-focus: #3B82F6;

          --wire-glow-color-blue: rgba(96,165,250,0.6);
          --wire-glow-color-red: rgba(244,63,94,0.6);

          --btn-cancel-bg: transparent;
          --btn-cancel-text: rgba(255,255,255,0.7);
          --btn-cancel-border: rgba(255,255,255,0.2);
          --btn-cancel-hover: rgba(59,130,246,0.1);

          --icon-bg: rgba(59,130,246,0.15);
          --icon-color: #60A5FA;
          
          color-scheme: dark; 
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

        .img-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }

        .img-card {
          background: var(--bg-card); border-radius: 20px; 
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border); padding: 12px; 
          display: flex; flex-direction: column; align-items: center; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: visible;
          box-shadow: var(--shadow-card);
        }
        
        .img-card:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(59,130,246,0.1); border-color: transparent; }
        
        /* Fil lumineux au survol (Bleu Océan) */
        .img-card::after {
          content: ''; position: absolute; inset: -2px; border-radius: 22px; padding: 2px; 
          background: conic-gradient(
            from var(--angle), transparent 50%, rgba(59,130,246,0.1) 70%, #2563EB 90%, #60A5FA 100%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.4s ease;
          animation: rotate-wire 2.5s linear infinite; pointer-events: none; 
          filter: drop-shadow(0 0 8px var(--wire-glow-color-blue)); z-index: 1;
        }
        .img-card:hover::after { opacity: 1; }

        .img-wrap {
          position: relative; z-index: 10;
          width: 100%; height: 180px;
          overflow: hidden;
          background: rgba(0,0,0,0.1); 
          border-radius: 12px;
        }
        .img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          transition: transform 0.4s ease;
        }
        .img-card:hover .img-wrap img { transform: scale(1.05); }

        .new-badge {
          position: absolute; top: 10px; left: 10px;
          background: rgba(59,130,246,0.85);
          backdrop-filter: blur(4px);
          color: white; font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 20px;
          z-index: 12; box-shadow: 0 2px 10px rgba(59,130,246,0.3);
        }

        .menu-btn {
          position: absolute; top: 10px; right: 10px;
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: white; z-index: 15; transition: all 0.2s;
        }
        .menu-btn:hover { background: #3B82F6; border-color: #60A5FA; transform: scale(1.05); }

        .dropdown {
          position: absolute; top: 48px; right: 10px;
          background: var(--bg-card); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border); border-radius: 14px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;
          z-index: 100; min-width: 180px; animation: dropIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        .dropdown-item {
          display: flex; align-items: center; gap: 10px; padding: 12px 16px;
          font-size: 13px; font-weight: 600; cursor: pointer; border: none;
          background: transparent; width: 100%; text-align: left; transition: all 0.2s;
          color: var(--text-main); font-family: 'DM Sans', sans-serif;
        }
        .dropdown-item:hover { background: rgba(59,130,246,0.1); color: #3B82F6; }
        .dropdown-item.danger { color: #E11D48; }
        .dropdown-item.danger:hover { background: rgba(225,29,72,0.1); color: #E11D48; }
        .dropdown-divider { height: 1px; background: var(--border); margin: 0; }

        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; }
        .empty-icon { width: 80px; height: 80px; border-radius: 24px; background: rgba(59,130,246,0.08); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 0 30px rgba(59,130,246,0.05); }
        .empty-title { font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
        .empty-sub   { font-size: 14px; color: var(--text-sub); margin-bottom: 28px; max-width: 300px; line-height: 1.5; }

        .modal-overlay { 
          position: fixed; inset: 0; background: var(--modal-overlay); 
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); 
          display: flex; align-items: center; justify-content: center; z-index: 1000; 
        }

        .modal-box { 
          background: var(--modal-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-radius: 24px; padding: 32px; width: 100%; max-width: 420px; margin: 16px; 
          box-shadow: var(--modal-shadow); position: relative; display: flex; flex-direction: column; align-items: center;
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        }

        .modal-box.danger::after {
          content: ''; position: absolute; inset: -2px; border-radius: 26px; padding: 2px; 
          background: conic-gradient(from var(--angle), transparent 50%, rgba(225,29,72,0.1) 70%, #E11D48 90%, #ff1a40 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
          animation: rotate-wire 2s linear infinite; pointer-events: none; filter: drop-shadow(0 0 8px var(--wire-glow-color-red)); z-index: 1;
        }
        .modal-box.primary::after {
          content: ''; position: absolute; inset: -2px; border-radius: 26px; padding: 2px; 
          background: conic-gradient(from var(--angle), transparent 50%, rgba(59,130,246,0.1) 70%, #2563EB 90%, #60A5FA 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
          animation: rotate-wire 2.5s linear infinite; pointer-events: none; filter: drop-shadow(0 0 8px var(--wire-glow-color-blue)); z-index: 1;
        }

        .modal-content-z { position: relative; z-index: 10; width: 100%; display: flex; flex-direction: column; align-items: center;}

        .modal-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .modal-icon.danger { background: rgba(225,29,72,0.1); border: 1px solid rgba(225,29,72,0.2); color: #E11D48;}
        .modal-icon.primary { background: var(--icon-bg); border: 1px solid rgba(59,130,246,0.3); color: var(--icon-color); box-shadow: 0 0 20px rgba(59,130,246,0.15);}

        .modal-title { font-size: 20px; font-weight: 800; color: var(--text-main); text-align: center; margin-bottom: 10px; }
        .modal-sub   { font-size: 14px; color: var(--text-sub); text-align: center; margin-bottom: 24px; line-height: 1.6; }

        .modal-preview { width: 100%; height: 160px; object-fit: contain; border-radius: 14px; border: 1px solid var(--border); background: rgba(0,0,0,0.1); margin-bottom: 20px; }
        
        .form-label { display: block; font-size: 14px; font-weight: 600; color: var(--text-sub); margin-bottom: 8px; width: 100%; text-align: left; }
        
        .form-select {
          width: 100%; padding: 12px 16px; background: var(--input-bg); border: 1px solid var(--input-border);
          border-radius: 12px; font-size: 14px; color: var(--text-main); outline: none; transition: all 0.2s ease; font-family: 'DM Sans', sans-serif;
          margin-bottom: 24px; appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23888' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 1rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em;
        }
        .form-select:focus { border-color: var(--input-focus); box-shadow: 0 0 0 4px rgba(59,130,246,0.15); }
        .form-select option { background-color: var(--bg-main); color: var(--text-main); }

        .modal-actions { display: flex; gap: 12px; width: 100%; }
        
        .m-btn { flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; font-family: 'DM Sans', sans-serif; display: flex; justify-content: center; align-items: center; gap: 8px;}
        .m-btn-cancel { border: 1px solid var(--border); background: var(--btn-cancel-bg); color: var(--btn-cancel-text); font-weight: 600; }
        .m-btn-cancel:hover { background: var(--search-bg); color: var(--text-main); border-color: var(--search-border); }
        
        .m-btn-delete { background: linear-gradient(135deg, #F43F5E, #E11D48); color: #fff; box-shadow: 0 4px 15px rgba(225,29,72,0.25); }
        .m-btn-delete:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(225,29,72,0.35); }
        
        .m-btn-confirm { background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%); color: #fff; box-shadow: 0 4px 15px rgba(59,130,246,0.25); }
        .m-btn-confirm:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59,130,246,0.35); }
        .m-btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner { width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="theme-container">
        <ParticleCanvas />
        <div className="deco-glow" />

        <div className="content-layer">
          <div className="page-header">
            <div>
              <div className="page-title">Nouvelles Images</div>
              <div className="page-sub">Gérez les images extraites et associez-les à vos produits</div>
            </div>
          </div>

          {loading && (
            <div className="empty-state">
              <Loader2 size={40} color="#3B82F6" style={{ animation: "spin 1s linear infinite" }} />
              <p style={{ color: "var(--text-sub)", marginTop: 16, fontSize: 14, fontWeight: 500 }}>Chargement des images...</p>
            </div>
          )}

          {!loading && images.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon"><LinkIcon size={36} color="#3B82F6" /></div>
              <div className="empty-title">Aucune image en attente</div>
              <div className="empty-sub">Toutes les images extraites ont déjà été associées à un produit.</div>
            </div>
          )}

          {!loading && images.length > 0 && (
            <div className="img-grid" ref={menuRef}>
              {images.map((img) => (
                <div key={img.id} className="img-card">
                  <div className="img-wrap">
                    <span className="new-badge">Nouvelle</span>
                    <img
                      src={img.file_url}
                      alt="nouvelle image"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/220x185/2a2a35/FFFFFF?text=Image+Introuvable"; }}
                    />
                  </div>
                  
                  {/* Bouton 3 points */}
                  <button className="menu-btn" onClick={() => setOpenMenuId(openMenuId === img.id ? null : img.id)} title="Options">
                    <MoreVertical size={18} />
                  </button>

                  {/* Dropdown */}
                  {openMenuId === img.id && (
                    <div className="dropdown">
                      <button className="dropdown-item" onClick={() => openLabelModal(img)}>
                        <LinkIcon size={14} /> Associer au produit
                      </button>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={() => requestDelete(img.id)}>
                        <Trash2 size={14} /> Supprimer l'image
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modale de Suppression (Néon ROUGE) */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-box danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content-z">
              <div className="modal-icon danger"><Trash2 size={28} /></div>
              <h3 className="modal-title">Supprimer l'image ?</h3>
              <p className="modal-sub">Cette action est irréversible. Le fichier sera définitivement supprimé du serveur.</p>
              <div className="modal-actions">
                <button className="m-btn m-btn-cancel" onClick={cancelDelete}>Annuler</button>
                <button className="m-btn m-btn-delete" onClick={confirmDelete}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'Assignation (Néon BLEU OCÉAN) */}
      {showLabelModal && imageToLabel && (
        <div className="modal-overlay" onClick={closeLabelModal}>
          <div className="modal-box primary" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content-z">
              <div className="modal-icon primary"><LinkIcon size={28} /></div>
              <h3 className="modal-title">Associer au produit</h3>
              <p className="modal-sub">Choisissez le produit auquel appartient cette image.</p>
              
              <img
                src={imageToLabel.file_url}
                alt="aperçu"
                className="modal-preview"
                onError={(e) => { e.target.src = "https://via.placeholder.com/400x160/2a2a35/FFFFFF?text=Image+Introuvable"; }}
              />
              
              <label className="form-label">Sélectionnez le produit</label>
              {produitsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-sub)', fontSize: '14px' }}>
                  <Loader2 size={16} className="animate-spin" color="#3B82F6" /> Chargement des produits...
                </div>
              ) : (
                <select className="form-select" value={produitChoisi} onChange={(e) => setProduitChoisi(e.target.value)}>
                  <option value="">-- Choisir un produit --</option>
                  {produits.map((p) => (
                    <option key={p.id} value={p.id}>{labelProduit(p)}</option>
                  ))}
                </select>
              )}

              <div className="modal-actions">
                <button className="m-btn m-btn-cancel" onClick={closeLabelModal}>Annuler</button>
                <button
                  className="m-btn m-btn-confirm"
                  onClick={confirmLabel}
                  disabled={!produitChoisi || assignEnCours || produitsLoading}
                >
                  {assignEnCours ? <><span className="spinner" /> Enregistrement...</> : "Confirmer l'association"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}