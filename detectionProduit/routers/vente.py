from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas.vente import VenteCreate, VenteOut,VenteCreateV2
from services import vente as crud_vente

router = APIRouter(prefix="/ventes", tags=["ventes"])


# -------- DB --------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.post("/list/ajouter", response_model=VenteOut)
def create_vente_endpoint(vente: VenteCreateV2, db: Session = Depends(get_db)):
    """
    Reçoit une liste de produits et crée la vente + les lignes.
    """
    try:
        new_vente = crud_vente.create_vente_with_lines(db, vente)
        return new_vente
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la vente: {str(e)}")




# -------- CREATE VENTE --------
@router.post("/add", response_model=VenteOut)
def create_vente_endpoint(vente: VenteCreate, db: Session = Depends(get_db)):

    return crud_vente.create_vente(db, vente.user_id)


# -------- GET ALL --------
@router.get("/", response_model=list[VenteOut])
def get_all_ventes(db: Session = Depends(get_db)):

    return crud_vente.get_ventes(db)


# -------- GET BY ID --------
@router.get("/{vente_id}", response_model=VenteOut)
def get_vente_endpoint(vente_id: str, db: Session = Depends(get_db)):

    vente = crud_vente.get_vente(db, vente_id)

    if not vente:
        raise HTTPException(status_code=404, detail="Vente introuvable")

    return vente


@router.get("/user/{user_id}")
def read_ventes_by_user(user_id: str, db: Session = Depends(get_db)):
    return crud_vente.get_ventes_by_user(db, user_id)


# -------- DELETE --------
# @router.delete("/{vente_id}")
# def delete_vente_endpoint(vente_id: str, db: Session = Depends(get_db)):

#     deleted = crud_vente.delete_vente(db, vente_id)

#     if not deleted:
#         raise HTTPException(status_code=404, detail="Vente introuvable")

#     return {"message": "Vente supprimée"}


@router.delete("/{vente_id}")
def delete_vente_endpoint(vente_id: str, db: Session = Depends(get_db)):
    # Le service doit gérer la suppression de la vente ET de ses lignes
    deleted = crud_vente.delete_vente(db, vente_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Vente introuvable")
        
    return {"message": "Vente et ses lignes supprimées avec succès"}