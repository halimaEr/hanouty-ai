from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine
from models import Base
from routers import user, categorie, marque, produit, image, vente, ligne_vente, dashboard, detection
from dotenv import load_dotenv
from model_loader import init_models

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_models()          # au démarrage
    yield                  
                           

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Création automatique des tables
Base.metadata.create_all(bind=engine)

# Routers
app.include_router(user.router)
app.include_router(categorie.router)
app.include_router(marque.router)
app.include_router(produit.router)
app.include_router(image.router)
app.include_router(vente.router)
app.include_router(ligne_vente.router)
app.include_router(dashboard.router)
app.include_router(detection.router)

@app.get("/")
def root():
    return {"message": "API running"}