from pydantic import BaseModel
from typing import Optional


# ---------------- RESPONSE ----------------
class ImageOut(BaseModel):
    id: str
    file_url: str
    produit_id: Optional[str] = None
    is_new: Optional[bool] = True
    class Config:
        from_attributes = True