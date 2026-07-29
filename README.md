# 🛒 HANOUTY AI

HANOUTY AI est une application intelligente de détection et de gestion de produits basée sur l'intelligence artificielle. Elle permet d'identifier automatiquement les produits à partir d'une image, de gérer le stock et les ventes, et de faciliter le travail des commerçants grâce à une interface web moderne.

---

## Fonctionnalités

-  Authentification sécurisée avec JWT
-  Gestion des utilisateurs
-  Gestion des catégories
-  Gestion des marques
-  Gestion des produits
-  Gestion des images des produits
-  Détection automatique des produits grâce à un modèle Deep Learning
-  Ajout automatique des nouveaux produits détectés
-  Gestion des ventes
- Tableau de bord avec statistiques
- Stockage des images sur Supabase Storage

---

##  Architecture

Le projet est composé de deux parties :

```
hanouty-ai
│
├── detectionProduit/        # Backend FastAPI
│
└── hanouty-frontend/        # Frontend React + Vite
```

---

## 🛠️ Technologies utilisées

### Backend

- FastAPI
- SQLAlchemy
- JWT Authentication
- Supabase Storage
- OpenCV
- EfficientNet-B4

### Frontend

- React
- Vite
- Axios
- React Router
- CSS

### Base de données

- PostgreSQL (Supabase)

---

## 🧠 Intelligence Artificielle

Le système utilise un modèle **EfficientNet-B4** entraîné pour reconnaître différents produits alimentaires.

Workflow :

1. Capture ou téléchargement d'une image.
2. Prétraitement de l'image.
3. Prédiction du produit.
4. Si le produit est reconnu :
   - récupération des informations depuis la base de données.
5. Sinon :
   - création automatique d'un produit à valider par l'administrateur.

---

## 📁 Installation

### Cloner le projet

```bash
git clone https://github.com/halimaEr/hanouty-ai.git
cd hanouty-ai
```

---

## Backend

```bash
cd detectionProduit


uvicorn main:app --reload
```

Le backend sera disponible sur :

```
http://127.0.0.1:8000
```


---

## Frontend

```bash
cd hanouty-frontend

npm run dev
```

Le frontend sera disponible sur :

```
http://localhost:5173
```

---

## Variables d'environnement

Créer un fichier `.env` dans le dossier `detectionProduit`.

Exemple :

```env
DATABASE_URL=your_database_url

SUPABASE_URL=your_supabase_url

SUPABASE_KEY=your_supabase_key

SECRET_KEY=your_secret_key
```




---

## 👩‍💻 Équipe

Projet réalisé par :

- Halima Er-reguigue
- Omayma Alami Ouriagli
- Meryem Khayati

---
