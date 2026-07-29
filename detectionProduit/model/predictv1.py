"""
PIPELINE FINAL : best.pt (YOLOv8 entraîné) + EfficientNet-B0 (classification)
──────────────────────────────────────────────────────────────────────────────
Installation :
    pip install ultralytics torch torchvision opencv-python pillow

Usage :
    python predictv1.py --image photo.jpg
    python predictv1.py --camera
"""

import cv2, json, argparse, time, os
import torch
import torch.nn as nn
from torchvision import transforms, models
from ultralytics import YOLO
from PIL import Image as PILImage

# ════════════════════════════════════════════════════════
# CONFIG
# ════════════════════════════════════════════════════════


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

YOLO_PATH      = os.path.join(BASE_DIR, "best.pt")
LABEL_MAP_PATH = os.path.join(BASE_DIR, "label_map.json")


EFFNET_PATH = os.path.join(BASE_DIR, "efficientnet_products.pth.zip")

if not os.path.exists(EFFNET_PATH):
    raise FileNotFoundError(
        f" Modèle EfficientNet introuvable : {EFFNET_PATH}\n"
        "   Vérifiez que le fichier efficientnet_products.pth.zip est bien dans le dossier model/"
    )

YOLO_CONF      = 0.30   # seuil détection YOLO
CONF_THRESHOLD = 0.50   # seuil EfficientNet — en dessous → "Inconnu"
IMG_SIZE       = 224    # EfficientNet-B0 → 224x224
DEVICE         = "cuda" if torch.cuda.is_available() else "cpu"


# ════════════════════════════════════════════════════════
# CHARGER LES MODÈLES
# ════════════════════════════════════════════════════════

def load_yolo():
    print(f"   Chargement YOLO : {YOLO_PATH}")
    return YOLO(YOLO_PATH)


def _load_state_dict_from_path(path: str) -> dict:
    """
    Charge le state_dict depuis un fichier .pth, .pt ou .zip (format PyTorch natif).
    Le format PyTorch ZIP (.zip avec data.pkl, data/, etc.) est lu DIRECTEMENT
    par torch.load() — pas besoin d'extraction manuelle.
    """
    print(f"   Chargement du modèle : {path}")
    # torch.load() gère nativement le format PyTorch ZIP (data.pkl + .data/)
    # C'est exactement le format du fichier .pth.zip reçu
    state_dict = torch.load(path, map_location=DEVICE, weights_only=False)
    print(f"  Modèle chargé avec succès")
    return state_dict


def load_efficientnet(num_classes: int):
    """
    Construit EfficientNet-B4 avec le même classifier que lors de l'entraînement,
    puis charge les poids depuis .pth ou .pth.zip.
    """
    model = models.efficientnet_b0(weights=None)
    in_features = model.classifier[1].in_features  # 1280 pour b0

    # ← Doit correspondre exactement à ce qui a été utilisé lors du train
    model.classifier[1] = nn.Sequential(
        nn.Dropout(p=0.5),
        nn.Linear(in_features, 512),
        nn.ReLU(),
        nn.Dropout(p=0.3),
        nn.Linear(512, num_classes)
    )

    state_dict = _load_state_dict_from_path(EFFNET_PATH)
    model.load_state_dict(state_dict)
    model.eval().to(DEVICE)
    return model


# ════════════════════════════════════════════════════════
# TRANSFORM
# ════════════════════════════════════════════════════════

preprocess = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])


# ════════════════════════════════════════════════════════
# CLASSIFICATION d'un crop
# ════════════════════════════════════════════════════════

def classify(efficientnet, crop_bgr, idx2label):
    img    = PILImage.fromarray(cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB))
    tensor = preprocess(img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        probs = torch.softmax(efficientnet(tensor), dim=1)[0]
    conf, idx = probs.max(0)
    label = str(idx2label.get(str(idx.item()), idx.item()))
    label = label[:18]
    return label, conf.item()


# ════════════════════════════════════════════════════════
# DESSINER LES BOXES SUR LA FRAME
# ════════════════════════════════════════════════════════

def _draw_box(frame, x1, y1, x2, y2, text, color):
    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
    (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
    cv2.rectangle(frame, (x1, y1 - th - 10), (x1 + tw + 6, y1), color, -1)
    cv2.putText(frame, text, (x1 + 3, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 2)


# ════════════════════════════════════════════════════════
# TRAITER UNE FRAME (mode image / caméra — avec affichage)
# ════════════════════════════════════════════════════════

def process(frame, yolo, efficientnet, idx2label):
    results = yolo(frame, conf=YOLO_CONF, verbose=False)[0]
    boxes   = results.boxes.xyxy.cpu().numpy()

    print(f" {len(boxes)} produit(s) détecté(s)")

    for box in boxes:
        x1, y1, x2, y2 = map(int, box)

        pad = 5
        x1p = max(0, x1 - pad)
        y1p = max(0, y1 - pad)
        x2p = min(frame.shape[1], x2 + pad)
        y2p = min(frame.shape[0], y2 + pad)

        crop = frame[y1p:y2p, x1p:x2p]
        if crop.size == 0:
            continue

        label, conf = classify(efficientnet, crop, idx2label)

        if conf >= CONF_THRESHOLD:
            color = (0, 200, 80)           # vert  = reconnu
            text  = f"{label} {conf*100:.0f}%"
        else:
            color = (0, 120, 255)          # orange = inconnu
            text  = f"Inconnu {conf*100:.0f}%"

        print(f"   → {text}")
        _draw_box(frame, x1, y1, x2, y2, text, color)

    return frame


# ════════════════════════════════════════════════════════
# RUN DETECTION — fonction appelée par FastAPI
# ════════════════════════════════════════════════════════

def run_detection(img_numpy, yolo, efficientnet, idx2label):
    """
    Reçoit une image numpy (BGR, depuis cv2.imdecode).
    Retourne une liste de détections structurées pour le service FastAPI.
    """
    results = yolo(img_numpy, conf=YOLO_CONF, verbose=False)[0]
    boxes   = results.boxes.xyxy.cpu().numpy()

    detections = []

    for box in boxes:
        x1, y1, x2, y2 = map(int, box)

        pad = 5
        x1p = max(0, x1 - pad)
        y1p = max(0, y1 - pad)
        x2p = min(img_numpy.shape[1], x2 + pad)
        y2p = min(img_numpy.shape[0], y2 + pad)

        crop = img_numpy[y1p:y2p, x1p:x2p]
        if crop.size == 0:
            continue

        label, conf = classify(efficientnet, crop, idx2label)

        detections.append({
            "label":      label if conf >= CONF_THRESHOLD else None,
            "confidence": round(conf, 4),
            "bbox":       (x1, y1, x2 - x1, y2 - y1),  # (x, y, w, h)
            "known":      conf >= CONF_THRESHOLD
        })

    return detections


# ════════════════════════════════════════════════════════
# MODE IMAGE
# ════════════════════════════════════════════════════════

def run_image(path, yolo, efficientnet, idx2label):
    frame = cv2.imread(path)
    if frame is None:
        print(f" Image non trouvée : {path}")
        return

    h, w = frame.shape[:2]
    if w > 1200:
        frame = cv2.resize(frame, (1200, int(h * 1200 / w)))

    result = process(frame, yolo, efficientnet, idx2label)
    cv2.imwrite("result.jpg", result)
    print("result.jpg sauvegardé")
    cv2.imshow("Résultat", result)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


# ════════════════════════════════════════════════════════
# MODE CAMÉRA
# ════════════════════════════════════════════════════════

def run_camera(yolo, efficientnet, idx2label):
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print(" Caméra non accessible")
        return

    print(" [Q] quitter  [S] screenshot")
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        result = process(frame.copy(), yolo, efficientnet, idx2label)
        cv2.imshow("Détection produits", result)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('s'):
            cv2.imwrite(f"screenshot_{int(time.time())}.jpg", result)
            print("📸 Screenshot sauvegardé")

    cap.release()
    cv2.destroyAllWindows()


# ════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--image",  type=str,            help="Chemin image")
    parser.add_argument("--camera", action="store_true", help="Mode caméra live")
    args = parser.parse_args()

    with open(LABEL_MAP_PATH) as f:
        idx2label = json.load(f)

    print(f" {len(idx2label)} classes | device={DEVICE}")
    print(f"   Modèle EfficientNet : {EFFNET_PATH}")

    yolo         = load_yolo()
    efficientnet = load_efficientnet(len(idx2label))
    print(" best.pt + EfficientNet-B0 chargés\n")

    if args.image:
        run_image(args.image, yolo, efficientnet, idx2label)
    elif args.camera:
        run_camera(yolo, efficientnet, idx2label)
    else:
        print("Usage:")
        print("  python predictv1.py --image photo.jpg")
        print("  python predictv1.py --camera")