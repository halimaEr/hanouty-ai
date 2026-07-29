import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDetection } from "./Detectioncontext";

const API_URL = "http://localhost:8000/detection/detect";

const COLORS = {
  known:   "#00e676",
  unknown: "#ff6d00",
  bg:      "rgba(0,0,0,0.72)",
};

// ── Keyframes ─────────────────────────────────────────────
const styleEl = document.createElement("style");
styleEl.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes fadeIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes flashBorder {
    0%   { box-shadow: 0 0 0 0 rgba(0,230,118,0.7); }
    50%  { box-shadow: 0 0 0 12px rgba(0,230,118,0); }
    100% { box-shadow: 0 0 0 0 rgba(0,230,118,0); }
  }
`;
if (!document.head.querySelector("[data-detection-style]")) {
  styleEl.setAttribute("data-detection-style", "1");
  document.head.appendChild(styleEl);
}

export default function DetectionCamera() {
  const navigate               = useNavigate();
  const { setDetectionResult } = useDetection();

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [mode,        setMode]        = useState("idle");
  const [detections,  setDetections]  = useState(null);
  const [error,       setError]       = useState("");
  const [flash,       setFlash]       = useState(false);
  const [resultImage, setResultImage] = useState(null);

  // ── Démarrer la caméra ────────────────────────────────
  const startPreview = useCallback(async () => {
    setError("");
    setDetections(null);
    setResultImage(null);
    setMode("idle");

    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setMode("previewing");
    } catch (err) {
      setError(err.message || "Accès caméra refusé");
      setMode("error");
    }
  }, []);

  // ── Capturer et envoyer au backend ───────────────────
  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    setMode("capturing");
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    const tmp = document.createElement("canvas");
    tmp.width  = video.videoWidth;
    tmp.height = video.videoHeight;
    tmp.getContext("2d").drawImage(video, 0, 0);

    try {
      const blob = await new Promise((res) => tmp.toBlob(res, "image/jpeg", 0.85));
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      const resp = await fetch(API_URL, { method: "POST", body: formData });
      if (!resp.ok) throw new Error(`Erreur serveur : ${resp.status}`);
      const result = await resp.json();

      streamRef.current?.getTracks().forEach(t => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;

      // Dessiner les boxes sur canvas export
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width  = tmp.width;
      exportCanvas.height = tmp.height;
      const ectx = exportCanvas.getContext("2d");
      ectx.drawImage(tmp, 0, 0);

      const all = [
        ...(result.known_products   ?? []).map(p => ({ ...p, type: "known" })),
        ...(result.unknown_products ?? []).map(p => ({ ...p, type: "unknown" })),
      ];

      all.forEach(({ bbox, label, confidence, type }) => {
        if (!bbox) return;
        const { x, y, w, h } = bbox;
        const color = type === "known" ? COLORS.known : COLORS.unknown;
        const text  = type === "known"
          ? `${label}  ${(confidence * 100).toFixed(0)}%`
          : "Inconnu";

        ectx.strokeStyle = color; ectx.lineWidth = 2.5;
        ectx.strokeRect(x, y, w, h);

        const cSize = 12; ectx.lineWidth = 3.5;
        ectx.beginPath(); ectx.moveTo(x, y + cSize); ectx.lineTo(x, y); ectx.lineTo(x + cSize, y); ectx.stroke();
        ectx.beginPath(); ectx.moveTo(x + w - cSize, y); ectx.lineTo(x + w, y); ectx.lineTo(x + w, y + cSize); ectx.stroke();
        ectx.beginPath(); ectx.moveTo(x, y + h - cSize); ectx.lineTo(x, y + h); ectx.lineTo(x + cSize, y + h); ectx.stroke();
        ectx.beginPath(); ectx.moveTo(x + w - cSize, y + h); ectx.lineTo(x + w, y + h); ectx.lineTo(x + w, y + h - cSize); ectx.stroke();

        ectx.font = "bold 13px 'IBM Plex Mono', monospace";
        const tw = ectx.measureText(text).width;
        ectx.fillStyle = COLORS.bg; ectx.fillRect(x, y - 26, tw + 14, 24);
        ectx.fillStyle = color; ectx.fillText(text, x + 7, y - 8);
      });

      const dataUrl = exportCanvas.toDataURL("image/jpeg", 0.92);
      setResultImage(dataUrl);
      setDetections(result);
      setDetectionResult(result);
      setMode("captured");

    } catch (err) {
      setError(err.message || "Erreur lors de la capture");
      setMode("error");
    }
  }, [setDetectionResult]);

  const goToVente = useCallback(() => navigate("/user/vente"), [navigate]);

  const reset = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setDetections(null);
    setResultImage(null);
    setError("");
    startPreview();
  }, [startPreview]);

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const known   = detections?.known_products   ?? [];
  const unknown = detections?.unknown_products ?? [];
  const total   = known.length + unknown.length;

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <header style={s.header}>
        <div style={s.logo}>
          <span style={s.logoIcon}>◈</span>
          <span style={s.logoText}>HANOUTY</span>
          <span style={s.logoSub}>SCAN</span>
        </div>
        <StatusBadge mode={mode} />
      </header>

      {/* ── Zone vidéo / résultat ── */}
      <div style={s.videoWrapper}>
        {flash && <div style={s.flashOverlay} />}

        {mode === "captured" && resultImage ? (
          <div style={s.resultContainer}>
            <img src={resultImage} alt="Résultat détection" style={s.resultImg} />
            {total > 0 && (
              <div style={s.resultBadge}>
                {total} produit{total > 1 ? "s" : ""} détecté{total > 1 ? "s" : ""}
              </div>
            )}
          </div>
        ) : (
          <>
            <video ref={videoRef} style={s.video} muted playsInline />
            <canvas ref={canvasRef} style={s.canvas} />

            {mode === "idle" && (
              <div style={s.overlay}>
                <div style={s.overlayIcon}>◈</div>
                <p style={s.overlayText}>Caméra inactive</p>
                <button style={s.btnPrimary} onClick={startPreview}>Démarrer</button>
              </div>
            )}

            {mode === "capturing" && (
              <div style={s.overlay}>
                <div style={s.spinner} />
                <p style={s.overlayText}>Analyse en cours…</p>
              </div>
            )}

            {mode === "previewing" && (
              <div style={s.scanLine}>
                <div style={s.scanDot} />
                Scan actif — cliquez sur Capturer
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Contrôles ── */}
      {mode === "previewing" && (
        <div style={s.controls}>
          <button style={s.btnCapture} onClick={capture}>Capturer</button>
        </div>
      )}

      {/* ── Panneau résultats post-capture ── */}
      {mode === "captured" && detections && (
        <div style={s.resultPanel}>

          {/* Bandeau récap */}
          <div style={s.recap}>
            <RecapStat
              value={total}
              label="détecté(s)"
              color="#1a4fff"
              bg="rgba(26,79,255,0.08)"
              border="rgba(26,79,255,0.18)"
            />
            <RecapStat
              value={known.length}
              label="reconnu(s)"
              color={COLORS.known}
              bg="rgba(0,230,118,0.08)"
              border="rgba(0,230,118,0.18)"
            />
            <RecapStat
              value={unknown.length}
              label="inconnu(s)"
              color={COLORS.unknown}
              bg="rgba(255,109,0,0.08)"
              border="rgba(255,109,0,0.18)"
            />
          </div>

          {/* Produits reconnus */}
          {known.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionHeader(COLORS.known)}>
                <span style={s.sectionDot(COLORS.known)} />
                Produits reconnus — {known.length}
              </div>
              <div style={s.productList}>
                {known.map((p, i) => (
                  <div key={i} style={s.productRow}>
                    <div style={s.productAvatar(COLORS.known, "rgba(0,230,118,0.1)")}>
                      {(p.label?.[0] ?? "P").toUpperCase()}
                    </div>
                    <div style={s.productInfo}>
                      <div style={s.productName}>{p.label}</div>
                      <div style={s.productMeta}>ID {p.produit_id}</div>
                    </div>
                    <div style={s.confWrapper}>
                      <div style={s.confTrack}>
                        <div style={s.confBar(p.confidence, COLORS.known)} />
                      </div>
                      <span style={s.confLabel(COLORS.known)}>
                        {(p.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Produits inconnus */}
          {unknown.length > 0 && (
            <div style={s.section}>
              <div style={s.sectionHeader(COLORS.unknown)}>
                <span style={s.sectionDot(COLORS.unknown)} />
                Produits inconnus — {unknown.length}
              </div>
              <div style={s.productList}>
                {unknown.map((p, i) => (
                  <div key={i} style={s.productRow}>
                    <div style={s.productAvatar(COLORS.unknown, "rgba(255,109,0,0.1)")}>?</div>
                    <div style={s.productInfo}>
                      <div style={s.productName}>Inconnu #{i + 1}</div>
                      <div style={s.productMeta}>
                        {p.image_id ? "Image enregistrée" : "En attente de labélisation"}
                      </div>
                    </div>
                    <div style={s.adminTag}>Admin notifié</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {known.length === 0 && (
            <div style={s.emptyBox}>
              Aucun produit reconnu.
              {unknown.length > 0 && " Les inconnus ont été transmis à l'administrateur."}
            </div>
          )}

          {/* Actions */}
          <div style={s.actions}>
            {known.length > 0 && (
              <button style={s.btnVente} onClick={goToVente}>
                Lancer la vente
                {known.length > 0 && (
                  <span style={s.btnBadge}>{known.length}</span>
                )}
              </button>
            )}
            <button style={s.btnReset} onClick={reset}>
              Nouveau scan
            </button>
          </div>

        </div>
      )}

      {/* ── Contrôles mode erreur ── */}
      {mode === "error" && (
        <div style={s.controls}>
          {error && <div style={s.errorBox}>⚠ {error}</div>}
          <button style={s.btnReset} onClick={reset}>Réessayer</button>
        </div>
      )}

    </div>
  );
}

// ── Composant stat récap ──────────────────────────────────
function RecapStat({ value, label, color, bg, border }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px 12px", borderRadius: "10px",
      background: bg, border: `1px solid ${border}`,
    }}>
      <span style={{ fontSize: "28px", fontWeight: "700", color, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: "11px", color: "#556", letterSpacing: "0.08em", marginTop: "6px" }}>
        {label}
      </span>
    </div>
  );
}

// ── Badge de statut header ────────────────────────────────
function StatusBadge({ mode }) {
  const label = {
    idle:       "En attente",
    previewing: "Prêt à scanner",
    capturing:  "Analyse…",
    captured:   "Résultats",
    error:      "Erreur",
  }[mode] ?? mode;

  const active = mode === "previewing" || mode === "captured";
  const isErr  = mode === "error";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      fontSize: "12px", letterSpacing: "0.1em",
      padding: "6px 14px", borderRadius: "20px",
      border: `1px solid ${active ? "#00e67640" : isErr ? "#ff174440" : "#ffffff18"}`,
      background: active ? "#00e67610" : isErr ? "#ff174410" : "#ffffff08",
      color: active ? "#00e676" : isErr ? "#ff1744" : "#888",
    }}>
      <span style={{
        width: "7px", height: "7px", borderRadius: "50%",
        background: active ? "#00e676" : isErr ? "#ff1744" : "#555",
        boxShadow: active ? "0 0 8px #00e676" : "none",
        animation: mode === "previewing" ? "pulse 1.4s ease-in-out infinite" : "none",
        display: "inline-block",
      }} />
      {label}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────
const s = {
  page: {
    minHeight: "100vh",
    background: "#080b0f",
    color: "#e8eaed",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 0 64px",
  },

  header: {
    width: "100%", maxWidth: "960px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "24px 24px 16px",
  },
  logo:     { display: "flex", alignItems: "baseline", gap: "10px" },
  logoIcon: { fontSize: "22px", color: "#00e676" },
  logoText: { fontSize: "20px", fontWeight: "700", letterSpacing: "0.12em", color: "#fff" },
  logoSub:  { fontSize: "11px", letterSpacing: "0.2em", color: "#555" },

  videoWrapper: {
    position: "relative", width: "100%", maxWidth: "960px",
    aspectRatio: "16/9", background: "#0d1117",
    borderRadius: "12px", overflow: "hidden",
    border: "1px solid #1e2530", margin: "0 24px",
  },

  resultContainer: {
    position: "absolute", inset: 0,
    background: "#000",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  resultImg: {
    width: "100%", height: "100%", objectFit: "cover", display: "block",
  },
  resultBadge: {
    position: "absolute", top: "14px", right: "14px",
    background: "rgba(0,230,118,0.12)", border: "1px solid rgba(0,230,118,0.3)",
    color: "#00e676", fontSize: "12px", letterSpacing: "0.1em",
    padding: "5px 12px", borderRadius: "20px", zIndex: 10,
  },

  flashOverlay: {
    position: "absolute", inset: 0, background: "white",
    opacity: 0.7, zIndex: 10, pointerEvents: "none",
  },
  video:  { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
  canvas: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },

  overlay: {
    position: "absolute", inset: 0, zIndex: 5,
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: "16px", background: "#080b0fee",
  },
  overlayIcon: { fontSize: "48px", color: "#1e2530" },
  overlayText: { fontSize: "15px", letterSpacing: "0.1em", color: "#444", margin: 0 },
  spinner: {
    width: "36px", height: "36px",
    border: "3px solid #1e2530", borderTop: "3px solid #00e676",
    borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  scanLine: {
    position: "absolute", bottom: "14px", left: "14px",
    display: "flex", alignItems: "center", gap: "8px",
    background: "rgba(0,0,0,0.6)", border: "1px solid #1e2530",
    color: "#556", fontSize: "11px", letterSpacing: "0.1em",
    padding: "5px 12px", borderRadius: "20px",
  },
  scanDot: {
    width: "7px", height: "7px", borderRadius: "50%",
    background: "#00e676", boxShadow: "0 0 8px #00e676",
    animation: "pulse 1.4s ease-in-out infinite",
  },

  // ── Bouton capturer (pendant preview) ──
  controls: {
    display: "flex", gap: "12px", margin: "20px 0 0",
    flexWrap: "wrap", justifyContent: "center",
    width: "100%", maxWidth: "960px", padding: "0 24px",
  },
  btnPrimary: {
    background: "#00e676", color: "#030804", border: "none",
    padding: "12px 32px", borderRadius: "8px", fontSize: "13px",
    fontWeight: "700", letterSpacing: "0.1em", cursor: "pointer",
    fontFamily: "inherit",
  },
  btnCapture: {
    background: "#00e676", color: "#030804", border: "none",
    padding: "14px 40px", borderRadius: "8px", fontSize: "14px",
    fontWeight: "700", letterSpacing: "0.1em", cursor: "pointer",
    fontFamily: "inherit", animation: "flashBorder 2s ease infinite",
  },

  errorBox: {
    padding: "12px 20px",
    background: "#ff174410", border: "1px solid #ff174430",
    borderRadius: "8px", color: "#ff1744", fontSize: "13px",
    width: "100%",
  },

  // ── Panneau résultats ──────────────────────────────────
  resultPanel: {
    width: "100%", maxWidth: "960px",
    padding: "0 24px",
    display: "flex", flexDirection: "column", gap: "20px",
    marginTop: "24px",
    animation: "slideUp 0.35s ease",
  },

  recap: {
    display: "flex", gap: "12px",
  },

  section: {
    background: "#0d1117",
    border: "1px solid #1e2530",
    borderRadius: "12px",
    overflow: "hidden",
  },

  sectionHeader: (color) => ({
    display: "flex", alignItems: "center", gap: "10px",
    padding: "14px 20px",
    borderBottom: "1px solid #1e2530",
    fontSize: "11px", letterSpacing: "0.12em",
    fontWeight: "600", color,
    background: "#080b0f",
  }),

  sectionDot: (color) => ({
    width: "8px", height: "8px", borderRadius: "50%",
    background: color, display: "inline-block", flexShrink: 0,
  }),

  productList: {
    display: "flex", flexDirection: "column",
  },

  productRow: {
    display: "flex", alignItems: "center", gap: "14px",
    padding: "14px 20px",
    borderBottom: "1px solid #111820",
    transition: "background 0.15s",
  },

  productAvatar: (color, bg) => ({
    width: "38px", height: "38px", borderRadius: "10px",
    background: bg, border: `1px solid ${color}30`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "14px", fontWeight: "700", color, flexShrink: 0,
    letterSpacing: 0,
  }),

  productInfo: {
    flex: 1, minWidth: 0,
  },

  productName: {
    fontSize: "13px", fontWeight: "600", color: "#e8eaed",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },

  productMeta: {
    fontSize: "11px", color: "#445", marginTop: "3px", letterSpacing: "0.06em",
  },

  confWrapper: {
    display: "flex", alignItems: "center", gap: "10px", flexShrink: 0,
  },

  confTrack: {
    width: "80px", height: "4px",
    background: "#1e2530", borderRadius: "2px", overflow: "hidden",
  },

  confBar: (conf, color) => ({
    height: "100%",
    width: `${(conf * 100).toFixed(0)}%`,
    background: color,
    borderRadius: "2px",
  }),

  confLabel: (color) => ({
    fontSize: "12px", color, fontWeight: "600",
    minWidth: "36px", textAlign: "right",
  }),

  adminTag: {
    fontSize: "10px", letterSpacing: "0.08em",
    color: "#ff6d00", background: "rgba(255,109,0,0.08)",
    border: "1px solid rgba(255,109,0,0.2)",
    padding: "4px 10px", borderRadius: "6px", flexShrink: 0,
  },

  emptyBox: {
    padding: "20px", background: "#0d1117",
    border: "1px solid #1e2530", borderRadius: "12px",
    color: "#445", fontSize: "13px", textAlign: "center",
  },

  // ── Actions post-capture ──────────────────────────────
  actions: {
    display: "flex", gap: "12px", flexWrap: "wrap",
  },

  btnVente: {
    flex: 1,
    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
    background: "#1a4fff", color: "#fff", border: "none",
    padding: "15px 28px", borderRadius: "10px", fontSize: "13px",
    fontWeight: "700", letterSpacing: "0.08em", cursor: "pointer",
    fontFamily: "inherit", minHeight: "52px",
  },

  btnBadge: {
    background: "rgba(255,255,255,0.2)",
    color: "#fff", fontSize: "11px", fontWeight: "700",
    padding: "2px 8px", borderRadius: "20px",
    letterSpacing: "0.06em",
  },

  btnReset: {
    flex: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "transparent", color: "#778",
    border: "1px solid #1e2530", padding: "15px 28px",
    borderRadius: "10px", fontSize: "13px", fontWeight: "600",
    letterSpacing: "0.08em", cursor: "pointer",
    fontFamily: "inherit", minHeight: "52px",
  },
};