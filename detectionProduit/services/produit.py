from sqlalchemy.orm import Session,joinedload
from models import Produit
from schemas.produit import ProduitCreate, ProduitUpdate


# -------- GET ONE --------
def get_produit(db: Session, produit_id: str):
    return db.query(Produit).filter(Produit.id == produit_id).first()


# -------- GET ALL --------
def get_produits(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Produit).offset(skip).limit(limit).all()

#-------- GET BY USER --------
def get_produits_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return (
        db.query(Produit)
        .filter(Produit.user_id == user_id)
        .options(
            joinedload(Produit.marque),
            joinedload(Produit.categorie)
        )
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_produits_detailles(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(Produit)
        .options(
            joinedload(Produit.marque),
            joinedload(Produit.categorie)
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
# -------- CREATE --------
def create_produit(db: Session, produit: ProduitCreate):

    db_produit = Produit(
        nom=produit.nom,
        prix=produit.prix,
        poids_valeur=produit.poids_valeur,
        poids_unite=produit.poids_unite,
        user_id=produit.user_id,
        marque_id=produit.marque_id,
        categorie_id=produit.categorie_id
    )

    db.add(db_produit)
    db.commit()
    db.refresh(db_produit)

    return db_produit


# -------- UPDATE --------
def update_produit(db: Session, produit_id: str, produit: ProduitUpdate):

    db_produit = db.query(Produit).filter(Produit.id == produit_id).first()

    if not db_produit:
        return None

    if produit.nom:
        db_produit.nom = produit.nom

    if produit.prix:
        db_produit.prix = produit.prix

    if produit.poids_valeur:
        db_produit.poids_valeur = produit.poids_valeur

    if produit.poids_unite:
        db_produit.poids_unite = produit.poids_unite

    if produit.user_id:
        db_produit.user_id = produit.user_id

    if produit.marque_id:
        db_produit.marque_id = produit.marque_id

    if produit.categorie_id:
        db_produit.categorie_id = produit.categorie_id

    db.commit()
    db.refresh(db_produit)

    return db_produit


# -------- DELETE --------
def delete_produit(db: Session, produit_id: str):

    db_produit = db.query(Produit).filter(Produit.id == produit_id).first()

    if not db_produit:
        return False

    db.delete(db_produit)
    db.commit()

    return True