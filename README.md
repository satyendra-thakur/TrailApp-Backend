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
  middlewares/
    auth.middleware.js
    error.middleware.js
  models/
    group.model.js
    health.model.js
    user.model.js
  routes/
    admin.routes.js
    analytics.routes.js
    auth.routes.js
    group.routes.js
    health.routes.js
    payment.routes.js
    premium.routes.js
    index.js
    profile.routes.js
    subscription.routes.js
  services/
    admin.service.js
    analytics.service.js
    auth.service.js
    group.service.js
    health.service.js
    payment.service.js
    profile.service.js
    premium.service.js
    subscription.service.js
    user.store.js
  scripts/
    seed-plans.js
  tests/
    api.test.js
    setup-test-db.js
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

5. Seed subscription plans:

   ```bash
   npm run seed:plans
   ```

6. Run automated tests:

   ```bash
   npm test
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
  - note: `role` is included in JWT payload and supports `user`, `moderator`, `admin`, `super_admin`

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

## B7 Admin endpoints

All admin endpoints require:

- header: `Authorization: Bearer <token>`
- role: `moderator`, `admin`, or `super_admin`

- `GET /api/admin/pending`
  - description: fetch pending trails, homestays, and reviews for moderation

- `PATCH /api/admin/trails/:trailId/decision`
- `PATCH /api/admin/homestays/:homestayId/decision`
- `PATCH /api/admin/reviews/:reviewId/decision`
  - body: `decision` (`approved` or `rejected`), `moderationNote` (optional)

## B7 Premium endpoints

- `GET /api/subscriptions/plans`
  - description: fetch available premium plans

- `POST /api/subscriptions/checkout`
  - header: `Authorization: Bearer <token>`
  - body: `planCode`

- `GET /api/subscriptions/me`
  - header: `Authorization: Bearer <token>`

- `PATCH /api/subscriptions/:subscriptionId/cancel`
  - header: `Authorization: Bearer <token>`

- `POST /api/payments/verify`
  - header: `Authorization: Bearer <token>`
  - body: `transactionRef` or `sessionId`

- `POST /api/payments/webhook`
  - description: placeholder webhook endpoint for payment provider callbacks

- `GET /api/premium/me`
  - header: `Authorization: Bearer <token>`
  - description: returns premium status and enabled features

## B7 Analytics endpoints

All analytics endpoints require:

- header: `Authorization: Bearer <token>`
- role: `admin` or `super_admin`

- `GET /api/analytics/overview`
- `GET /api/analytics/premium`
