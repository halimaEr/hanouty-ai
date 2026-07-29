from sqlalchemy.orm import Session
from models import LigneVente


# -------- CREATE --------
def create_ligne_vente(db: Session, data):

    db_ligne = LigneVente(
        vente_id=data.vente_id,
        produit_id=data.produit_id,
        quantite=data.quantite
    )

    db.add(db_ligne)
    db.commit()
    db.refresh(db_ligne)

    return db_ligne


# -------- GET ALL --------
def get_lignes(db: Session, skip: int = 0, limit: int = 100):

    return db.query(LigneVente).offset(skip).limit(limit).all()


# -------- GET BY ID --------
def get_ligne(db: Session, ligne_id: str):

    return db.query(LigneVente).filter(LigneVente.id == ligne_id).first()


# -------- DELETE --------
def delete_ligne(db: Session, ligne_id: str):

    db_ligne = db.query(LigneVente).filter(LigneVente.id == ligne_id).first()

    if not db_ligne:
        return False

    db.delete(db_ligne)
    db.commit()
    return True

def update_ligne(db: Session, ligne_id: str, data):

    db_ligne = db.query(LigneVente).filter(LigneVente.id == ligne_id).first()

    if not db_ligne:
        return None

    if data.vente_id:
        db_ligne.vente_id = data.vente_id

    if data.produit_id:
        db_ligne.produit_id = data.produit_id

    if data.quantite is not None:
        db_ligne.quantite = data.quantite

    db.commit()
    db.refresh(db_ligne)

    return db_ligne 