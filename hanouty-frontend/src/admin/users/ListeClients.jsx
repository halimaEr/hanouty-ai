import { useEffect, useState, useRef } from "react";
import { userServices } from "../../services/userServices";
import {
  Users, Loader2, AlertTriangle, CheckCircle,
  Trash2, Search, UserCheck, Mail, User
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

// 1. PARTICULES EN ARRIÈRE-PLAN
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

export default function ListClients() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Modal states
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  const loadUsers = () => {
    setLoading(true);
    setError(null);
    userServices
      .getClients()
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Erreur chargement users", err);
        setError("Impossible de charger les clients.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = (id) => {
    userServices
      .supprimerClient(id)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setDeleteId(null);
        setDeleteName("");
      })
      .catch((err) => {
        console.error(err);
        alert("Erreur lors de la suppression.");
      });
  };

  const filtered = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.nom?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div title="Liste des Clients">
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
          --modal-bg: rgba(255, 255, 255, 0.95); 
          --modal-shadow: 0 24px 60px rgba(0,0,0,0.15);
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

        /* ════ HEADER & BADGE ════ */
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .page-title { font-size: 26px; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; transition: color 0.4s; }
        .page-sub   { font-size: 14px; color: var(--text-sub); margin-top: 4px; transition: color 0.4s; }
        
        .count-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
          color: #fff; font-size: 13px; font-weight: 700;
          padding: 8px 18px; border-radius: 20px;
          box-shadow: 0 4px 15px rgba(59,130,246,0.3);
        }

        /* ════ SEARCH BAR ════ */
        .search-bar {
          display: flex; align-items: center; gap: 12px;
          background: var(--search-bg); border: 1px solid var(--search-border); border-radius: 14px; padding: 12px 18px; margin-bottom: 32px; max-width: 400px; 
          transition: all 0.3s; box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .search-bar:focus-within { border-color: #3B82F6; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        .search-bar input { border: none; outline: none; font-size: 14px; color: var(--text-main); background: transparent; flex: 1; font-family: 'DM Sans', sans-serif; }
        .search-bar input::placeholder { color: var(--text-sub); opacity: 0.7; }

        /* ════ LE TABLEAU (GLASSMORPHISM LUXE) ════ */
        .table-container {
          background: var(--bg-card); border-radius: 18px; 
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border); overflow: hidden;
          box-shadow: var(--shadow-card); transition: all 0.3s;
        }
        
        .comp-table { width: 100%; border-collapse: collapse; font-family: 'DM Sans', sans-serif; }
        .comp-table th {
          text-align: left; padding: 18px 20px;
          font-size: 12px; font-weight: 700; color: var(--text-sub); 
          text-transform: uppercase; letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border); 
          background: rgba(59,130,246,0.03); 
        }
        .comp-table td {
          padding: 16px 20px; font-size: 14px; color: var(--text-main); 
          border-bottom: 1px solid var(--border); vertical-align: middle;
        }
        .comp-table tr:last-child td { border-bottom: none; }
        .comp-table tr:hover td { background: rgba(59,130,246,0.04); } 

        /* ════ ÉLÉMENTS DU TABLEAU ════ */
        .user-cell { display: flex; align-items: center; gap: 12px; }
        .user-avatar {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
          border: 1px solid #BFDBFE;
          display: flex; align-items: center; justify-content: center; color: #3B82F6;
          font-weight: 800; font-size: 15px; flex-shrink: 0; box-shadow: 0 4px 10px rgba(59,130,246,0.1);
        }
        html.dark .user-avatar {
          background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.2));
          border-color: rgba(59,130,246,0.3); color: #60A5FA;
        }
        .user-name { font-weight: 700; color: var(--text-main); }

        .badge-email {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 20px; font-size: 12.5px;
          font-weight: 600; background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2);
        }

        /* ════ BOUTONS D'ACTION (GHOST) ════ */
        .action-btn {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid transparent;
          display: inline-flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; background: transparent;
        }
        .btn-del-action { color: #E11D48; }
        .btn-del-action:hover { background: rgba(225,29,72,0.1); border-color: rgba(225,29,72,0.3); transform: translateY(-2px); }

        /* ════ EMPTY & ERROR STATES ════ */
        .empty-state, .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; }
        .empty-icon { width: 80px; height: 80px; border-radius: 24px; background: rgba(59,130,246,0.08); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 0 30px rgba(59,130,246,0.05); }
        .empty-title { font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 8px; }
        .empty-sub   { font-size: 14px; color: var(--text-sub); margin-bottom: 28px; max-width: 300px; line-height: 1.5; }
        .retry-btn { margin-top: 16px; padding: 10px 24px; border-radius: 10px; background: rgba(59,130,246,0.1); color: #3B82F6; border: 1px solid rgba(59,130,246,0.2); font-weight: 600; cursor: pointer; transition: all 0.2s; }

        /* ════ MODALES ANIMÉES (FIL NÉON) ════ */
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
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* Effet Néon Rouge (Delete) */
        .modal-box.danger::after {
          content: ''; position: absolute; inset: -2px; border-radius: 26px; padding: 2px; 
          background: conic-gradient(from var(--angle), transparent 50%, rgba(225,29,72,0.1) 70%, #E11D48 90%, #ff1a40 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
          animation: rotate-wire 2s linear infinite; pointer-events: none; filter: drop-shadow(0 0 8px rgba(225,29,72,0.6)); z-index: 1;
        }

        .modal-content-z { position: relative; z-index: 10; width: 100%; display: flex; flex-direction: column; align-items: center;}

        .modal-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .modal-icon.danger { background: rgba(225,29,72,0.1); border: 1px solid rgba(225,29,72,0.2); color: #E11D48;}

        .modal-title { font-size: 20px; font-weight: 800; color: var(--text-main); text-align: center; margin-bottom: 10px; }
        .modal-sub   { font-size: 14px; color: var(--text-sub); text-align: center; margin-bottom: 24px; line-height: 1.6; }
        .modal-name  { font-weight: 700; color: var(--text-main); }

        .modal-actions { display: flex; gap: 12px; width: 100%; }
        .m-btn { flex: 1; padding: 12px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; font-family: 'DM Sans', sans-serif; display: flex; justify-content: center; align-items: center; gap: 8px;}
        .m-btn-cancel { border: 1px solid var(--border); background: transparent; color: var(--text-sub); font-weight: 600; }
        .m-btn-cancel:hover { background: var(--search-bg); color: var(--text-main); border-color: var(--search-border); }
        
        .m-btn-delete { background: linear-gradient(135deg, #F43F5E, #E11D48); color: #fff; box-shadow: 0 4px 15px rgba(225,29,72,0.25); }
        .m-btn-delete:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(225,29,72,0.35); }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="theme-container">
        <ParticleCanvas />
        <div className="deco-glow" />
        
        <div className="content-layer">
          {/* Header */}
          <div className="page-header">
            <div>
              <div className="page-title">Liste des Clients</div>
              <div className="page-sub">Consultez et gérez les comptes validés de la plateforme</div>
            </div>
            {!loading && !error && (
              <div className="count-badge">
                <Users size={16} />
                {users.length} clients
              </div>
            )}
          </div>

          {/* Search */}
          {!loading && !error && users.length > 0 && (
            <div className="search-bar">
              <Search size={18} color="var(--text-sub)" />
              <input
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="empty-state">
              <Loader2 size={40} color="#3B82F6" style={{ animation: "spin 1s linear infinite" }} />
              <p style={{ color: "var(--text-sub)", marginTop: 16, fontSize: 14, fontWeight: 500 }}>Chargement des clients...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="empty-state">
              <AlertTriangle size={48} color="#E11D48" />
              <p style={{ color: "var(--text-main)", fontWeight: 800, marginTop: 16, fontSize: 16 }}>{error}</p>
              <button className="retry-btn" onClick={loadUsers}>Réessayer</button>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Users size={36} color="#3B82F6" />
                </div>
                <div className="empty-title">Aucun client trouvé</div>
                <div className="empty-sub">
                  {search
                    ? `Aucun résultat pour "${search}"`
                    : "La liste des clients est vide pour le moment."}
                </div>
              </div>
            ) : (
              <div className="table-container">
                <table className="comp-table">
                  <thead>
                    <tr>
                      <th style={{ width: "45%" }}>Utilisateur</th>
                      <th style={{ width: "45%" }}>Email</th>
                      <th style={{ width: "10%", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => (
                      <tr key={user.id}>
                        {/* Name */}
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              {user.nom?.charAt(0)?.toUpperCase() || <User size={16} />}
                            </div>
                            <span className="user-name">{user.nom}</span>
                          </div>
                        </td>
                        {/* Email */}
                        <td>
                          <span className="badge-email">
                            <Mail size={12} /> {user.email}
                          </span>
                        </td>
                        {/* Actions */}
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                            <button
                              className="action-btn btn-del-action"
                              title="Supprimer"
                              onClick={() => { setDeleteId(user.id); setDeleteName(user.nom); }}
                            >
                              <Trash2 size={18} />
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

      {/* Delete Modal (Red Neon) */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box danger" onClick={(e) => e.stopPropagation()}>
             <div className="modal-content-z">
              <div className="modal-icon danger">
                <Trash2 size={28} />
              </div>
              <div className="modal-title">Supprimer le client ?</div>
              <div className="modal-sub">
                Le compte de <span className="modal-name">"{deleteName}"</span> sera définitivement supprimé. Cette action est irréversible.
              </div>
              <div className="modal-actions">
                <button className="m-btn m-btn-cancel" onClick={() => setDeleteId(null)}>Annuler</button>
                <button className="m-btn m-btn-delete" onClick={() => handleDelete(deleteId)}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}