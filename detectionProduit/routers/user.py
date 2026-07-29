from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas.user import UserCreate, UserOut,UserUpdate
from services import user as crud_user
from dependencies import get_db, get_current_user
from auth import create_access_token
from pydantic import BaseModel

router = APIRouter(prefix="/users", tags=["users"])


class LoginRequest(BaseModel):
    email: str
    password: str

# Dépendance pour la DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.post("/admin/add", response_model=UserOut)
def create_admin_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    return crud_user.create_admin(db, user)


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = crud_user.authenticate_user(db, data.email, data.password)

    if not user:
        raise HTTPException(401, "Email ou mot de passe incorrect")

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role  # 👈 ajoute le rôle ici
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "nom": current_user.nom,
        "email": current_user.email
    }

# Lire tous les utilisateurs
@router.get("/", response_model=list[UserOut])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_user.get_users(db, skip=skip, limit=limit)

# Lire un utilisateur par ID 
@router.get("/{user_id}", response_model=UserOut)
def read_user(user_id: str, db: Session = Depends(get_db)):
    db_user = crud_user.get_user(db, user_id)

    if db_user is None:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return db_user


# update un utilisateur
@router.put("/{user_id}", response_model=UserOut)
def update_user_endpoint(
    user_id: str,
    user: UserUpdate,
    db: Session = Depends(get_db)
):
    db_user = crud_user.update_user(db, user_id, user)

    if db_user is None:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return db_user


# delete un utilisateur
@router.delete("/{user_id}")
def delete_user_endpoint(user_id: str, db: Session = Depends(get_db)):

    deleted = crud_user.delete_user(db, user_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return {"message": "Utilisateur supprimé"}




# Endpoint pour l'inscription (enregistré dans une table "pending_users" en attendant validation par un admin)
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    pending_user = crud_user.create_pending_user(db, user)

    return {"message": "Inscription réussie, en attente de validation par un administrateur"}


@router.get("/pending/get", response_model=list[UserOut])
def get_pending_users(db: Session = Depends(get_db)):
    return crud_user.get_all_pending_users(db)


@router.post("/pending/approve/{pending_user_id}", response_model=UserOut)
def approve_pending_user(pending_user_id: str, db: Session = Depends(get_db)):
    user = crud_user.approve_pending_user(db, pending_user_id)

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur en attente non trouvé")

    return user

@router.delete("/pending/{pending_user_id}")
def delete_pending_user(pending_user_id: str, db: Session = Depends(get_db)):
    deleted = crud_user.delete_pending_user(db, pending_user_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Utilisateur en attente non trouvé")

    return {"message": "Utilisateur en attente supprimé"}



@router.get("/pending/{pending_user_id}", response_model=UserOut)
def get_pending_user(pending_user_id: str, db: Session = Depends(get_db)):
    pending_user = crud_user.get_pending_user(db, pending_user_id)

    if not pending_user:
        raise HTTPException(status_code=404, detail="Utilisateur en attente non trouvé")

    return pending_user





