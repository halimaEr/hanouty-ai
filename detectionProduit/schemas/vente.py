from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional





class LigneVenteItem(BaseModel):
    produit_id: str
    quantite: int = 1  # Par défaut 1 si non spécifié

class VenteCreateV2(BaseModel):
    user_id: str
    products: List[LigneVenteItem]  # Liste des produits sélectionnés
    total_amount: Optional[float] = 0.0  # Optionnel : calculé côté backend ou frontend


# -------- CREATE VENTE --------
class VenteCreate(BaseModel):
    user_id: str


# -------- OUT --------
class VenteOut(BaseModel):
    id: str
    date: datetime
    user_id: str

    class Config:
        from_attributes = True