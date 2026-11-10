# CivicPulse — Server (Backend REST API)

**CivicPulse Server** is a robust, modular, and secure backend RESTful API built with **Node.js**, **Express.js**, **TypeScript**, and **MongoDB** (with Mongoose ODM). It powers the CivicPulse community-driven event management platform, handling user authentication, event lifecycle management, role-based ownership authorization, volunteer RSVPs, and user profile management.

---

## 🌐 Live Deployment & Repositories

| Resource | URL |
| :--- | :--- |
| **Live Production Site** | [https://civicpulse-sohag.vercel.app](https://civicpulse-sohag.vercel.app) |
| **Server GitHub Repository** | [https://github.com/developerbdSohag/civicpulse-server](https://github.com/developerbdSohag/civicpulse-server) |
| **Client GitHub Repository** | [https://github.com/developerbdSohag/civicpulse-client](https://github.com/developerbdSohag/civicpulse-client) |

---

## ⚙️ Architecture & Core Highlights

- **TypeScript-Powered REST Architecture**: Strict compile-time typing across all Express routes, controllers, middleware, and Mongoose document interfaces.
- **Dual-Mode Database Engine**:
  - Connects to an external MongoDB database when `MONGODB_URI` is provided in `.env`.
  - Automatically spins up an in-memory database via `mongodb-memory-server` if no external URI is provided, pre-seeding it with demo accounts and real humanitarian events for immediate, zero-configuration local evaluation.
- **Secure Authentication & Cryptography**:
  - Stateless JSON Web Token (JWT) sessions using `jsonwebtoken`.
  - Secure password hashing with `bcryptjs` (salt rounds: 10).
  - Password strength verification: minimum 6 characters, at least one uppercase letter, and at least one lowercase letter.
- **Strict Role & Ownership Authorization**:
  - Middleware validates incoming `Authorization: Bearer <token>` headers.
  - Event modification (`PUT`) and deletion (`DELETE`) are strictly restricted to the user who originally created the initiative (`creatorEmail` check).
- **Data Integrity & RSVP Cascading**:
  - Prevents duplicate RSVPs per event per volunteer.
  - Deleting an event automatically cascades to remove associated volunteer RSVP records.
  - Profile updates immediately propagate to creator fields across hosted events and attendee rosters.

---

## 📋 Comprehensive REST API Specification

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Auth | Description | Request Body Payload |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/auth/register` | No | Registers a new volunteer or organizer. | `{ "name": "...", "email": "...", "password": "...", "photoURL": "..." }` |
| `POST` | `/api/auth/login` | No | Authenticates user and returns JWT Bearer token. | `{ "email": "...", "password": "..." }` |
| `POST` | `/api/auth/google` | No | Authenticates or registers via Google account. | `{ "email": "...", "name": "...", "photoURL": "...", "googleId": "..." }` |
| `GET` | `/api/auth/me` | **Yes** | Returns currently authenticated user details. | *None (Bearer Token in Header)* |

---

### 2. Community Events Endpoints (`/api/events`)

| Method | Endpoint | Auth | Description | Request Body / Query Params |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/events` | No | Fetches upcoming events (excludes past dates). | Queries: `?search=Mirpur&type=Cleanup&sort=date_asc&limit=6` |
| `GET` | `/api/events/:id` | Optional | Fetches single event details, RSVP status, and recent attendees. | Route param: `:id` |
| `POST` | `/api/events` | **Yes** | Creates a new humanitarian event (future-date enforced). | `{ "title": "...", "description": "...", "eventType": "...", "eventDate": "...", "location": "...", "targetVolunteers": 50, "imageURL": "..." }` |
| `PUT` | `/api/events/:id` | **Yes** | Updates event details. Strictly allowed for the event creator only. | `{ "title": "...", "description": "...", "eventDate": "...", ... }` |
| `DELETE`| `/api/events/:id` | **Yes** | Deletes event and associated RSVPs. Strictly creator only. | Route param: `:id` |
| `GET` | `/api/events/manage/my-events` | **Yes** | Returns all events hosted by the authenticated organizer. | *None (Bearer Token in Header)* |

---

### 3. Volunteer RSVP Endpoints (`/api/rsvp`)

| Method | Endpoint | Auth | Description | Request Body / Query Params |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/rsvp/:eventId` | **Yes** | Joins an event. Increments `joinedCount` and records RSVP. | Route param: `:eventId` |
| `DELETE`| `/api/rsvp/:eventId` | **Yes** | Cancels RSVP. Decrements `joinedCount` and removes record. | Route param: `:eventId` |
| `GET` | `/api/rsvp/my-joined` | **Yes** | Returns all events joined by user, ordered chronologically. | *None (Bearer Token in Header)* |

---

### 4. User Profile Endpoints (`/api/profile`)

| Method | Endpoint | Auth | Description | Request Body / Query Params |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/profile/me` | **Yes** | Returns user profile with counts: `createdEvents` and `joinedEvents`. | *None (Bearer Token in Header)* |
| `PUT` | `/api/profile/update` | **Yes** | Updates user name, photoURL, bio, phone, and location. | `{ "name": "...", "photoURL": "...", "bio": "...", "phone": "...", "location": "..." }` |
| `POST` | `/api/profile/change-password` | **Yes** | Validates current password and updates to new password. | `{ "currentPassword": "...", "newPassword": "..." }` |

---

### 5. System Health Check

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | Returns `{ "status": "ok", "timestamp": "...", "uptime": ... }` |

---

## 🗄️ Database Schemas & Models

### `User` Model
```typescript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: false }, // Hashed with bcryptjs
  photoURL: { type: String, default: '...' },
  bio: { type: String, default: 'Community volunteer passionate about making local impact.' },
  phone: { type: String, default: '' },
  location: { type: String, default: 'Dhaka, Bangladesh' },
  googleId: { type: String, default: null },
  timestamps: true
}
```

### `Event` Model
```typescript
{
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  eventType: { 
    type: String, 
    required: true, 
    enum: ['Donation', 'Cleanup', 'Healthcare', 'Tree Plantation', 'Relief Aid', 'Education'] 
  },
  eventDate: { type: Date, required: true, index: true },
  location: { type: String, required: true, trim: true },
  targetVolunteers: { type: Number, default: 20 },
  joinedCount: { type: Number, default: 0 },
  imageURL: { type: String, required: true },
  creatorEmail: { type: String, required: true, lowercase: true, index: true },
  creatorName: { type: String, required: true },
  creatorPhoto: { type: String, default: '...' },
  timestamps: true
}
```

### `RSVP` Model
```typescript
{
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  userEmail: { type: String, required: true, lowercase: true, index: true },
  userName: { type: String, required: true },
  userPhoto: { type: String, default: '...' },
  registeredAt: { type: Date, default: Date.now },
  timestamps: true
}
```

---

## 📦 NPM Packages & Dependencies

| Package | Version | Purpose & Usage in Backend |
| :--- | :--- | :--- |
| `express` | `^5.3.0` | High-performance HTTP web framework routing API requests. |
| `mongoose` | `^9.12.0` | Elegant MongoDB object modeling (ODM) for schema validation and queries. |
| `mongodb` | `^7.8.0` | Native MongoDB driver for robust connection handling. |
| `mongodb-memory-server` | `^11.3.0` | Spins up an in-memory MongoDB instance for effortless local evaluation. |
| `jsonwebtoken` | `^9.0.3` | Generates, signs, and verifies JWT tokens for Bearer authentication. |
| `bcryptjs` | `^3.0.3` | Hashes user passwords securely with 10 salt rounds. |
| `cors` | `^2.8.6` | Cross-Origin Resource Sharing middleware for client-server integration. |
| `dotenv` | `^18.0.9` | Loads environment variables from `.env` file into `process.env`. |
| `typescript` | `^7.0.2` | Compiles TypeScript into production-ready ECMAScript. |
| `ts-node` | `^10.9.2` | Direct execution of TypeScript files during local development. |
| `nodemon` | `^3.1.14` | Hot-reloading daemon monitoring changes in TypeScript source files. |
| `rimraf` | `^6.1.4` | Clean utility for purging previous `dist/` build folders prior to compilation. |

---

## 🛠️ Step-by-Step Local Setup & Execution

### Prerequisites
- Node.js (v18.17.0 or higher)
- npm (v9.0.0 or higher)

### 1. Clone the Server Repository
```bash
git clone https://github.com/developerbdSohag/civicpulse-server.git
cd civicpulse-server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root of the server folder:
```env
PORT=5000
MONGODB_URI=
JWT_SECRET=civicpulse_jwt_secret_key_secure_2026_social_platform
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```
> **Note**: If `MONGODB_URI` is left blank, the server automatically starts an in-memory MongoDB instance with pre-seeded humanitarian events and demo accounts. No local MongoDB daemon required!

### 4. Run the Development Server
```bash
npm run dev
```
The server will boot on **`http://localhost:5000`**. You can verify it with `GET http://localhost:5000/api/health`.

### 5. Build and Run Production Bundle
```bash
npm run build
npm start
```

---

## 🔑 Test User Credentials (For Evaluation)

| Field | Primary Organizer / Volunteer | Secondary Volunteer |
| :--- | :--- | :--- |
| **Email** | `sohag@gmail.com` | `nova@gmail.com` |
| **Password** | `CivicPulse@2026` | `CivicPulse@2026` |

---

## 👨‍💻 Author & Acknowledgements
- **Developer**: Md. Salahuddin Sohag ([@developerbdSohag](https://github.com/developerbdSohag))
- **Live Platform**: [https://civicpulse-sohag.vercel.app](https://civicpulse-sohag.vercel.app)
- **Built for**: Community Development & Humanitarian Social Welfare Coordination
