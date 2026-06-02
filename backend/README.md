# FeedMap AI Backend

Node.js, Express, and MongoDB REST API for FeedMap AI.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update `MONGO_URI` and `JWT_SECRET` in `.env`.

4. Start the API:

```bash
npm run dev
```

## Folder Structure

- `src/server.js` starts the HTTP server and connects to MongoDB.
- `src/app.js` creates the Express app, applies global middleware, mounts routes, and registers error handlers.
- `src/config/` stores configuration helpers such as the MongoDB connection.
- `src/controllers/` contains request handlers. Controllers receive HTTP input and return HTTP responses.
- `src/middleware/` contains reusable Express middleware such as JWT protection, role checks, and error handling.
- `src/models/` contains Mongoose schemas and model methods.
- `src/routes/` defines REST route modules and maps endpoints to controllers.
- `src/utils/` stores shared utilities such as token generation and async controller wrappers.

## API Routes

### Health

- `GET /api/health` - API status check.

### Auth

- `POST /api/auth/signup` - Create a user.
- `POST /api/auth/login` - Log in and receive a JWT.
- `GET /api/auth/me` - Get current authenticated user.

### Users

- `GET /api/users/profile` - Protected user profile.
- `GET /api/users/admin` - Admin-only sample route.

### Food Donations

- `POST /api/donations` - Create a food donation. Donor role only.
- `GET /api/donations` - Admin list of all donations.
- `GET /api/donations/available` - Get all available, non-expired donations.
- `GET /api/donations/my-donations` - Get donations created by the logged-in donor.
- `PUT /api/donations/:id/accept` - NGO accepts an available donation and reserves it.
- `PUT /api/donations/:id/status` - Update donation status.
- `GET /api/donations/accepted` - Get donations accepted by the logged-in NGO.
- `GET /api/donations/assigned` - Get delivery workflow donations.
- `GET /api/donations/admin/all` - Admin list of all donations.
- `DELETE /api/donations/:id` - Admin removes a donation.

### Admin Users

- `GET /api/users/admin/all` - Admin list of all users.
- `PATCH /api/users/admin/:id/ngo-approval` - Admin approves, rejects, or resets an NGO account to pending.

## Roles

Supported roles are `donor`, `ngo`, `delivery`, and `admin`.
