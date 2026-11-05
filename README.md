# CivicPulse — Server (Backend API)

**CivicPulse** is a community-driven event management platform where citizens and grassroots activists can organize, discover, join, and track social service and humanitarian events in their local area (e.g., winter clothing drives, food distribution, medical camps, lake cleanups, and tree plantation).

## 🌟 Key Highlights & Architecture
- **Runtime & Language**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM (includes automatic zero-config in-memory fallback + automatic data seeding for immediate local evaluation)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing and Google sign-in integration
- **Security & Authorization**: Protected routes with Bearer token validation, role ownership checks (users can only update/delete their own created events)
- **Filter & Search**: Query upcoming events (`eventDate >= today`), search by title/location/keyword, category filter, and `.limit()` operator.

---

## 🛠️ API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register with name, email, password (requires uppercase, lowercase, min 6 characters), and optional photoURL.
- `POST /api/auth/login`: Authenticate with email & password, receives JWT token.
- `POST /api/auth/google`: Sign in / sign up using Google OAuth credentials.
- `GET /api/auth/me`: Get current authenticated user profile (Bearer token required).

### Social Events (`/api/events`)
- `GET /api/events`: Retrieve upcoming events (filters out past dates; supports `?limit=6`, `?type=Cleanup`, `?search=Mirpur`, `?sort=date_asc`).
- `GET /api/events/:id`: View specific event details, RSVP status for logged-in user, and recent attendees list.
- `POST /api/events`: Create a new social event (Bearer token required; validates future date and stores creator email).
- `PUT /api/events/:id`: Update event (Bearer token required; strictly creator only).
- `DELETE /api/events/:id`: Delete event and linked RSVPs (Bearer token required; strictly creator only).
- `GET /api/events/manage/my-events`: List all events created by the logged-in user (Bearer token required).

### RSVP & Joined Events (`/api/rsvp`)
- `POST /api/rsvp/:eventId`: Join an event (Bearer token required; stores event and user data; prevents duplicates).
- `DELETE /api/rsvp/:eventId`: Cancel RSVP / leave event (Bearer token required).
- `GET /api/rsvp/my-joined`: List all events joined by current user, sorted chronologically by event date (Bearer token required).

### User Profile (`/api/profile`)
- `GET /api/profile/me`: View user profile with aggregated statistics (events organized, events joined).
- `PUT /api/profile/update`: Update profile name, photoURL, bio, phone, and location.

---

## ⚙️ Environment Variables
Create a `.env` file in the root of the server folder:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=civicpulse_jwt_secret_key_secure_2026_social_platform
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```
> *Note: If `MONGODB_URI` is left blank, the server automatically starts an in-memory MongoDB instance with pre-seeded humanitarian events and demo accounts.*

---

## 🚀 Running the Server Locally

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start in development mode (with hot reloading)
npm run dev

# Or start compiled production bundle
npm start
```
Server runs on `http://localhost:5000`. Health check available at `http://localhost:5000/api/health`.
