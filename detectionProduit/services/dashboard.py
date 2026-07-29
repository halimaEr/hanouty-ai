

from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from models import Vente, LigneVente, Produit
from datetime import date


# =====================================================
#  Quantité vendue par mois (PAR USER)
# =====================================================
def quantite_par_mois_user(db: Session, user_id: str, year: int):
    results = (
        db.query(
            extract('month', Vente.date).label('month'),
            func.coalesce(func.sum(LigneVente.quantite), 0).label('total_quantite')
        )
        .join(LigneVente, LigneVente.vente_id == Vente.id)
        .filter(Vente.user_id == user_id)
        .filter(extract('year', Vente.date) == year)
        .group_by('month')
        .order_by('month')
        .all()
    )
    return [
        {"month": int(r.month), "quantite": int(r.total_quantite)}
        for r in results
    ]


# =====================================================
#  Chiffre d'affaire par mois (PAR USER)
# =====================================================
def chiffre_affaire_par_mois_user(db: Session, user_id: str, year: int):
    results = (
        db.query(
            extract('month', Vente.date).label('month'),
            func.coalesce(func.sum(LigneVente.quantite * Produit.prix), 0).label('ca')
        )
        .join(LigneVente, LigneVente.vente_id == Vente.id)
        .join(Produit, Produit.id == LigneVente.produit_id)
        .filter(Vente.user_id == user_id)
        .filter(extract('year', Vente.date) == year)
        .group_by('month')
        .order_by('month')
        .all()
    )
    return [
        {"month": int(r.month), "ca": float(r.ca)}
        for r in results
    ]


# =====================================================
#  Top 7 produits (PAR USER)
# =====================================================
def top_7_produits_user(db: Session, user_id: str):
    results = (
        db.query(
            Produit.nom.label("produit"),
            func.sum(LigneVente.quantite).label("quantite")
        )
        .join(LigneVente, LigneVente.produit_id == Produit.id)
        .join(Vente, Vente.id == LigneVente.vente_id)
        .filter(Vente.user_id == user_id)
        .group_by(Produit.nom)
        .order_by(func.sum(LigneVente.quantite).desc())
        .limit(7)
        .all()
    )
    return [
        {"produit": r.produit, "quantite": int(r.quantite)}
        for r in results
    ]


# =====================================================
#  KPIs du mois courant (PAR USER)
# =====================================================
def kpis_user(db: Session, user_id: str, year: int = None):
    aujourd_hui = date.today()
    mois_courant = aujourd_hui.month
    annee_courante = year if year else aujourd_hui.year

    ventes_ce_mois = (
        db.query(func.count(Vente.id))
        .filter(Vente.user_id == user_id)
        .filter(extract('month', Vente.date) == mois_courant)
        .filter(extract('year', Vente.date) == annee_courante)
        .scalar() or 0
    )

    produit_star = (
        db.query(
            Produit.nom.label("nom"),
            func.sum(LigneVente.quantite).label("total_vendu")
        )
        .join(LigneVente, LigneVente.produit_id == Produit.id)
        .join(Vente, Vente.id == LigneVente.vente_id)
        .filter(Vente.user_id == user_id)
        .filter(extract('month', Vente.date) == mois_courant)
        .filter(extract('year', Vente.date) == annee_courante)
        .group_by(Produit.nom)
        .order_by(func.sum(LigneVente.quantite).desc())
        .first()
    )

    result_panier = (
        db.query(
            func.coalesce(func.sum(LigneVente.quantite * Produit.prix), 0).label("ca_total"),
            func.coalesce(func.count(func.distinct(Vente.id)), 1).label("nb_ventes")
        )
        .join(LigneVente, LigneVente.vente_id == Vente.id)
        .join(Produit, Produit.id == LigneVente.produit_id)
        .filter(Vente.user_id == user_id)
        .filter(extract('month', Vente.date) == mois_courant)
        .filter(extract('year', Vente.date) == annee_courante)
        .first()
    )
    panier_moyen = (
        round(float(result_panier.ca_total) / float(result_panier.nb_ventes), 2)
        if result_panier and result_panier.nb_ventes > 0
        else 0.0
    )

    meilleur_jour = (
        db.query(
            Vente.date.label("jour"),
            func.count(Vente.id).label("total")
        )
        .filter(Vente.user_id == user_id)
        .filter(extract('month', Vente.date) == mois_courant)
        .filter(extract('year', Vente.date) == annee_courante)
        .group_by(Vente.date)
        .order_by(func.count(Vente.id).desc())
        .first()
    )

    return {
        "ventes_ce_mois": int(ventes_ce_mois),
        "produit_star": {
            "nom": produit_star.nom if produit_star else None,
            "total_vendu": int(produit_star.total_vendu) if produit_star else 0,
        },
        "panier_moyen": panier_moyen,
        "meilleur_jour": {
            "jour": str(meilleur_jour.jour) if meilleur_jour else None,
            "total": int(meilleur_jour.total) if meilleur_jour else 0,
        },
    }


# =====================================================
#  Admin KPIs globaux
# =====================================================
def admin_kpis(db: Session):
    from models import Produit, Categorie, Marque, Image, User

    total_products   = db.query(func.count(Produit.id)).scalar() or 0
    total_categories = db.query(func.count(Categorie.id)).scalar() or 0
    total_marques    = db.query(func.count(Marque.id)).scalar() or 0
    total_images     = db.query(func.count(Image.id)).scalar() or 0
    total_clients    = db.query(func.count(User.id)).scalar() or 0

    return {
        "total_products":   int(total_products),
        "total_categories": int(total_categories),
        "total_marques":    int(total_marques),
        "total_images":     int(total_images),
        "total_clients":    int(total_clients),
        "new_images":       0,
    }


# =====================================================
#  Images par produit (ADMIN)
# =====================================================
def admin_images_per_product(db: Session):
    from models import Produit, Image

    results = (
        db.query(
            Produit.nom.label("produit"),
            func.count(Image.id).label("images")
        )
        .outerjoin(Image, Image.produit_id == Produit.id)
        .group_by(Produit.nom)
        .order_by(func.count(Image.id).desc())
        .all()
    )
    return [
        {"produit": r.produit, "images": int(r.images)}
        for r in results
    ]




    # =====================================================
#  CA jour par jour pour un mois donné (PAR USER)
# =====================================================
def ca_par_jour_user(db: Session, user_id: str, year: int, month: int):
    results = (
        db.query(
            extract('day', Vente.date).label('day'),
            func.coalesce(func.sum(LigneVente.quantite * Produit.prix), 0).label('ca')
        )
        .join(LigneVente, LigneVente.vente_id == Vente.id)
        .join(Produit, Produit.id == LigneVente.produit_id)
        .filter(Vente.user_id == user_id)
        .filter(extract('year',  Vente.date) == year)
        .filter(extract('month', Vente.date) == month)
        .group_by('day')
        .order_by('day')
        .all()
    )

    # Construire un dict jour → ca pour lookup rapide
    ca_by_day = {int(r.day): float(r.ca) for r in results}

    # Retourner TOUS les jours du mois (même ceux sans vente = 0)
    import calendar
    nb_jours = calendar.monthrange(year, month)[1]

    return [
        {
            "day":   day,
            "ca":    ca_by_day.get(day, 0.0)
        }
        for day in range(1, nb_jours + 1)
    ]