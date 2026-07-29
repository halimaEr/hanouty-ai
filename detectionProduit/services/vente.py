from sqlalchemy.orm import Session, joinedload
from models import Vente,LigneVente
from schemas.vente import VenteCreateV2
import uuid
from datetime import datetime






def create_vente_with_lines(db: Session, vente_data: VenteCreateV2):
 
    print("------------------------------------------------")
    print(f"DEBUG: User ID reçu : {vente_data.user_id}")
    print(f"DEBUG: Type de vente_data.products : {type(vente_data.products)}")
    print(f"DEBUG: Nombre de produits reçus : {len(vente_data.products)}") # <--- C'est la clé
    if len(vente_data.products) == 0:
        print("ERREUR: La liste des produits est VIDE !")

    for i, item in enumerate(vente_data.products):
        print(f"DEBUG: Produit {i} -> ID: {item.produit_id}, Qté: {item.quantite}")
    print("------------------------------------------------")


    try:
        # 1. Créer l'en-tête de la vente
        db_vente = Vente(
            id=str(uuid.uuid4()),
            user_id=vente_data.user_id,
            date=datetime.utcnow()
        )
        db.add(db_vente)
        
        db.flush() 

        # 2. Créer les lignes de vente
        for item in vente_data.products:
            db_ligne = LigneVente(
                id=str(uuid.uuid4()),
                vente_id=db_vente.id,  # Liaison avec la vente créée ci-dessus
                produit_id=item.produit_id,
                quantite=item.quantite
            )
            db.add(db_ligne)

        # 3. Committer tout ensemble
        db.commit()
        
        # 4. Rafraîchir l'objet vente pour retourner les données à jour (avec les relations si besoin)
        db.refresh(db_vente)
        
        return db_vente

    except Exception as e:
        db.rollback()  # En cas d'erreur, on annule tout
        raise e




# -------- CREATE --------
def create_vente(db: Session, user_id: str):

    db_vente = Vente(
        user_id=user_id
    )

    db.add(db_vente)
    db.commit()
    db.refresh(db_vente)

    return db_vente


# -------- GET ALL --------
def get_ventes(db: Session, skip: int = 0, limit: int = 100):

    return db.query(Vente)\
        .options(joinedload(Vente.user))\
        .offset(skip)\
        .limit(limit)\
        .all()


# -------- GET BY ID --------
def get_vente(db: Session, vente_id: str):

    return db.query(Vente)\
        .options(joinedload(Vente.user))\
        .filter(Vente.id == vente_id)\
        .first()


# -------- DELETE --------
# def delete_vente(db: Session, vente_id: str):

#     db_vente = db.query(Vente).filter(Vente.id == vente_id).first()

#     if not db_vente:
#         return False

#     db.delete(db_vente)
#     db.commit()
#     return True



def get_ventes_by_user(db: Session, user_id: str):
    ventes = (
        db.query(Vente)
        .options(
            joinedload(Vente.lignes)
            .joinedload(LigneVente.produit)
        )
        .filter(Vente.user_id == user_id)
        .all()
    )

    result = []

    for vente in ventes:
        for ligne in vente.lignes:
            produit = ligne.produit

            result.append({
                "vente_id": vente.id,
                "date": vente.date,
                "quantite": ligne.quantite,
                "produit": {
                    "id": produit.id,
                    "nom": produit.nom,
                    "poids_valeur": produit.poids_valeur,
                    "poids_unite": produit.poids_unite,
                    "prix": produit.prix
                }
            })

    return result

def delete_vente(db: Session, vente_id: str):
    # 1. Trouver la vente
    db_vente = db.query(Vente).filter(Vente.id == vente_id).first()
    if not db_vente:
        return False

    # 2. Supprimer d'abord les lignes de vente associées (Sécurité maximale)
    db.query(LigneVente).filter(LigneVente.vente_id == vente_id).delete()
    
    # 3. Supprimer la vente elle-même
    db.delete(db_vente)
    db.commit()
    
    return True