from pydantic import BaseModel


# -------- CREATE --------
class LigneVenteCreate(BaseModel):
    vente_id: str
    produit_id: str
    quantite: int


# -------- OUT --------
class LigneVenteOut(BaseModel):
    id: str
    vente_id: str
    produit_id: str
    quantite: int

    class Config:
        from_attributes = True