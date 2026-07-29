import { useEffect, useRef, useState } from "react";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8000";
const PAGE_SIZE = 10;

// ── Helpers ────────────────────────────────────────────────────────────────
async function apiFetch(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Particle Canvas (identique UserDash) ──────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const COLORS = ["#3B82F6","#60A5FA","#93C5FD","#0EA5E9","#38BDF8"];
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.38, dy: (Math.random() - 0.5) * 0.38,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: Math.random() * 0.6 + 0.4,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x = (p.x + p.dx + canvas.width)  % canvas.width;
        p.y = (p.y + p.dy + canvas.height) % canvas.height;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.a; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 88) {
            ctx.beginPath(); ctx.strokeStyle = "#3B82F6";
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
  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0, opacity:"var(--particle-op)", transition:"opacity 0.5s ease" }} />;
}

// ── SVG Icons ──────────────────────────────────────────────────────────────
const IconBox      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconGrid     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconTag      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IconImage    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IconUsers    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconSparkle  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2z"/></svg>;
const IconSearch   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconChevronL = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IconChevronR = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

// ── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ icon, color, label, value, sub, badge }) {
  return (
    <div style={{
      background:"var(--glass-bg)", border:"1px solid var(--border)", borderRadius:"18px",
      padding:"24px", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
      flex:1, minWidth:"160px", boxShadow:"0 4px 30px rgba(0,0,0,0.04)",
      display:"flex", flexDirection:"column", gap:"14px", position:"relative", overflow:"hidden",
    }}>
      {/* Accent top bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"3px", background:color, borderRadius:"18px 18px 0 0" }} />
      {/* Icon */}
      <div style={{ width:"42px", height:"42px", borderRadius:"12px", background:`${color}22`, display:"flex", alignItems:"center", justifyContent:"center", color }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:"11px", color:"var(--text-sub)", fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:"6px" }}>{label}</div>
        <div style={{ fontSize:"32px", fontWeight:800, color:"var(--text-main)", letterSpacing:"-1px", lineHeight:1 }}>{value ?? "—"}</div>
      </div>
      {(sub || badge) && (
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          {badge && (
            <span style={{ fontSize:"11px", fontWeight:700, padding:"3px 8px", borderRadius:"20px", background:`${color}22`, color }}>
              {badge}
            </span>
          )}
          {sub && <span style={{ fontSize:"12px", color:"var(--text-sub)" }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

// ── Tableau paginable images/produit ──────────────────────────────────────
function ImagesTable({ data, loading, erreur }) {
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [sortDir, setSortDir] = useState("desc"); // "desc" | "asc"

  const filtered = (data || [])
    .filter((r) => r.produit.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === "desc" ? b.images - a.images : a.images - b.images);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const maxImg     = Math.max(...(data || []).map((r) => r.images), 1);

  // Reset page on search/sort
  useEffect(() => { setPage(1); }, [search, sortDir]);

  if (loading) return <p style={{ color:"var(--text-sub)", fontSize:"14px" }}>Chargement du catalogue...</p>;
  if (erreur)  return <div style={{ padding:"14px 18px", background:"rgba(225,29,72,0.1)", border:"1px solid rgba(225,29,72,0.3)", borderRadius:"12px", color:"#E11D48", fontSize:"14px", fontWeight:600 }}>⚠️ {erreur}</div>;
  if (!data?.length) return <p style={{ color:"var(--text-sub)", fontSize:"14px" }}>Aucune donnée disponible.</p>;

  return (
    <div>
      {/* Barre de recherche + tri */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"20px", flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:"200px" }}>
          <span style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"var(--text-sub)" }}>
            <IconSearch />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            style={{
              width:"100%", padding:"10px 14px 10px 36px", borderRadius:"12px",
              border:"1px solid var(--border)", background:"var(--glass-bg)",
              color:"var(--text-main)", fontSize:"14px", fontFamily:"'DM Sans',sans-serif",
              outline:"none", boxSizing:"border-box", backdropFilter:"blur(8px)",
            }}
          />
        </div>
        <button
          onClick={() => setSortDir((d) => d === "desc" ? "asc" : "desc")}
          style={{
            padding:"10px 16px", borderRadius:"12px", border:"1px solid var(--border)",
            background:"var(--glass-bg)", color:"var(--text-main)", fontSize:"13px",
            fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
            display:"flex", alignItems:"center", gap:"6px", backdropFilter:"blur(8px)",
          }}
        >
          Images {sortDir === "desc" ? "↓" : "↑"}
        </button>
      </div>

      {/* Compteur */}
      <div style={{ fontSize:"12px", color:"var(--text-sub)", marginBottom:"12px", fontWeight:500 }}>
        {filtered.length} produit{filtered.length !== 1 ? "s" : ""} • Page {page}/{totalPages}
      </div>

      {/* Table */}
      <div style={{ borderRadius:"14px", overflow:"hidden", border:"1px solid var(--border)" }}>
        {/* Header */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 2fr", background:"rgba(59,130,246,0.08)", padding:"12px 20px", borderBottom:"1px solid var(--border)" }}>
          {["Produit","Images","Répartition"].map((h, i) => (
            <div key={i} style={{ fontSize:"11px", fontWeight:700, color:"var(--text-sub)", textTransform:"uppercase", letterSpacing:"0.6px" }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {slice.map((row, i) => {
          const pct = Math.round((row.images / maxImg) * 100);
          const isEven = i % 2 === 0;
          return (
            <div
              key={i}
              style={{
                display:"grid", gridTemplateColumns:"2fr 1fr 2fr",
                padding:"14px 20px", alignItems:"center",
                background: isEven ? "transparent" : "rgba(59,130,246,0.03)",
                borderBottom: i < slice.length - 1 ? "1px solid var(--border)" : "none",
                transition:"background 0.15s",
              }}
            >
              {/* Nom produit */}
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{
                  width:"8px", height:"8px", borderRadius:"50%", flexShrink:0,
                  background: row.images === 0 ? "#F43F5E" : row.images < 10 ? "#F59E0B" : "#22C55E",
                }} />
                <span style={{ fontSize:"14px", fontWeight:600, color:"var(--text-main)" }}>
                  {row.produit}
                </span>
              </div>
              {/* Nombre images */}
              <div>
                <span style={{
                  fontSize:"14px", fontWeight:800, color:"var(--text-main)",
                  padding:"3px 10px", borderRadius:"8px",
                  background: row.images === 0 ? "rgba(244,63,94,0.1)" : "rgba(59,130,246,0.1)",
                  color: row.images === 0 ? "#F43F5E" : "#3B82F6",
                }}>
                  {row.images}
                </span>
              </div>
              {/* Barre de progression */}
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ flex:1, height:"6px", background:"var(--border)", borderRadius:"99px", overflow:"hidden" }}>
                  <div style={{
                    width:`${pct}%`, height:"100%", borderRadius:"99px",
                    background: row.images === 0
                      ? "#F43F5E"
                      : `linear-gradient(90deg, #3B82F6, #60A5FA)`,
                    transition:"width 0.4s ease",
                  }} />
                </div>
                <span style={{ fontSize:"11px", color:"var(--text-sub)", fontWeight:600, minWidth:"30px" }}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"16px", flexWrap:"wrap", gap:"10px" }}>
        <span style={{ fontSize:"12px", color:"var(--text-sub)" }}>
          {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length}
        </span>
        <div style={{ display:"flex", gap:"6px" }}>
          {/* Première */}
          <PageBtn disabled={page === 1} onClick={() => setPage(1)}>«</PageBtn>
          <PageBtn disabled={page === 1} onClick={() => setPage((p) => p - 1)}><IconChevronL /></PageBtn>
          {/* Pages numérotées */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…"
                ? <span key={`e${i}`} style={{ padding:"0 6px", color:"var(--text-sub)", fontSize:"13px" }}>…</span>
                : <PageBtn key={p} active={p === page} onClick={() => setPage(p)}>{p}</PageBtn>
            )
          }
          <PageBtn disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><IconChevronR /></PageBtn>
          {/* Dernière */}
          <PageBtn disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</PageBtn>
        </div>
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width:"32px", height:"32px", borderRadius:"8px", border:"1px solid var(--border)",
        background: active ? "#3B82F6" : "var(--glass-bg)",
        color: active ? "#fff" : disabled ? "var(--text-sub)" : "var(--text-main)",
        fontSize:"13px", fontWeight:700, cursor: disabled ? "not-allowed" : "pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'DM Sans',sans-serif", opacity: disabled ? 0.4 : 1,
        transition:"all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

// ── Composant principal ────────────────────────────────────────────────────
export default function AdminDash() {
  const [kpis, setKpis]               = useState(null);
  const [catalogue, setCatalogue]     = useState([]);
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [loadingCat, setLoadingCat]   = useState(false);
  const [erreurKpis, setErreurKpis]   = useState(null);
  const [erreurCat, setErreurCat]     = useState(null);

  // ── KPIs admin ─────────────────────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    async function load() {
      try {
        setLoadingKpis(true);
        const data = await apiFetch(`${BASE_URL}/dashboard/admin/kpis`, ctrl.signal);
        setKpis(data);
      } catch (e) {
        if (e.name === "AbortError") return;
        setErreurKpis("Impossible de charger les KPIs.");
      } finally { setLoadingKpis(false); }
    }
    load();
    return () => ctrl.abort();
  }, []);

  // ── Images par produit ──────────────────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    async function load() {
      try {
        setLoadingCat(true);
        const data = await apiFetch(`${BASE_URL}/dashboard/admin/images-per-product`, ctrl.signal);
        setCatalogue(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name === "AbortError") return;
        setErreurCat("Impossible de charger le catalogue.");
      } finally { setLoadingCat(false); }
    }
    load();
    return () => ctrl.abort();
  }, []);

  // KPI cards config
  const kpiCards = [
    { icon:<IconBox />,     color:"#3B82F6", label:"Produits",     value: kpis?.total_products,    sub:"dans le catalogue" },
    { icon:<IconGrid />,    color:"#8B5CF6", label:"Catégories",   value: kpis?.total_categories,  sub:"actives" },
    { icon:<IconTag />,     color:"#0EA5E9", label:"Marques",      value: kpis?.total_marques,     sub:"référencées" },
    { icon:<IconImage />,   color:"#10B981", label:"Total Images", value: kpis?.total_images?.toLocaleString("fr-MA"), sub:"dans la base" },
    { icon:<IconUsers />,   color:"#F59E0B", label:"Clients",      value: kpis?.total_clients,     sub:"comptes actifs" },
    { icon:<IconSparkle />, color:"#F43F5E", label:"Nouvelles Images", value: kpis?.new_images,
      sub:"ajoutées récemment" },
  ];

  // Stats rapides pour les produits sans image
  const sanImages    = catalogue.filter((r) => r.images === 0).length;
  const avecImages   = catalogue.filter((r) => r.images > 0).length;
  const moyImages    = catalogue.length ? (catalogue.reduce((a, r) => a + r.images, 0) / catalogue.length).toFixed(1) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

        .theme-container {
          --bg-main: transparent;
          --bg-pattern: rgba(59,130,246,0.06);
          --text-main: #0F172A;
          --text-sub: #64748B;
          --border: #E2E8F0;
          --glass-bg: rgba(255,255,255,0.85);
          --particle-op: 0.6;
          --glow-op: 0;
        }
        html.dark .theme-container {
          --text-main: #F8FAFC;
          --text-sub: rgba(255,255,255,0.6);
          --border: rgba(59,130,246,0.15);
          --glass-bg: rgba(15,23,42,0.5);
          --particle-op: 1;
          --glow-op: 1;
        }
        .theme-container {
          position:relative; background:var(--bg-main); min-height:100%;
          border-radius:20px; overflow:hidden; font-family:'DM Sans',sans-serif;
          box-sizing:border-box; transition:background 0.4s ease;
          display:flex; flex-direction:column;
        }
        .theme-container::before {
          content:''; position:absolute; inset:0; z-index:0;
          background-image:radial-gradient(var(--bg-pattern) 1px,transparent 1px);
          background-size:24px 24px;
        }
        .deco-glow {
          position:absolute; width:600px; height:600px; border-radius:50%;
          background:radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%);
          top:10%; left:10%; pointer-events:none; z-index:0;
          opacity:var(--glow-op); transition:opacity 0.5s ease;
        }
        .content-layer { position:relative; z-index:10; width:100%; }
        .page-title { font-size:28px; font-weight:800; color:var(--text-main); letter-spacing:-0.5px; }
        .page-sub   { font-size:14px; color:var(--text-sub); margin-top:6px; line-height:1.6; }
        .section-label {
          font-size:11px; font-weight:700; letter-spacing:1px;
          text-transform:uppercase; color:var(--text-sub);
          margin-bottom:16px; margin-top:36px;
          display:flex; align-items:center; gap:8px;
        }
        .section-label::after {
          content:''; flex:1; height:1px; background:var(--border);
        }
        .glass-card {
          background:var(--glass-bg); border:1px solid var(--border); border-radius:20px;
          padding:32px; backdropFilter:blur(16px); WebkitBackdropFilter:blur(16px);
          boxShadow:0 4px 30px rgba(0,0,0,0.03);
        }
        input:focus { border-color:#3B82F6 !important; box-shadow:0 0 0 3px rgba(59,130,246,0.12) !important; }
        .stat-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 14px; border-radius:99px; font-size:13px; font-weight:700;
          border:1px solid var(--border); background:var(--glass-bg);
        }
      `}</style>

      <div className="theme-container">
        <ParticleCanvas />
        <div className="deco-glow" />

        <div className="content-layer">

          {/* ── Header ── */}
          <div style={{ marginBottom:"32px" }}>
            <div className="page-title">Espace Administrateur</div>
            <div className="page-sub">Vue d'ensemble et gestion globale de la plateforme Hanouty.AI</div>
          </div>

          {/* ── KPI Cards ── */}
          <div className="section-label">Vue globale de la plateforme</div>
          {loadingKpis ? (
            <p style={{ color:"var(--text-sub)", fontSize:"14px" }}>Chargement des indicateurs...</p>
          ) : erreurKpis ? (
            <div style={{ padding:"14px 18px", background:"rgba(225,29,72,0.1)", border:"1px solid rgba(225,29,72,0.3)", borderRadius:"12px", color:"#E11D48", fontSize:"14px", fontWeight:600 }}>⚠️ {erreurKpis}</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:"16px" }}>
              {kpiCards.map((c, i) => <KpiCard key={i} {...c} />)}
            </div>
          )}

          {/* ── Stats rapides catalogue (si data chargée) ── */}
          {catalogue.length > 0 && (
            <>
              <div className="section-label">Santé du catalogue image</div>
              <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                <div className="stat-pill" style={{ color:"#22C55E" }}>
                  <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#22C55E", display:"inline-block" }} />
                  {avecImages} avec images
                </div>
                <div className="stat-pill" style={{ color:"#F43F5E" }}>
                  <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#F43F5E", display:"inline-block" }} />
                  {sanImages} sans image
                </div>
                <div className="stat-pill" style={{ color:"var(--text-main)" }}>
                  Moy. {moyImages} img/produit
                </div>
                <div className="stat-pill" style={{ color:"#3B82F6" }}>
                  {catalogue.length} produits total
                </div>
              </div>
            </>
          )}

          {/* ── Tableau images/produit ── */}
          <div className="section-label">Images par produit</div>
          <div style={{
            background:"var(--glass-bg)", border:"1px solid var(--border)", borderRadius:"20px",
            padding:"32px", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
            boxShadow:"0 4px 30px rgba(0,0,0,0.03)",
          }}>
            <div style={{ fontSize:"18px", fontWeight:800, color:"var(--text-main)", marginBottom:"6px" }}>
              Catalogue produits — couverture image
            </div>
            <div style={{ fontSize:"13px", color:"var(--text-sub)", marginBottom:"24px" }}>
              <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}><span style={{width:"8px",height:"8px",borderRadius:"50%",background:"#22C55E",display:"inline-block"}}/> Bien couvert</span>
              &nbsp;·&nbsp;
              <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}><span style={{width:"8px",height:"8px",borderRadius:"50%",background:"#F59E0B",display:"inline-block"}}/> Peu d'images</span>
              &nbsp;·&nbsp;
              <span style={{display:"inline-flex",alignItems:"center",gap:"5px"}}><span style={{width:"8px",height:"8px",borderRadius:"50%",background:"#F43F5E",display:"inline-block"}}/> Aucune image</span>
            </div>
            <ImagesTable data={catalogue} loading={loadingCat} erreur={erreurCat} />
          </div>

        </div>
      </div>
    </>
  );
}