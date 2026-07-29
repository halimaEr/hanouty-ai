from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal

from schemas.marque import MarqueCreate, MarqueOut, MarqueUpdate
from services import marque as crud_marque

router = APIRouter(prefix="/marques", tags=["marques"])


# -------- DB --------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------- CREATE --------
@router.post("/add", response_model=MarqueOut)
def create_marque_endpoint(marque: MarqueCreate, db: Session = Depends(get_db)):

    result = crud_marque.create_marque(db, marque)

    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Cette marque existe déjà"
        )

    return result


# -------- GET ALL --------
@router.get("/", response_model=list[MarqueOut])
def get_all_marques(db: Session = Depends(get_db)):
    return crud_marque.get_marques(db)


# -------- GET BY ID --------
@router.get("/{marque_id}", response_model=MarqueOut)
def get_marque(marque_id: str, db: Session = Depends(get_db)):

    db_marque = crud_marque.get_marque(db, marque_id)

    if not db_marque:
        raise HTTPException(status_code=404, detail="Marque non trouvée")

    return db_marque


# -------- UPDATE --------
@router.put("/{marque_id}", response_model=MarqueOut)
def update_marque(
    marque_id: str,
    marque: MarqueUpdate,
    db: Session = Depends(get_db)
):

    result = crud_marque.update_marque(db, marque_id, marque)

    if result is None:
        raise HTTPException(status_code=404, detail="Marque non trouvée")

    if result == "exists":
        raise HTTPException(
            status_code=400,
            detail="Cette marque existe déjà"
        )

    return result


# -------- DELETE --------
@router.delete("/{marque_id}")
def delete_marque(marque_id: str, db: Session = Depends(get_db)):

    deleted = crud_marque.delete_marque(db, marque_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Marque non trouvée")

    return {"message": "Marque supprimée"}