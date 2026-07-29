from pydantic import BaseModel
from typing import Optional

# -------- Base --------
class MarqueBase(BaseModel):
    nom: str


# -------- Create --------
class MarqueCreate(MarqueBase):
    pass


# -------- Update --------
class MarqueUpdate(BaseModel):
    nom: Optional[str] = None


# -------- Response --------
class MarqueOut(MarqueBase):
    id: str

    class Config:
        from_attributes = True