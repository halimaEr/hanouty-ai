from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime,Boolean
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime




class PendingUser(Base):
    __tablename__ = "pending_users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nom = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# -----------------------
# USER
# -----------------------
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nom = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    created_at = Column(DateTime, default=datetime.utcnow)


    produits = relationship("Produit", back_populates="user")
    ventes = relationship("Vente", back_populates="user")


# -----------------------
# CATEGORIE
# -----------------------
class Categorie(Base):
    __tablename__ = "categorie"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nom = Column(String, nullable=False,unique=True)

    produits = relationship("Produit", back_populates="categorie")


# -----------------------
# MARQUE
# -----------------------
class Marque(Base):
    __tablename__ = "marque"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nom = Column(String, nullable=False,unique=True)

    produits = relationship("Produit", back_populates="marque")


# -----------------------
# PRODUIT
# -----------------------
class Produit(Base):
    __tablename__ = "produit"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nom = Column(String, nullable=False)

    user_id = Column(String, ForeignKey("users.id"))
    marque_id = Column(String, ForeignKey("marque.id"))
    categorie_id = Column(String, ForeignKey("categorie.id"))

    poids_valeur = Column(Float)
    poids_unite = Column(String)
    prix = Column(Float)

    user = relationship("User", back_populates="produits")
    marque = relationship("Marque", back_populates="produits")
    categorie = relationship("Categorie", back_populates="produits")

    images = relationship("Image", back_populates="produit")
    lignes_vente = relationship("LigneVente", back_populates="produit")


# -----------------------
# IMAGE
# -----------------------
class Image(Base):
    __tablename__ = "image"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    file_url = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    produit_id = Column(String, ForeignKey("produit.id"), nullable=True)

    is_new = Column(Boolean, default=True)


    produit = relationship("Produit", back_populates="images")


# -----------------------
# VENTE
# -----------------------
class Vente(Base):
    __tablename__ = "vente"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    date = Column(DateTime, default=datetime.utcnow)

    user_id = Column(String, ForeignKey("users.id"))

    user = relationship("User", back_populates="ventes")

    lignes = relationship("LigneVente", back_populates="vente")


# -----------------------
# LIGNE VENTE
# -----------------------
class LigneVente(Base):
    __tablename__ = "ligne_vente"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    quantite = Column(Integer)

    vente_id = Column(String, ForeignKey("vente.id"))
    produit_id = Column(String, ForeignKey("produit.id"))

    vente = relationship("Vente", back_populates="lignes")
    produit = relationship("Produit", back_populates="lignes_vente")