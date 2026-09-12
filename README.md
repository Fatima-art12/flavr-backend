# Flavr Backend

Backend API for **Flavr** — a full-stack recipe discovery web app. Built with Node.js, Express, and MySQL.

## Features

- **Authentication** — signup/login with JWT tokens, passwords hashed with bcrypt
- **Recipes API** — full CRUD (create, read, update, delete) for recipes
- **Admin controls** — recipe management restricted to admin users
- **Image uploads** — profile pictures and recipe images handled via Multer
- **MySQL database** — relational data for users and recipes

## Tech Stack

- Node.js + Express
- MySQL (mysql2)
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- multer (file uploads)
- cors

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup` | Register a new user |
| POST | `/api/login` | Log in and receive a JWT |
| GET | `/api/recipes` | Get all recipes |
| POST | `/api/recipes` | Add a new recipe (admin) |
| PUT | `/api/recipes/:id` | Update a recipe (admin) |
| DELETE | `/api/recipes/:id` | Delete a recipe (admin) |
| POST | `/api/upload-profile-picture` | Upload a user's profile picture |
| POST | `/api/upload-recipe-image` | Upload a recipe image (admin) |

## Getting Started

```bash
npm install
node server.js
```

The server runs on `http://localhost:5000` by default.

## Related

Frontend repo: [flavr-frontend](https://github.com/Fatima-art12/flavr-frontend)
