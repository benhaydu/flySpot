# flySpot

An interactive fishing map for Vancouver Island. Click any river to see live weather, BC fishing regulations, available species, and your logged catches — all in a pixel-art Pokédex-style UI.

## Features

- Interactive map powered by MapLibre GL
- River info panel with live weather (open-meteo) and BC fishing regulations
- Species tracker — locked sprites unlock when you catch a fish
- Log catches with species, weight, and length
- User auth (JWT)

## Stack

- **Client** — React + Vite + MapLibre GL
- **Server** — Node.js + Express + MongoDB/Mongoose

## Getting Started

**Prerequisites:** Node.js, MongoDB

```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Configure environment
cp server/.env.example server/.env
# Fill in MONGO_URI and JWT_SECRET

# Seed data
cd server
npm run seed:fish
npm run seed:regulations

# Run dev servers (two terminals)
cd client && npm run dev
cd server && npm run dev
```

Client runs on `http://localhost:5173`, server on `http://localhost:3000`.
