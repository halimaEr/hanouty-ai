from sqlalchemy.orm import Session
from models import User,PendingUser
from schemas.user import UserCreate, UserUpdate
from auth import hash_password, verify_password


def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user: UserCreate):
    db_user = User(
        nom=user.nom,
        email=user.email,
        password_hash=hash_password(user.password),
        role="user"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_admin(db: Session, user: UserCreate):
    db_user = User(
        nom=user.nom,
        email=user.email,
        password_hash=hash_password(user.password),
        role="admin"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def update_user(db: Session, user_id: str, user: UserUpdate):

    db_user = db.query(User).filter(User.id == user_id).first()

    if not db_user:
        return None

    if user.nom:
        db_user.nom = user.nom

    if user.email:
        db_user.email = user.email

    if user.password:
        db_user.password_hash = hash_password(user.password)

    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user(db: Session, user_id: str):
    db_user = db.query(User).filter(User.id == user_id).first()

    if db_user:
        db.delete(db_user)
        db.commit()
        return True

    return False




# -----------------------
# PENDING USER SERVICES
# -----------------------

def get_pending_by_email(db: Session, email: str):
    return db.query(PendingUser).filter(PendingUser.email == email).first()

def create_pending_user(db: Session, user: UserCreate):
    db_pending = PendingUser(
        nom=user.nom,
        email=user.email,
        password_hash=hash_password(user.password)
    )
    db.add(db_pending)
    db.commit()
    db.refresh(db_pending)
    return db_pending

def approve_pending_user(db: Session, user_id: str):
    pending = get_pending_user(db, user_id)

    if not pending:
        return None

    new_user = User(
        nom=pending.nom,
        email=pending.email,
        password_hash=pending.password_hash,
        role="user" 
    )

    db.add(new_user)
    db.delete(pending)
    db.commit()
    db.refresh(new_user)

    return new_user


def get_all_pending_users(db: Session):
    return db.query(PendingUser).all()


def get_pending_user(db: Session, user_id: str):
    return db.query(PendingUser).filter(PendingUser.id == user_id).first()



def delete_pending_user(db: Session, user_id: str):
    pending = get_pending_user(db, user_id)

    if not pending:
        return False

    db.delete(pending)
    db.commit()
    return True