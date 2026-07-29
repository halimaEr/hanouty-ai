import React, { useEffect, useRef, useState } from "react";
import { authServices } from "../services/authServices";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
  Cell,
} from "recharts";

const MOIS = ["", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const JOURS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const ANNEE_COURANTE = new Date().getFullYear();
const ANNEES_DISPONIBLES = Array.from({ length: 5 }, (_, i) => ANNEE_COURANTE - i);
const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:8000";

const TOP7_COLORS = [
  "#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#7CB9FC", "#93C5FD", "#BFDBFE",
];

// ── SVG Icons ──────────────────────────────────────────────────────────────
const IconVentes = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#60A5FA" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconPanier = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconBox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconCA = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

// ── Particle canvas ────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#0EA5E9", "#38BDF8"];
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.8,
      dx: (Math.random() - 0.5) * 0.38, dy: (Math.random() - 0.5) * 0.38,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: Math.random() * 0.7 + 0.5,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x = (p.x + p.dx + canvas.width) % canvas.width;
        p.y = (p.y + p.dy + canvas.height) % canvas.height;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.a; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 100) {
            ctx.beginPath(); ctx.strokeStyle = "#3B82F6";
            ctx.globalAlpha = (1 - d / 100) * 0.45;
            ctx.lineWidth = 1; ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1; animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0, opacity: "var(--particle-op)", transition: "opacity 0.5s ease",
    }} />
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ icon, iconBg, title, value, sub, delta, deltaPositive }) {
  return (
    <div style={{
      background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "16px",
      padding: "20px 24px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      flex: 1, minWidth: "200px", boxShadow: "0 4px 30px rgba(0,0,0,0.03)",
      display: "flex", flexDirection: "column", gap: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px", background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-sub)", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
          {title}
        </div>
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.5px", lineHeight: 1 }}>
        {value}
      </div>
      {(sub || delta !== undefined) && (
        <div style={{ fontSize: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
          {delta !== undefined && (
            <span style={{ color: deltaPositive ? "#22C55E" : "#F43F5E", fontWeight: 700 }}>
              {typeof delta === "number" && delta > 0 ? `+${delta}` : delta}
            </span>
          )}
          {sub && <span style={{ color: "var(--text-sub)" }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "20px",
      padding: "32px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      boxShadow: "0 4px 30px rgba(0,0,0,0.03)", width: "100%",
    }}>
      <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)", marginBottom: "24px" }}>{title}</div>
      {children}
    </div>
  );
}

// ── Tooltips ───────────────────────────────────────────────────────────────
const tooltipStyle = {
  background: "var(--glass-bg)", border: "1px solid var(--border)", borderRadius: "12px",
  padding: "10px 16px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)", fontFamily: "'DM Sans', sans-serif",
};

function Top7Tooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "14px", marginBottom: "4px" }}>
        {payload[0].payload.produit}
      </div>
      <div style={{ color: "#60A5FA", fontWeight: 700, fontSize: "13px" }}>Quantité : {payload[0].value}</div>
    </div>
  );
}

// ── FIX 1 : CAJourTooltip accepte selectedMonth en prop ──────────────────
function CAJourTooltip({ active, payload, label, selectedMonth }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "13px", marginBottom: "3px" }}>
        {label} {MOIS[selectedMonth]}
      </div>
      <div style={{ color: "#60A5FA", fontWeight: 700, fontSize: "13px" }}>
        {payload[0].value.toLocaleString("fr-MA")} MAD
      </div>
    </div>
  );
}

function CustomYTick({ x, y, payload }) {
  const label = payload.value.length > 18 ? payload.value.slice(0, 16) + "…" : payload.value;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="var(--text-sub)" fontSize={12} fontFamily="'DM Sans', sans-serif" fontWeight={500}>
      {label}
    </text>
  );
}

// ── Utilitaire : formate la date "2026-05-05" en "Mardi 5 Mai" ─────────────
function formatMeilleurJour(dateStr) {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  const d = new Date(year, month - 1, day);
  if (isNaN(d)) return dateStr;
  const nomJour = JOURS_FR[d.getDay()];
  const mois = MOIS[month];
  return `${nomJour} ${day} ${mois}`;
}

// ── Composant principal ────────────────────────────────────────────────────
export default function UserDash() {
  const [quantites,       setQuantites]       = useState([]);
  const [chiffreAffaire,  setChiffreAffaire]  = useState([]);
  const [top7,            setTop7]            = useState([]);
  const [kpis,            setKpis]            = useState(null);
  const [caParJour,       setCaParJour]       = useState([]);

  const [loading,         setLoading]         = useState(false);
  const [loadingTop7,     setLoadingTop7]     = useState(false);
  const [loadingKpis,     setLoadingKpis]     = useState(false);
  const [loadingCaJour,   setLoadingCaJour]   = useState(false);

  const [erreur,          setErreur]          = useState(null);
  const [erreurTop7,      setErreurTop7]      = useState(null);

  const [userId,          setUserId]          = useState(null);
  const [selectedYear,    setSelectedYear]    = useState(ANNEE_COURANTE);
  const [selectedMonth,   setSelectedMonth]   = useState(new Date().getMonth() + 1);

  const moisCourant  = new Date().getMonth() + 1;
  const isCurrentYear = selectedYear === ANNEE_COURANTE;

  const periodeLabel = selectedMonth && selectedYear
    ? `${MOIS[selectedMonth]} ${selectedYear}`
    : `${MOIS[moisCourant]} ${ANNEE_COURANTE}`;

  // ── Récupérer l'utilisateur connecté ──
  useEffect(() => {
    authServices.getUserConnecte()
      .then((res) => {
        const id = res?.data?.id;
        if (!id) throw new Error("ID introuvable.");
        setUserId(id);
      })
      .catch(() => setErreur("Impossible d'identifier l'utilisateur connecté."));
  }, []);

  // ── Stats annuelles (quantités + CA par mois) ──
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const { signal } = controller;

    async function chargerDonnees() {
      try {
        setLoading(true); setErreur(null);
        const token = authServices.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const [resQ, resCA] = await Promise.all([
          fetch(`${BASE_URL}/dashboard/quantite-par-mois/${userId}?year=${selectedYear}`, { headers, signal }),
          fetch(`${BASE_URL}/dashboard/chiffre-affaire/${userId}?year=${selectedYear}`, { headers, signal }),
        ]);
        if (!resQ.ok || !resCA.ok) throw new Error("Erreur données.");
        const q  = await resQ.json();
        const ca = await resCA.json();
        setQuantites(Array.isArray(q)  ? q.map((i) => ({ mois: MOIS[i.month], quantite: i.quantite })) : []);
        setChiffreAffaire(Array.isArray(ca) ? ca.map((i) => ({ mois: MOIS[i.month], ca: i.ca })) : []);
      } catch (err) {
        if (err.name === "AbortError") return;
        setErreur("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    }
    chargerDonnees();
    return () => controller.abort();
  }, [userId, selectedYear]);

  // ── Top 7 produits ──
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const { signal } = controller;

    async function chargerTop7() {
      try {
        setLoadingTop7(true); setErreurTop7(null);
        const token = authServices.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${BASE_URL}/dashboard/top-7-produits/${userId}`, { headers, signal });
        if (!res.ok) throw new Error("Erreur Top 7.");
        const data = await res.json();
        setTop7(Array.isArray(data) ? [...data].sort((a, b) => a.quantite - b.quantite) : []);
      } catch (err) {
        if (err.name === "AbortError") return;
        setErreurTop7("Impossible de charger le top 7 produits.");
      } finally {
        setLoadingTop7(false);
      }
    }
    chargerTop7();
    return () => controller.abort();
  }, [userId]);

  // ── KPIs du mois ──
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const { signal } = controller;

    async function chargerKpis() {
      try {
        setLoadingKpis(true);
        const token = authServices.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // FIX 2 : on passe aussi le mois sélectionné aux KPIs
        const res = await fetch(
          `${BASE_URL}/dashboard/kpis/${userId}?year=${selectedYear}&month=${selectedMonth}`,
          { headers, signal }
        );
        if (!res.ok) throw new Error("Erreur KPIs.");
        const data = await res.json();
        setKpis(data);
      } catch (err) {
        if (err.name === "AbortError") return;
      } finally {
        setLoadingKpis(false);
      }
    }
    chargerKpis();
    return () => controller.abort();
  }, [userId, selectedYear, selectedMonth]); // FIX 2 : selectedMonth ajouté

  // ── CA jour par jour du mois sélectionné ──
  useEffect(() => {
    if (!userId || !selectedMonth) return;
    const controller = new AbortController();
    const { signal } = controller;

    async function chargerCaJour() {
      try {
        setLoadingCaJour(true);
        setCaParJour([]); // FIX 3 : vider avant de charger pour éviter données obsolètes
        const token = authServices.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(
          `${BASE_URL}/dashboard/stats/ca-jour?year=${selectedYear}&month=${selectedMonth}&user_id=${userId}`,
          { headers, signal }
        );
        if (!res.ok) throw new Error("Erreur CA jour");
        const data = await res.json();
        // FIX 4 : protection robuste contre les structures API variantes
        if (Array.isArray(data)) {
          setCaParJour(
            data.map((d) => ({
              jour: d.day ?? d.jour ?? d.date ?? 0,
              ca:   d.ca  ?? d.chiffre_affaire ?? d.total ?? 0,
            }))
          );
        } else {
          setCaParJour([]);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setCaParJour([]);
      } finally {
        setLoadingCaJour(false);
      }
    }
    chargerCaJour();
    return () => controller.abort();
  }, [userId, selectedYear, selectedMonth]);

  // ── FIX 5 : Réinitialiser le mois quand l'année change ──
  // On ne reset plus vers mois=1 si l'année est passée — on garde le mois
  // sélectionné s'il est valide, sinon on revient à décembre (dernier mois de l'année)
  useEffect(() => {
    if (isCurrentYear) {
      // Si on revient sur l'année courante et que le mois sélectionné est dans le futur
      if (selectedMonth > moisCourant) {
        setSelectedMonth(moisCourant);
      }
    }
    // Pour les années passées : tous les mois sont valides, on ne change rien
  }, [selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalQty = quantites.reduce((acc, i) => acc + i.quantite, 0);
  const totalCA  = chiffreAffaire.reduce((acc, i) => acc + i.ca, 0).toFixed(2);

  const caJourDebut = caParJour[0]?.ca ?? 0;
  const caJourFin   = caParJour[caParJour.length - 1]?.ca ?? 0;

  // FIX 6 : tous les 12 mois affichés, mois futurs désactivés (non masqués)
  const tousLesMois = Array.from({ length: 12 }, (_, i) => i + 1);

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
          --particle-op: 0.85;
          --glow-op: 0;
        }
        html.dark .theme-container {
          --bg-main: transparent;
          --bg-pattern: rgba(59,130,246,0.04);
          --text-main: #F8FAFC;
          --text-sub: rgba(255,255,255,0.6);
          --border: rgba(59,130,246,0.15);
          --glass-bg: rgba(15,23,42,0.5);
          --particle-op: 1;
          --glow-op: 1;
        }
        .theme-container {
          position: relative; background: var(--bg-main); min-height: 100%;
          border-radius: 20px; overflow: hidden; font-family: 'DM Sans', sans-serif;
          box-sizing: border-box; transition: background 0.4s ease, border-color 0.4s ease;
          display: flex; flex-direction: column;
        }
        .theme-container::before {
          content: ''; position: absolute; inset: 0; z-index: 0;
          background-image: radial-gradient(var(--bg-pattern) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .deco-glow {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
          top: 10%; left: 10%; pointer-events: none; z-index: 0;
          opacity: var(--glow-op); transition: opacity 0.5s ease;
        }
        .content-layer { position: relative; z-index: 10; width: 100%; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .page-title  { font-size: 26px; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; }
        .page-sub    { font-size: 14px; color: var(--text-sub); margin-top: 4px; max-width: 600px; line-height: 1.6; }
        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          color: var(--text-sub); margin-bottom: 16px; margin-top: 32px;
        }
        .year-select {
          appearance: none; padding: 10px 36px 10px 16px; border-radius: 12px;
          border: 1px solid var(--border); background: var(--glass-bg);
          color: var(--text-main); font-size: 14px; font-family: 'DM Sans', sans-serif;
          font-weight: 700; cursor: pointer; backdrop-filter: blur(12px);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center;
          transition: border-color 0.2s ease; outline: none;
        }
        .year-select:hover { border-color: #3B82F6; }
        .year-select:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .year-select option { background: #0B1120; color: #F8FAFC; }
        html:not(.dark) .year-select option { background: #FFFFFF; color: #0F172A; }
        .year-select option:disabled { color: #94A3B8; }
        .error-box   { margin-top: 32px; padding: 16px 20px; background: rgba(225,29,72,0.1); border: 1px solid rgba(225,29,72,0.3); border-radius: 12px; color: #E11D48; font-size: 14px; font-weight: 600; }
        .loading-box { margin-top: 32px; color: var(--text-sub); font-size: 14px; font-weight: 600; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 800px) { .two-col { grid-template-columns: 1fr; } }
        .rank-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 6px; font-size: 11px; font-weight: 800;
          color: #fff; background: linear-gradient(135deg, #3B82F6, #1D4ED8); flex-shrink: 0;
        }
        .recharts-cartesian-axis-tick-value { fill: var(--text-sub) !important; font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 500; }
        .recharts-tooltip-wrapper .recharts-default-tooltip { background: var(--glass-bg) !important; border: 1px solid var(--border) !important; border-radius: 12px !important; color: var(--text-main) !important; font-family: 'DM Sans', sans-serif; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
      `}</style>

      <div className="theme-container">
        <ParticleCanvas />
        <div className="deco-glow" />

        <div className="content-layer">

          {/* ── En-tête avec sélecteurs Mois / Année ── */}
          <div className="page-header">
            <div>
              <div className="page-title">Tableau de bord</div>
              <div className="page-sub">
                Vue d'ensemble de votre espace Hanouty.AI — {periodeLabel}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>

              {/* FIX 6 : Sélecteur de mois — tous les 12 mois visibles, futurs désactivés */}
              <select
                className="year-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                title="Sélectionner un mois"
              >
                {tousLesMois.map((m) => (
                  <option
                    key={m}
                    value={m}
                    disabled={isCurrentYear && m > moisCourant}
                  >
                    {MOIS[m]}{isCurrentYear && m > moisCourant ? " —" : ""}
                  </option>
                ))}
              </select>

              {/* Sélecteur d'année */}
              <select
                className="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                title="Sélectionner une année"
              >
                {ANNEES_DISPONIBLES.map((annee) => (
                  <option key={annee} value={annee}>{annee}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── KPIs du mois (API) ── */}
          <div className="section-label">KPIs — {periodeLabel}</div>
          {loadingKpis ? (
            <div className="loading-box">Chargement des KPIs...</div>
          ) : (
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <KpiCard
                icon={<IconVentes />} iconBg="rgba(59,130,246,0.15)"
                title="Ventes ce mois"
                value={kpis?.ventes_ce_mois ?? "—"}
                sub="transactions ce mois"
              />
              <KpiCard
                icon={<IconStar />} iconBg="rgba(34,197,94,0.15)"
                title="Produit Star"
                value={kpis?.produit_star?.nom ?? "—"}
                sub={kpis?.produit_star?.total_vendu != null ? `${kpis.produit_star.total_vendu} unités vendues` : undefined}
              />
              <KpiCard
                icon={<IconPanier />} iconBg="rgba(167,139,250,0.15)"
                title="Panier Moyen"
                value={kpis?.panier_moyen != null ? `${kpis.panier_moyen.toLocaleString("fr-MA")} MAD` : "—"}
                sub="par transaction"
              />
              <KpiCard
                icon={<IconCalendar />} iconBg="rgba(245,158,11,0.15)"
                title="Meilleur Jour"
                value={kpis?.meilleur_jour?.jour ? formatMeilleurJour(kpis.meilleur_jour.jour) : "—"}
                sub={kpis?.meilleur_jour?.total != null ? `${kpis.meilleur_jour.total} ventes ce jour` : undefined}
              />
            </div>
          )}

          {loading ? (
            <div className="loading-box">Chargement de vos statistiques pour {selectedYear}...</div>
          ) : erreur ? (
            <div className="error-box">&#9888; {erreur}</div>
          ) : (
            <>
              {/* ── KPIs annuels ── */}
              <div className="section-label">Annuel {selectedYear}</div>
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <KpiCard icon={<IconBox />} iconBg="rgba(59,130,246,0.12)" title="Total Quantité Vendue" value={totalQty} />
                <KpiCard icon={<IconCA />}  iconBg="rgba(52,211,153,0.12)" title="Chiffre d'Affaires (CA)" value={`${totalCA} MAD`} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "32px" }}>

                {/* Graphique 1 : Quantités par mois */}
                <ChartCard title="Quantités vendues par mois">
                  {quantites.length === 0 ? (
                    <p style={{ color: "var(--text-sub)", fontSize: "14px" }}>Aucune donnée pour cette année.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={quantites} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60A5FA" stopOpacity={1} />
                            <stop offset="100%" stopColor="#2563EB" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} opacity={0.5} />
                        <XAxis dataKey="mois" axisLine={false} tickLine={false} tickMargin={12} />
                        <YAxis axisLine={false} tickLine={false} tickMargin={12} />
                        <Tooltip cursor={{ fill: "rgba(59,130,246,0.05)" }} />
                        <Bar dataKey="quantite" name="Quantité" fill="url(#colorQty)" radius={[6, 6, 0, 0]} barSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Graphique 2 : Évolution CA par mois */}
                <ChartCard title="Évolution du CA (MAD)">
                  {chiffreAffaire.length === 0 ? (
                    <p style={{ color: "var(--text-sub)", fontSize: "14px" }}>Aucune donnée pour cette année.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={chiffreAffaire} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} opacity={0.5} />
                        <XAxis dataKey="mois" axisLine={false} tickLine={false} tickMargin={12} />
                        <YAxis axisLine={false} tickLine={false} tickMargin={12} />
                        <Tooltip formatter={(v) => `${v} MAD`} />
                        <Area
                          type="monotone" dataKey="ca" name="CA"
                          stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorCA)"
                          activeDot={{ r: 6, strokeWidth: 0, fill: "#FFFFFF", stroke: "#3B82F6" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </ChartCard>

                {/* Graphique 3 : CA jour par jour */}
                <ChartCard title={`Évolution du CA — jour par jour (${periodeLabel})`}>
                  {loadingCaJour ? (
                    <p style={{ color: "var(--text-sub)", fontSize: "14px" }}>Chargement...</p>
                  ) : caParJour.length === 0 ? (
                    <p style={{ color: "var(--text-sub)", fontSize: "14px" }}>
                      Aucune donnée de chiffre d'affaires pour {MOIS[selectedMonth]} {selectedYear}.
                    </p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={caParJour} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCAJour" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.45} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} opacity={0.5} />
                          <XAxis
                            dataKey="jour"
                            axisLine={false}
                            tickLine={false}
                            tickMargin={12}
                            tickFormatter={(v) =>
                              v === 1 || v === 15 || v === caParJour.length
                                ? `${v} ${MOIS[selectedMonth]}`
                                : ""
                            }
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickMargin={12}
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                          />
                          {/* FIX 1 : passage de selectedMonth en prop au tooltip */}
                          <Tooltip content={<CAJourTooltip selectedMonth={selectedMonth} />} />
                          <Area
                            type="monotone"
                            dataKey="ca"
                            name="CA"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCAJour)"
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0, fill: "#FFFFFF", stroke: "#3B82F6" }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", padding: "0 4px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-sub)", fontWeight: 600 }}>
                          {caJourDebut.toLocaleString("fr-MA")} MAD
                        </span>
                        <span style={{ fontSize: "12px", color: "#3B82F6", fontWeight: 700 }}>
                          {caJourFin.toLocaleString("fr-MA")} MAD
                        </span>
                      </div>
                    </>
                  )}
                </ChartCard>

                {/* Graphique 4 : Top 7 produits */}
                <ChartCard title="Top 7 produits les plus vendus">
                  {loadingTop7 ? (
                    <p style={{ color: "var(--text-sub)", fontSize: "14px" }}>Chargement du top 7...</p>
                  ) : erreurTop7 ? (
                    <div className="error-box" style={{ marginTop: 0 }}>&#9888; {erreurTop7}</div>
                  ) : top7.length === 0 ? (
                    <p style={{ color: "var(--text-sub)", fontSize: "14px" }}>Aucune donnée disponible.</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={top7.length * 56 + 20}>
                        <BarChart layout="vertical" data={top7} margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barCategoryGap="25%">
                          <defs>
                            {TOP7_COLORS.map((color, i) => (
                              <linearGradient key={i} id={`topColor${i}`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={color} stopOpacity={0.85} />
                                <stop offset="100%" stopColor={color} stopOpacity={1} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" horizontal={false} opacity={0.4} />
                          <XAxis type="number" axisLine={false} tickLine={false} tickMargin={8}
                            tick={{ fill: "var(--text-sub)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }} />
                          <YAxis type="category" dataKey="produit" width={140} axisLine={false} tickLine={false} tick={<CustomYTick />} />
                          <Tooltip content={<Top7Tooltip />} cursor={{ fill: "rgba(59,130,246,0.05)" }} />
                          <Bar dataKey="quantite" name="Quantité" radius={[0, 6, 6, 0]} barSize={28}>
                            {top7.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={`url(#topColor${Math.min(index, TOP7_COLORS.length - 1)})`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                        {[...top7].reverse().map((item, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            background: "rgba(59,130,246,0.06)", borderRadius: "8px",
                            padding: "6px 12px", border: "1px solid var(--border)",
                          }}>
                            <span className="rank-badge">#{i + 1}</span>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>
                              {item.produit.length > 20 ? item.produit.slice(0, 18) + "…" : item.produit}
                            </span>
                            <span style={{ fontSize: "12px", color: "var(--text-sub)", fontWeight: 500 }}>
                              {item.quantite} unités
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </ChartCard>

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}