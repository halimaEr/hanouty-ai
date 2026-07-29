from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal

from schemas.ligne_vente import LigneVenteCreate, LigneVenteOut
from services import ligne_vente as crud_ligne

router = APIRouter(prefix="/lignes-vente", tags=["lignes-vente"])


# -------- DB --------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------- CREATE --------
@router.post("/add", response_model=LigneVenteOut)
def create_ligne(ligne: LigneVenteCreate, db: Session = Depends(get_db)):

    return crud_ligne.create_ligne_vente(db, ligne)


# -------- GET ALL --------
@router.get("/", response_model=list[LigneVenteOut])
def get_all_lignes(db: Session = Depends(get_db)):

    return crud_ligne.get_lignes(db)


# -------- GET BY ID --------
@router.get("/{ligne_id}", response_model=LigneVenteOut)
def get_ligne_endpoint(ligne_id: str, db: Session = Depends(get_db)):

    ligne = crud_ligne.get_ligne(db, ligne_id)

    if not ligne:
        raise HTTPException(status_code=404, detail="Ligne vente introuvable")

    return ligne


# -------- DELETE --------
@router.delete("/{ligne_id}")
def delete_ligne_endpoint(ligne_id: str, db: Session = Depends(get_db)):

    deleted = crud_ligne.delete_ligne(db, ligne_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Ligne vente introuvable")

    return {"message": "Ligne supprimée"}

@router.put("/{ligne_id}", response_model=LigneVenteOut)
def update_ligne_endpoint(ligne_id: str, ligne: LigneVenteCreate, db: Session = Depends(get_db)):

    updated_ligne = crud_ligne.update_ligne(db, ligne_id, ligne)

    if not updated_ligne:
        raise HTTPException(status_code=404, detail="Ligne vente introuvable")

    return updated_ligne