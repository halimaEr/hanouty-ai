from sqlalchemy.orm import Session
from models import Image, Produit
from supabase_client import supabase


# ---------------- CREATE ----------------
def create_image(
    db: Session,
    file_url: str,
    file_path: str,
    produit_id: str = None
):

    produit = None

    # vérifier si produit existe
    if produit_id:
        produit = db.query(Produit).filter(Produit.id == produit_id).first()

    db_image = Image(
        file_url=file_url,
        file_path=file_path,  # IMPORTANT
        produit_id=produit.id if produit else None,
        is_new=(produit is None)
    )

    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    return db_image


# ---------------- GET ALL ----------------
def get_images(db: Session):
    return db.query(Image).all()


# ---------------- GET ONE ----------------
def get_image(db: Session, image_id: str):
    return db.query(Image).filter(Image.id == image_id).first()

# get all new images (not linked to any produit)
def get_new_images(db: Session):
    return db.query(Image).filter(Image.is_new.is_(True)).all()


# ---------------- DELETE ----------------
def delete_image(db: Session, image_id: str):

    img = db.query(Image).filter(Image.id == image_id).first()

    if not img:
        return False

    # supprimer fichier Supabase Storage
    if img.file_path:
        supabase.storage.from_("produits-images").remove([img.file_path])

    # supprimer DB
    db.delete(img)
    db.commit()

    return True
# ---------------- LINK IMAGE TO PRODUIT ----------------
def link_image_to_produit(db: Session, image_id: str, produit_id: str):
    img = db.query(Image).filter(Image.id == image_id).first()
    produit = db.query(Produit).filter(Produit.id == produit_id).first()

    if not img or not produit:
        return None

    img.produit_id = produit.id
    img.is_new = False

    db.commit()
    db.refresh(img)

    return img


# get all images linked to a produit
def get_images_by_produit(db: Session, produit_id: str):
    return db.query(Image).filter(Image.produit_id == produit_id).all()

# ---------------- DELINK IMAGE FROM PRODUIT ----------------
def delink_image_from_produit(db: Session, image_id: str):
    img = db.query(Image).filter(Image.id == image_id).first()

    if not img:
        return None

    img.produit_id = None
    img.is_new = True

    db.commit()
    db.refresh(img)

    return img