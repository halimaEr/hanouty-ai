from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal

from schemas.produit import ProduitCreate, ProduitOut, ProduitUpdate
from services import produit as crud_produit

router = APIRouter(prefix="/produits", tags=["produits"])


# -------- DB --------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------- CREATE --------
@router.post("/add", response_model=ProduitOut)
def create_produit_endpoint(produit: ProduitCreate, db: Session = Depends(get_db)):
    return crud_produit.create_produit(db, produit)


# -------- GET ALL --------
@router.get("/", response_model=list[ProduitOut])
def get_all_produits(db: Session = Depends(get_db)):
    return crud_produit.get_produits(db)


# -------- GET BY ID --------
@router.get("/{produit_id}", response_model=ProduitOut)
def get_produit(produit_id: str, db: Session = Depends(get_db)):

    db_produit = crud_produit.get_produit(db, produit_id)

    if not db_produit:
        raise HTTPException(status_code=404, detail="Produit non trouvé")

    return db_produit


# get produits by user
@router.get("/user/{user_id}", response_model=list[ProduitOut])
def get_produits_by_user(user_id: str, db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud_produit.get_produits_by_user(db, user_id, skip=skip, limit=limit)


# get produits detailles
@router.get("/all/detailles", response_model=list[ProduitOut])
def get_produits_detailles(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return crud_produit.get_produits_detailles(db, skip=skip, limit=limit)

# -------- UPDATE --------
@router.put("/{produit_id}", response_model=ProduitOut)
def update_produit(
    produit_id: str,
    produit: ProduitUpdate,
    db: Session = Depends(get_db)
):

    db_produit = crud_produit.update_produit(db, produit_id, produit)

    if not db_produit:
        raise HTTPException(status_code=404, detail="Produit non trouvé")

    return db_produit


# -------- DELETE --------
@router.delete("/{produit_id}")
def delete_produit(produit_id: str, db: Session = Depends(get_db)):

    deleted = crud_produit.delete_produit(db, produit_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Produit non trouvé")

    return {"message": "Produit supprimé"}