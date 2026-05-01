# TrailApp Backend (MVC)

## Project Structure

```
src/
  config/
    database.js
    env.js
  controllers/
    auth.controller.js
    group.controller.js
    health.controller.js
    profile.controller.js
    trail.controller.js
  middlewares/
    auth.middleware.js
    error.middleware.js
  models/
    group.model.js
    health.model.js
    trail.model.js
    user.model.js
  routes/
    auth.routes.js
    group.routes.js
    health.routes.js
    index.js
    profile.routes.js
    trail.routes.js
  services/
    auth.service.js
    group.service.js
    health.service.js
    profile.service.js
    trail.service.js
    user.store.js
  app.js
  server.js
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create env file:

   ```bash
   copy .env.example .env
   ```

3. Configure required environment variables in `.env`:

   - `PORT` - API server port
   - `NODE_ENV` - runtime environment (`development` / `production`)
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - secret used to sign JWT tokens
   - `JWT_EXPIRES_IN` - token expiration (example: `7d`)

4. Run in dev mode:

   ```bash
   npm run dev
   ```

## Test endpoint

- `GET /api/health`

## Auth endpoints

- `POST /api/auth/register`
  - body: `email`, `password`, `fullName` (optional)
- `POST /api/auth/login`
  - body: `email`, `password`
- `GET /api/profile`
  - header: `Authorization: Bearer <token>`
- `PUT /api/profile`
  - header: `Authorization: Bearer <token>`
  - body (optional): `fullName`, `phone`, `country`, `preferredLanguage`, `bio`, `photoUrl`, `emergencyContact`, `touristMode`

## Group endpoints

All group endpoints require:

- header: `Authorization: Bearer <token>`

- `POST /api/groups`
  - description: create a new travel group
  - body: `name` (required), `destination` (required), `description` (optional)
  - behavior:
    - authenticated user becomes `createdBy`
    - authenticated user is added to `members`
    - `inviteCode` is generated automatically

- `POST /api/groups/join`
  - description: join an existing travel group
  - body: `groupId` or `inviteCode` (at least one is required)
  - behavior:
    - prevents duplicate joins
    - adds user to `members` when valid

## Trail planning endpoints

All trail endpoints require:

- header: `Authorization: Bearer <token>`

- `POST /api/trails`
  - description: create a trail draft in the trail creation pipeline
  - body: `title` (required), `region` (required), `summary`, `difficulty`, `distanceKm`, `estimatedDurationHours`

- `GET /api/trails`
  - description: list trails created by the authenticated user

- `GET /api/trails/:trailId`
  - description: get one trail owned by the authenticated user

- `PATCH /api/trails/:trailId/stage`
  - description: update trail creation pipeline stage
  - body: `planningStage` (`draft`, `route-mapped`, `safety-reviewed`, `checklist-ready`, `published`)

- `PUT /api/trails/:trailId/waypoints`
  - description: replace complete waypoints/checkpoints route
  - body: `waypoints[]` with `name`, `kind`, `latitude`, `longitude`, optional `altitudeMeters`, `notes`, `order`

- `PUT /api/trails/:trailId/emergency-numbers`
  - description: set emergency numbers for a trail
  - body: `emergencyNumbers[]` with `label`, `phone`, optional `countryCode`, `available24x7`

- `POST /api/trails/:trailId/checklist`
  - description: add one packing/gear checklist item
  - body: `item` (required), optional `category`, `required`, `notes`

- `PATCH /api/trails/:trailId/checklist/:itemId`
  - description: mark checklist item packed/unpacked
  - body: `packed` (boolean)

- `DELETE /api/trails/:trailId/checklist/:itemId`
  - description: remove checklist item

- `POST /api/trails/:trailId/offline-export`
  - description: generate offline trail data bundle (route + emergency contacts + checklist)
