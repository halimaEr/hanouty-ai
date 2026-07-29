import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDetection } from "./Detectioncontext";
import { authServices } from "../services/authServices";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --bg:        #0f1117;
    --surface:   #181c27;
    --card:      #1e2335;
    --border:    #2a2f45;
    --accent:    #22c55e;
    --accent-dim:#16a34a;
    --accent-bg: rgba(34,197,94,0.08);
    --red:       #ef4444;
    --red-bg:    rgba(239,68,68,0.08);
    --blue:      #6366f1;
    --blue-bg:   rgba(99,102,241,0.08);
    --text:      #f1f5f9;
    --muted:     #64748b;
    --tag:       #94a3b8;
  }

  .vente-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .vente-wrap {
    font-family: 'Sora', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding: 32px 24px 120px;
  }

  /* ── HEADER ── */
  .vente-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }
  .vente-header-left { display: flex; align-items: center; gap: 14px; }
  .vente-icon {
    width: 44px; height: 44px;
    background: var(--accent-bg);
    border: 1px solid rgba(34,197,94,0.25);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .vente-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
  .vente-subtitle { font-size: 13px; color: var(--muted); margin-top: 2px; }
  .vente-badge {
    background: var(--accent-bg);
    border: 1px solid rgba(34,197,94,0.3);
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    padding: 6px 14px;
    border-radius: 20px;
    font-weight: 500;
  }

  /* ── PRIX TOTAL CARD ── */
  .prix-total-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 100%);
    border: 1px solid rgba(34,197,94,0.3);
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 24px;
    animation: fadeSlide 0.4s ease;
  }
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .prix-total-left { display: flex; flex-direction: column; gap: 4px; }
  .prix-total-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--muted);
    font-weight: 600;
  }
  .prix-total-items {
    font-size: 13px;
    color: var(--muted);
  }
  .prix-total-items span { color: var(--accent); font-weight: 600; }
  .prix-total-amount {
    font-family: 'JetBrains Mono', monospace;
    font-size: 36px;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: -1px;
  }
  .prix-total-currency {
    font-size: 18px;
    font-weight: 400;
    color: var(--accent);
    opacity: 0.7;
    margin-left: 4px;
  }

  /* ── SECTION AJOUT MANUEL ── */
  .add-product-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
  }
  .add-product-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .add-product-title::before {
    content: '';
    display: inline-block;
    width: 3px; height: 14px;
    background: var(--blue);
    border-radius: 2px;
  }
  .add-product-row {
    display: flex;
    gap: 12px;
    align-items: stretch;
    flex-wrap: wrap;
  }
  .select-wrapper {
    flex: 1;
    min-width: 200px;
    position: relative;
  }
  .select-wrapper::after {
    content: '▾';
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
    font-size: 12px;
  }
  .prod-select {
    width: 100%;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    padding: 12px 36px 12px 14px;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.15s;
    outline: none;
  }
  .prod-select:focus { border-color: var(--blue); }
  .prod-select option { background: #1e2335; color: var(--text); }

  .qty-input-wrap {
    display: flex;
    align-items: center;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.15s;
  }
  .qty-input-wrap:focus-within { border-color: var(--blue); }
  .qty-btn {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 18px;
    padding: 0 14px;
    cursor: pointer;
    transition: color 0.15s;
    height: 100%;
    display: flex; align-items: center;
  }
  .qty-btn:hover { color: var(--text); }
  .qty-input {
    width: 48px;
    background: none;
    border: none;
    color: var(--text);
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px;
    text-align: center;
    outline: none;
    padding: 12px 0;
  }
  /* hide number arrows */
  .qty-input::-webkit-inner-spin-button,
  .qty-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .qty-input[type=number] { -moz-appearance: textfield; }

  .btn-add-manual {
    background: var(--blue-bg);
    border: 1px solid rgba(99,102,241,0.35);
    color: #a5b4fc;
    border-radius: 10px;
    padding: 12px 20px;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
    display: flex; align-items: center; gap: 8px;
  }
  .btn-add-manual:hover:not(:disabled) {
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.5);
  }
  .btn-add-manual:disabled { opacity: 0.4; cursor: not-allowed; }

  .select-loading {
    font-size: 13px; color: var(--muted);
    display: flex; align-items: center; gap: 8px;
    padding: 12px 0;
  }

  /* ── TABLE ── */
  .vente-table-wrap {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 24px;
  }
  .section-label {
    padding: 14px 20px 0;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--muted);
    font-weight: 600;
  }
  .vente-table { width: 100%; border-collapse: collapse; }
  .vente-table thead tr {
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }
  .vente-table th {
    padding: 14px 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--muted);
    text-align: left;
  }
  .vente-table th:last-child { text-align: center; }
  .vente-table th.th-prix { text-align: right; }

  .vente-row {
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
    animation: rowIn 0.3s ease both;
  }
  .vente-row:last-child { border-bottom: none; }
  .vente-row:hover { background: rgba(255,255,255,0.02); }
  .vente-row.removing {
    animation: rowOut 0.35s ease forwards;
    pointer-events: none;
  }
  .vente-row.manual-row { background: rgba(99,102,241,0.04); }
  @keyframes rowIn  { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:none; } }
  @keyframes rowOut { to   { opacity:0; transform:translateX(12px); height:0; padding:0; } }

  .vente-row td { padding: 16px 20px; vertical-align: middle; }
  .vente-row td:last-child { text-align: center; }
  .vente-row td.td-prix {
    text-align: right;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: var(--accent);
    font-weight: 600;
  }

  .prod-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .prod-id {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--muted);
    background: var(--card);
    border: 1px solid var(--border);
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
  }
  .manual-tag {
    display: inline-block;
    background: var(--blue-bg);
    border: 1px solid rgba(99,102,241,0.3);
    color: #a5b4fc;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 6px;
    margin-left: 8px;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  /* ── CHECKBOX ── */
  .custom-cb { position: relative; width: 22px; height: 22px; cursor: pointer; }
  .custom-cb input { opacity: 0; position: absolute; width: 100%; height: 100%; cursor: pointer; }
  .custom-cb .box {
    width: 22px; height: 22px;
    border: 2px solid var(--border);
    border-radius: 6px;
    background: var(--card);
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
    pointer-events: none;
  }
  .custom-cb input:checked ~ .box {
    background: var(--accent);
    border-color: var(--accent);
  }
  .custom-cb .check {
    opacity: 0; transform: scale(0.5);
    transition: all 0.15s;
    color: #000;
    font-size: 13px;
    font-weight: 700;
  }
  .custom-cb input:checked ~ .box .check {
    opacity: 1; transform: scale(1);
  }

  /* ── TOAST ── */
  .toast-container {
    position: fixed; bottom: 100px; left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    pointer-events: none;
  }
  .toast {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 14px; font-weight: 500;
    backdrop-filter: blur(12px);
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2.4s forwards;
    pointer-events: all;
    min-width: 220px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .toast.success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.35); color: #86efac; }
  .toast.error   { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.35); color: #fca5a5; }
  .toast.info    { background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.35); color: #a5b4fc; }
  @keyframes toastIn  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
  @keyframes toastOut { to   { opacity:0; transform:translateY(8px); } }

  /* ── EMPTY ── */
  .vente-empty { text-align: center; padding: 48px 20px; color: var(--muted); }
  .vente-empty .icon { font-size: 40px; margin-bottom: 12px; }
  .vente-empty p { font-size: 15px; }

  /* ── FOOTER BAR ── */
  .vente-footer {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: rgba(15,17,23,0.95);
    backdrop-filter: blur(16px);
    border-top: 1px solid var(--border);
    padding: 16px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .footer-info { display: flex; flex-direction: column; }
  .footer-count { font-size: 13px; color: var(--muted); }
  .footer-count span { color: var(--accent); font-weight: 600; }
  .footer-label { font-size: 15px; font-weight: 600; margin-top: 2px; }

  .btn-validate {
    background: var(--accent);
    color: #000;
    border: none;
    border-radius: 10px;
    padding: 13px 28px;
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s, opacity 0.15s;
    display: flex; align-items: center; gap: 8px;
    white-space: nowrap;
  }
  .btn-validate:hover:not(:disabled) { background: #16a34a; transform: translateY(-1px); }
  .btn-validate:active:not(:disabled) { transform: translateY(0); }
  .btn-validate:disabled { opacity: 0.5; cursor: not-allowed; }

  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(0,0,0,0.3);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── NO DATA ── */
  .no-data {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 100vh;
    background: var(--bg); color: var(--text);
    font-family: 'Sora', sans-serif;
    gap: 16px;
  }
  .no-data h2 { font-size: 20px; color: var(--muted); }
  .btn-back {
    background: var(--card);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 10px;
    padding: 10px 22px;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .btn-back:hover { border-color: var(--accent); color: var(--accent); }
`;

// ── Toast state ──
let _setToasts = null;
function showToast(msg, type = "info") {
  if (_setToasts) {
    const id = Date.now();
    _setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => _setToasts(prev => prev.filter(t => t.id !== id)), 2800);
  }
}

function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { _setToasts = setToasts; return () => { _setToasts = null; }; }, []);
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

const generateUid = () => Math.random().toString(36).substr(2, 9);

export default function Vente() {
  const navigate = useNavigate();
  const { detectionResult, clearDetectionResult } = useDetection();

  const [selectedUids, setSelectedUids]     = useState(new Set());
  const [removingUids, setRemovingUids]     = useState(new Set());
  const [isSubmitting, setIsSubmitting]     = useState(false);

  // ── Produits catalogue (pour le select manuel) ──
  const [catalogue,    setCatalogue]        = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  // ── Produits ajoutés manuellement ──
  const [manualProducts, setManualProducts] = useState([]);

  // ── Select state ──
  const [selectedCatalogId, setSelectedCatalogId] = useState("");
  const [manualQty,          setManualQty]          = useState(1);

  // ── Charger le catalogue produits au montage ──
  useEffect(() => {
    const fetchCatalogue = async () => {
      try {
        const res = await fetch("http://localhost:8000/produits");
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        setCatalogue(data);
        if (data.length > 0) setSelectedCatalogId(String(data[0].id));
      } catch {
        showToast("Impossible de charger le catalogue", "error");
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchCatalogue();
  }, []);

  if (!detectionResult) {
    return (
      <>
        <style>{styles}</style>
        <div className="no-data">
          <div style={{ fontSize: 48 }}>🛒</div>
          <h2>Aucune donnée disponible</h2>
          <button className="btn-back" onClick={() => navigate("/user/camera")}>
            ← Retour Caméra
          </button>
        </div>
      </>
    );
  }

  const detectedProducts = detectionResult.known_products || [];

  // ── Init sélection depuis les produits détectés ──
  useEffect(() => {
    if (detectedProducts.length > 0) {
      setSelectedUids(new Set(detectedProducts.map(p => p.uid)));
    }
  }, [detectedProducts]);

  // ── Tous les produits (détectés + manuels) ──
  const allProducts = [
    ...detectedProducts.map(p => ({ ...p, isManual: false })),
    ...manualProducts.map(p => ({ ...p, isManual: true })),
  ];

  // ── Produits sélectionnés avec leur prix ──
  const selectedProducts = allProducts.filter(p => selectedUids.has(p.uid));

  // ── Prix total ──
  const totalPrice = selectedProducts.reduce((sum, p) => {
    const prix = parseFloat(p.prix ?? 0);
    const qty  = p.quantite ?? 1;
    return sum + prix * qty;
  }, 0);

  // ── Toggle sélection ──
  const toggleSelection = (uid) => {
    const next = new Set(selectedUids);
    const removing = next.has(uid);

    if (removing) {
      setRemovingUids(prev => new Set([...prev, uid]));
      setTimeout(() => {
        setRemovingUids(prev => { const s = new Set(prev); s.delete(uid); return s; });
        next.delete(uid);
        setSelectedUids(new Set(next));
        showToast("Produit retiré du panier", "info");
      }, 340);
    } else {
      next.add(uid);
      setSelectedUids(new Set(next));
      showToast("Produit ajouté au panier", "success");
    }
  };

  // ── Ajouter un produit manuellement ──
  const handleAddManual = () => {
    const produit = catalogue.find(p => String(p.id) === selectedCatalogId);
    if (!produit) return;

    const qty = Math.max(1, parseInt(manualQty, 10) || 1);
    const uid = generateUid();

    const newProduct = {
      uid,
      produit_id:  String(produit.id),
      label:       produit.nom,
      prix:        parseFloat(produit.prix ?? 0),
      confidence:  1,
      quantite:    qty,
      isManual:    true,
    };

    setManualProducts(prev => [...prev, newProduct]);
    setSelectedUids(prev => new Set([...prev, uid]));
    showToast(`${produit.nom} × ${qty} ajouté`, "success");
    setManualQty(1);
  };

  // ── Supprimer un produit manuel ──
  const removeManual = (uid) => {
    setRemovingUids(prev => new Set([...prev, uid]));
    setTimeout(() => {
      setRemovingUids(prev => { const s = new Set(prev); s.delete(uid); return s; });
      setManualProducts(prev => prev.filter(p => p.uid !== uid));
      setSelectedUids(prev => { const s = new Set(prev); s.delete(uid); return s; });
      showToast("Produit supprimé", "info");
    }, 340);
  };

  // ── Valider la vente ──
  const handleValidateSale = async () => {
    if (selectedUids.size === 0) {
      showToast("Sélectionnez au moins un produit", "error");
      return;
    }

    setIsSubmitting(true);

    const userId = authServices.getUserId();
    if (!userId) {
      showToast("Utilisateur non identifié", "error");
      navigate("/login");
      return;
    }

    const chosenProducts = allProducts.filter(p => selectedUids.has(p.uid));
    const groupedProducts = {};
    chosenProducts.forEach(p => {
      if (groupedProducts[p.produit_id]) {
        groupedProducts[p.produit_id].quantite += (p.quantite ?? 1);
      } else {
        groupedProducts[p.produit_id] = {
          produit_id: p.produit_id,
          quantite:   p.quantite ?? 1,
        };
      }
    });

    const productsToSend = Object.values(groupedProducts);
    if (productsToSend.length === 0) {
      showToast("Aucun produit valide à envoyer", "error");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      user_id:      userId,
      total_amount: totalPrice,
      products:     productsToSend,
    };

    try {
      const res = await fetch("http://localhost:8000/ventes/list/ajouter", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erreur serveur");
      }

      const data = await res.json();
      showToast(`Vente enregistrée — ID ${data.id}`, "success");

      setTimeout(() => {
        clearDetectionResult();
        navigate("/user/ventes");
      }, 1000);
    } catch (err) {
      showToast("Erreur : " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = selectedUids.size;

  return (
    <>
      <style>{styles}</style>
      <div className="vente-wrap">

        {/* ── Header ── */}
        <div className="vente-header">
          <div className="vente-header-left">
            <div className="vente-icon">🛒</div>
            <div>
              <div className="vente-title">Panier</div>
              <div className="vente-subtitle">
                {detectedProducts.length} détecté{detectedProducts.length > 1 ? "s" : ""}
                {manualProducts.length > 0 && ` · ${manualProducts.length} ajouté${manualProducts.length > 1 ? "s" : ""} manuellement`}
              </div>
            </div>
          </div>
          <div className="vente-badge">
            {selectedCount} / {allProducts.length} sélectionné{selectedCount > 1 ? "s" : ""}
          </div>
        </div>

        {/* ── Prix total ── */}
        <div className="prix-total-card">
          <div className="prix-total-left">
            <div className="prix-total-label">Total à encaisser</div>
            <div className="prix-total-items">
              <span>{selectedCount}</span> article{selectedCount > 1 ? "s" : ""} sélectionné{selectedCount > 1 ? "s" : ""}
            </div>
          </div>
          <div>
            <span className="prix-total-amount">
              {totalPrice.toFixed(2)}
            </span>
            <span className="prix-total-currency">MAD</span>
          </div>
        </div>

        {/* ── Ajout manuel ── */}
        <div className="add-product-section">
          <div className="add-product-title">Ajouter un produit manuellement</div>
          {catalogLoading ? (
            <div className="select-loading">
              <span className="spinner" style={{ borderTopColor: "#6366f1", borderColor: "rgba(99,102,241,0.2)" }} />
              Chargement du catalogue…
            </div>
          ) : catalogue.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Aucun produit dans le catalogue.</div>
          ) : (
            <div className="add-product-row">
              <div className="select-wrapper">
                <select
                  className="prod-select"
                  value={selectedCatalogId}
                  onChange={e => setSelectedCatalogId(e.target.value)}
                >
                  {catalogue.map(p => (
                    <option key={p.id} value={String(p.id)}>
                      {p.nom}{p.prix ? `  —  ${parseFloat(p.prix).toFixed(2)} MAD` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="qty-input-wrap">
                <button
                  className="qty-btn"
                  onClick={() => setManualQty(q => Math.max(1, q - 1))}
                >−</button>
                <input
                  className="qty-input"
                  type="number"
                  min="1"
                  value={manualQty}
                  onChange={e => setManualQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                />
                <button
                  className="qty-btn"
                  onClick={() => setManualQty(q => q + 1)}
                >+</button>
              </div>

              <button
                className="btn-add-manual"
                onClick={handleAddManual}
                disabled={!selectedCatalogId}
              >
                + Ajouter
              </button>
            </div>
          )}
        </div>

        {/* ── Tableau produits ── */}
        <div className="vente-table-wrap">
          {allProducts.length === 0 ? (
            <div className="vente-empty">
              <div className="icon">📦</div>
              <p>Aucun produit dans le panier</p>
            </div>
          ) : (
            <>
              {detectedProducts.length > 0 && (
                <div className="section-label">Produits détectés</div>
              )}
              <table className="vente-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th className="th-prix">Prix unit.</th>
                    <th>Qté</th>
                    <th className="th-prix">Sous-total</th>
                    <th>Panier</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Produits détectés */}
                  {detectedProducts.map((p) => (
                    <tr
                      key={p.uid}
                      className={`vente-row${removingUids.has(p.uid) ? " removing" : ""}`}
                    >
                      <td>
                        <div className="prod-name">{p.label}</div>
                        <span className="prod-id">{p.produit_id ?? "—"}</span>
                      </td>
                      <td className="td-prix">
                        {p.prix != null ? `${parseFloat(p.prix).toFixed(2)}` : "—"}
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                        {p.quantite ?? 1}
                      </td>
                      <td className="td-prix">
                        {p.prix != null
                          ? `${(parseFloat(p.prix) * (p.quantite ?? 1)).toFixed(2)}`
                          : "—"}
                      </td>
                      <td>
                        <label className="custom-cb" style={{ margin: "0 auto", display: "block", width: 22 }}>
                          <input
                            type="checkbox"
                            checked={selectedUids.has(p.uid)}
                            onChange={() => toggleSelection(p.uid)}
                          />
                          <div className="box">
                            <span className="check">✓</span>
                          </div>
                        </label>
                      </td>
                    </tr>
                  ))}

                  {/* Produits manuels */}
                  {manualProducts.length > 0 && (
                    <>
                      {detectedProducts.length > 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: "8px 20px 4px" }}>
                            <div className="section-label" style={{ padding: 0 }}>Ajoutés manuellement</div>
                          </td>
                        </tr>
                      )}
                      {manualProducts.map((p) => (
                        <tr
                          key={p.uid}
                          className={`vente-row manual-row${removingUids.has(p.uid) ? " removing" : ""}`}
                        >
                          <td>
                            <div className="prod-name">
                              {p.label}
                              <span className="manual-tag">Manuel</span>
                            </div>
                            <span className="prod-id">{p.produit_id ?? "—"}</span>
                          </td>
                          <td className="td-prix">
                            {p.prix != null ? `${parseFloat(p.prix).toFixed(2)}` : "—"}
                          </td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                            {p.quantite}
                          </td>
                          <td className="td-prix">
                            {p.prix != null
                              ? `${(parseFloat(p.prix) * p.quantite).toFixed(2)}`
                              : "—"}
                          </td>
                          <td>
                            <button
                              onClick={() => removeManual(p.uid)}
                              style={{
                                background: "none", border: "none",
                                color: "var(--red)", cursor: "pointer",
                                fontSize: 18, lineHeight: 1,
                                display: "flex", alignItems: "center", margin: "0 auto",
                              }}
                              title="Supprimer"
                            >✕</button>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>

      </div>

      {/* ── Footer bar ── */}
      <div className="vente-footer">
        <div className="footer-info">
          <div className="footer-count">
            <span>{selectedCount}</span> article{selectedCount > 1 ? "s" : ""} · Total :{" "}
            <span>{totalPrice.toFixed(2)} MAD</span>
          </div>
          <div className="footer-label">Valider la vente</div>
        </div>
        <button
          className="btn-validate"
          onClick={handleValidateSale}
          disabled={isSubmitting || selectedCount === 0}
        >
          {isSubmitting ? (
            <><span className="spinner" /> Enregistrement…</>
          ) : (
            <>✓ Confirmer {totalPrice > 0 && `· ${totalPrice.toFixed(2)} MAD`}</>
          )}
        </button>
      </div>

      <ToastContainer />
    </>
  );
}