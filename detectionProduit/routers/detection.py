
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database import get_db
from services import detection as detection_service
import cv2
import numpy as np
from model_loader import get_models
from model.predictv1 import run_detection
from models import Produit

router = APIRouter(
    prefix="/detection",
    tags=["Detection"]
)

@router.post("/detect")
async def detect_products(
    file: UploadFile = File(...),
    db:   Session    = Depends(get_db)
):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Format invalide.")

    result = await detection_service.detect_products(file, db)
    return result


# ── WebSocket (caméra temps réel) ────────────────────────
@router.websocket("/ws")
async def websocket_detection(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    yolo, efficientnet, idx2label = get_models()

    try:
        while True:
            # Recevoir les bytes de l'image depuis React
            image_bytes = await websocket.receive_bytes()

            # Décoder l'image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img   = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                await websocket.send_json({"error": "Image invalide"})
                continue

            # Lancer la détection
            detections = run_detection(img, yolo, efficientnet, idx2label)

            known   = []
            unknown = []

            for det in detections:
                x, y, w, h = det["bbox"]

                if det["known"]:
                    produit = db.query(Produit).filter(
                        Produit.nom == det["label"]
                    ).first()

                    known.append({
                        "produit_id": str(produit.id) if produit else None,
                        "label":      det["label"],
                        "confidence": det["confidence"],
                        "prix":       float(produit.prix) if produit and produit.prix else 0.0,  # ← AJOUTER
                        "bbox":       {"x": x, "y": y, "w": w, "h": h}
                    })
                else:
                    unknown.append({
                        "bbox": {"x": x, "y": y, "w": w, "h": h}
                    })

            # Envoyer le résultat à React
            await websocket.send_json({
                "known_products":   known,
                "unknown_products": unknown,
                "total_detected":   len(known) + len(unknown)
            })

    except WebSocketDisconnect:
        print("🔌 Client déconnecté")