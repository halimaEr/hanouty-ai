from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal

from schemas.categorie import CategorieCreate, CategorieOut, CategorieUpdate
from services import categorie as crud_categorie

router = APIRouter(prefix="/categories", tags=["categories"])


# -------- DB Dependency --------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------- Create categorie --------
@router.post("/add", response_model=CategorieOut)
def create_categorie_endpoint(categorie: CategorieCreate, db: Session = Depends(get_db)):

    db_categorie = crud_categorie.create_categorie(db, categorie)

    if db_categorie is None:
        raise HTTPException(
            status_code=400,
            detail="Cette catégorie existe déjà"
        )

    return db_categorie


# -------- Get all categories --------
@router.get("/", response_model=list[CategorieOut])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_categorie.get_categories(db, skip=skip, limit=limit)


# -------- Get categorie by ID --------
@router.get("/{categorie_id}", response_model=CategorieOut)
def read_categorie(categorie_id: str, db: Session = Depends(get_db)):

    db_categorie = crud_categorie.get_categorie(db, categorie_id)

    if db_categorie is None:
        raise HTTPException(status_code=404, detail="Categorie non trouvée")

    return db_categorie


# -------- Update categorie --------
@router.put("/{categorie_id}", response_model=CategorieOut)
def update_categorie_endpoint(
    categorie_id: str,
    categorie: CategorieUpdate,
    db: Session = Depends(get_db)
):

    result = crud_categorie.update_categorie(db, categorie_id, categorie)

    if result is None:
        raise HTTPException(status_code=404, detail="Categorie non trouvée")

    if result == "exists":
        raise HTTPException(
            status_code=400,
            detail="Cette catégorie existe déjà"
        )

    return result


# -------- Delete categorie --------
@router.delete("/{categorie_id}")
def delete_categorie_endpoint(categorie_id: str, db: Session = Depends(get_db)):

    deleted = crud_categorie.delete_categorie(db, categorie_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Categorie non trouvée")

    return {"message": "Categorie supprimée"}