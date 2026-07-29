from pydantic import BaseModel
from typing import Optional


# -------- MARQUE --------
class MarqueOut(BaseModel):
    id: str
    nom: str

    class Config:
        from_attributes = True


# -------- CATEGORIE --------
class CategorieOut(BaseModel):
    id: str
    nom: str

    class Config:
        from_attributes = True


# -------- BASE --------
class ProduitBase(BaseModel):
    nom: str
    prix: float

    poids_valeur: Optional[float] = None
    poids_unite: Optional[str] = None

    user_id: str
    marque_id: str
    categorie_id: str


# -------- CREATE --------
class ProduitCreate(ProduitBase):
    pass


# -------- UPDATE --------
class ProduitUpdate(BaseModel):
    nom: Optional[str] = None
    prix: Optional[float] = None

    poids_valeur: Optional[float] = None
    poids_unite: Optional[str] = None

    user_id: Optional[str] = None
    marque_id: Optional[str] = None
    categorie_id: Optional[str] = None


# -------- RESPONSE --------
class ProduitOut(BaseModel):
    id: str
    nom: Optional[str] = None
    prix: Optional[float] = None

    poids_valeur: Optional[float] = None
    poids_unite: Optional[str] = None

    marque: Optional[MarqueOut] = None
    categorie: Optional[CategorieOut] = None

    class Config:
        from_attributes = True