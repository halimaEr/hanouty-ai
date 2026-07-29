import json
from model.predictv1 import run_detection, load_yolo, load_efficientnet, LABEL_MAP_PATH
_yolo         = None
_efficientnet = None
_idx2label    = None

def init_models():
    global _yolo, _efficientnet, _idx2label

    with open(LABEL_MAP_PATH) as f:        
        _idx2label = json.load(f)

    _yolo         = load_yolo()
    _efficientnet = load_efficientnet(len(_idx2label))
    print(f"Modèles chargés — {len(_idx2label)} classes")

def get_models():
    if _yolo is None or _efficientnet is None:
        raise RuntimeError("Modèles non initialisés. Appeler init_models() au démarrage.")
    return _yolo, _efficientnet, _idx2label