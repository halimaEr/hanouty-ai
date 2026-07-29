import cv2
import numpy as np
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func                  
from supabase_client import supabase
from services.image import create_image
from model.predictv1 import run_detection
from model_loader import get_models
from models import Produit


async def detect_products(file, db: Session):

    contents = await file.read()
    nparr    = np.frombuffer(contents, np.uint8)
    img      = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Image invalide ou corrompue")

    yolo, efficientnet, idx2label = get_models()
    detections = run_detection(img, yolo, efficientnet, idx2label)

    known   = []
    unknown = []

    for det in detections:
        x, y, w, h = det["bbox"]

        if det["known"]:
            produit = db.query(Produit).filter(
                func.lower(Produit.nom) == det["label"].lower()   # ← MODIFIER ICI
            ).first()

        


            known.append({
                 "produit_id": str(produit.id) if produit else None,
                 "label":      det["label"],
                 "confidence": det["confidence"],
                 "prix":       float(produit.prix) if produit and produit.prix else 0.0,  # ← ICI
                 "bbox":       {"x": x, "y": y, "w": w, "h": h}
            }) 

        else:
            crop = img[y:y+h, x:x+w]
            _, buffer = cv2.imencode(".jpg", crop)
            content   = buffer.tobytes()

            file_path = f"produits/{uuid.uuid4()}.jpg"
            supabase.storage.from_("produits-images").upload(
                file_path,
                content,
                file_options={"content-type": "image/jpeg"}
            )

            file_url = supabase.storage.from_("produits-images").get_public_url(file_path)

            db_image = create_image(
                db=db,
                file_url=file_url,
                file_path=file_path,
                produit_id=None
            )

            unknown.append({
                "bbox":      {"x": x, "y": y, "w": w, "h": h},
                "image_url": file_url,
                "image_id":  db_image.id
            })

    return {
        "known_products":   known,
        "unknown_products": unknown,
        "total_detected":   len(known) + len(unknown)
    }