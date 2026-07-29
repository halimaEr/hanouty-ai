from sqlalchemy.orm import Session
from models import Categorie
from schemas.categorie import CategorieCreate, CategorieUpdate


# -------- Obtenir une categorie --------
def get_categorie(db: Session, categorie_id: str):
    return db.query(Categorie).filter(Categorie.id == categorie_id).first()


# -------- Lister toutes les categories --------
def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Categorie).offset(skip).limit(limit).all()


# -------- Creer categorie --------
def create_categorie(db: Session, categorie: CategorieCreate):

    #  vérifier si existe déjà
    existing = db.query(Categorie).filter(Categorie.nom == categorie.nom).first()

    if existing:
        return None 

    db_categorie = Categorie(nom=categorie.nom)

    db.add(db_categorie)
    db.commit()
    db.refresh(db_categorie)

    return db_categorie


# -------- Update categorie --------
def update_categorie(db: Session, categorie_id: str, categorie: CategorieUpdate):

    db_categorie = db.query(Categorie).filter(Categorie.id == categorie_id).first()

    if not db_categorie:
        return None

    # vérifier si le nouveau nom existe déjà
    if categorie.nom:
        existing = db.query(Categorie).filter(Categorie.nom == categorie.nom).first()

        # si existe ET ce n'est pas la même catégorie
        if existing and existing.id != categorie_id:
            return "exists"

        db_categorie.nom = categorie.nom

    db.commit()
    db.refresh(db_categorie)

    return db_categorie


# -------- Delete categorie --------
def delete_categorie(db: Session, categorie_id: str):

    db_categorie = db.query(Categorie).filter(Categorie.id == categorie_id).first()

    if db_categorie:
        db.delete(db_categorie)
        db.commit()
        return True

    return False