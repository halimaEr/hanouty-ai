from sqlalchemy.orm import Session
from models import Marque
from schemas.marque import MarqueCreate, MarqueUpdate


# -------- GET BY ID --------
def get_marque(db: Session, marque_id: str):
    return db.query(Marque).filter(Marque.id == marque_id).first()


# -------- GET ALL --------
def get_marques(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Marque).offset(skip).limit(limit).all()


# -------- CREATE --------
def create_marque(db: Session, marque: MarqueCreate):

    existing = db.query(Marque).filter(Marque.nom == marque.nom).first()

    if existing:
        return None

    db_marque = Marque(nom=marque.nom)

    db.add(db_marque)
    db.commit()
    db.refresh(db_marque)

    return db_marque


# -------- UPDATE --------
def update_marque(db: Session, marque_id: str, marque: MarqueUpdate):

    db_marque = db.query(Marque).filter(Marque.id == marque_id).first()

    if not db_marque:
        return None

    if marque.nom:
        existing = db.query(Marque).filter(Marque.nom == marque.nom).first()

        if existing and existing.id != marque_id:
            return "exists"

        db_marque.nom = marque.nom

    db.commit()
    db.refresh(db_marque)

    return db_marque


# -------- DELETE --------
def delete_marque(db: Session, marque_id: str):

    db_marque = db.query(Marque).filter(Marque.id == marque_id).first()

    if not db_marque:
        return False

    db.delete(db_marque)
    db.commit()

    return True