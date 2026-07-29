from pydantic import BaseModel
from typing import Optional

# -------- Base --------
class CategorieBase(BaseModel):
    nom: str

# -------- Create --------
class CategorieCreate(CategorieBase):
    pass

# -------- Response --------
class CategorieOut(CategorieBase):
    id: str

    class Config:
        from_attributes = True

# -------- Update --------
class CategorieUpdate(BaseModel):
    nom: Optional[str] = None

