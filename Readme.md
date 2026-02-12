# Todo API

API REST de gestion de tâches avec authentification JWT.

## Tech Stack

Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Zod

## Installation

```bash
npm install
```

## Configuration

Créer un fichier `.env` :

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/todo-api
JWT_SECRET=ton_secret_ici
```

## Lancer

```bash
npm run dev
```

## Endpoints

### Auth

- `POST /api/auth/register` — Inscription
- `POST /api/auth/login` — Connexion

### Tâches (auth requise)

- `GET /api/tasks` — Lister mes tâches
- `GET /api/tasks/:id` — Voir une tâche
- `POST /api/tasks` — Créer une tâche
- `PUT /api/tasks/:id` — Modifier une tâche
- `DELETE /api/tasks/:id` — Supprimer une tâche

### Profil (auth requise)

- `GET /api/profile` — Voir mon profil
