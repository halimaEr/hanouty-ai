
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from services import dashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
#  Quantité vendue par mois (par user)
# =====================================================
@router.get("/quantite-par-mois/{user_id}")
def get_quantite_par_mois_user(
    user_id: str,
    year: int,
    db: Session = Depends(get_db)
):
    data = dashboard.quantite_par_mois_user(db, user_id, year)
    if not data:
        return {"message": "Aucune donnée trouvée pour cette année"}
    return data


# =====================================================
#  Chiffre d'affaire par mois (par user)
# =====================================================
@router.get("/chiffre-affaire/{user_id}")
def get_ca_par_mois_user(
    user_id: str,
    year: int,
    db: Session = Depends(get_db)
):
    data = dashboard.chiffre_affaire_par_mois_user(db, user_id, year)
    if not data:
        return {"message": "Aucune donnée trouvée pour cette année"}
    return data


# =====================================================
#  Top 7 produits (par user)
# =====================================================
@router.get("/top-7-produits/{user_id}")
def get_top_7_produits(
    user_id: str,
    db: Session = Depends(get_db)
):
    data = dashboard.top_7_produits_user(db, user_id)
    if not data:
        return {"message": "Aucune donnée trouvée"}
    return data


# =====================================================
#  KPIs du mois courant (par user)
# =====================================================
@router.get("/kpis/{user_id}")
def get_kpis_user(
    user_id: str,
    year: int = None,
    db: Session = Depends(get_db)
):
    data = dashboard.kpis_user(db, user_id, year)
    return data


# =====================================================
#  Admin KPIs globaux
# =====================================================
@router.get("/admin/kpis")
def get_admin_kpis(db: Session = Depends(get_db)):
    data = dashboard.admin_kpis(db)
    return data


# =====================================================
#  Images par produit
# =====================================================
@router.get("/admin/images-per-product")
def get_admin_images_per_product(db: Session = Depends(get_db)):
    data = dashboard.admin_images_per_product(db)
    return data




@router.get("/stats/ca-jour")
def get_ca_par_jour(
    year:    int,
    month:   int,
    user_id: str,
    db:      Session = Depends(get_db)
):
    return dashboard.ca_par_jour_user(db, user_id, year, month)