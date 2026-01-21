# Lucky Draw Project Overview

This project implements a "Lucky Draw" application with a user-facing frontend, a Node.js/Express backend API, and a dedicated Next.js-based Admin dashboard. Supabase is used as the primary backend-as-a-service for database, authentication, and real-time functionalities.

## Architecture

The project is structured into three main parts:

1.  **`frontend/`**: The main user-facing Next.js application.
2.  **`Admin/`**: A separate Next.js application for administration.
3.  **`server/`**: A Node.js and Express.js backend API that handles business logic and acts as a central hub.

---

## 1. Backend (`server/`)

The backend is an Express.js server that manages authentication (via Supabase), payment webhooks, and the core game logic.

### Key Technologies
- **Express.js (v5.1.0)**: Web framework.
- **Supabase JS Client**: Database and Auth interaction.
- **Nodemailer**: For sending game confirmations and win notifications.
- **Node-cron**: For scheduled tasks (e.g., daily game updates).
- **Paystack SDK**: (Inferred) for payment processing.

### API Routes
- **Authentication**:
    - `POST /api/register-otp`: Sends a Magic Link/OTP via Supabase Auth.
    - `POST /api/verify-otp`: Verifies OTP and ensures a user profile exists in the `profiles` table.
- **Dashboard**:
    - `GET /api/dashboard`: Fetches user-specific stats (tokens, wins) and global leaderboard data.
- **Lucky Grid Game (`/api/lucky-grid`)**:
    - `GET /active`: Fetches the current active game and its picks.
    - `POST /create`: (Admin) Creates a new game with a specified range.
    - `POST /pick`: (User) Submits number picks, deducts tokens, and sends email confirmation.
    - `POST /reveal`: (Admin) Randomly or manually picks a winner, updates game status, and notifies admin/winner via email.
    - `GET /last-revealed`: Fetches the most recently completed game.
- **Wheel Game (`/api/wheel-game`)**:
    - `GET /prizes`: Lists available prizes and their probabilities.
    - `POST /spin`: Deducts a token, runs a weighted draw, logs the result, and notifies the user if they won.
    - `GET /recent-wins`: Returns a list of the latest winners.
- **Admin (`/api/admin`)**:
    - `GET /stats`: Aggregated dashboard stats (revenue, users, games).
    - `GET /users`: Paginated list of all users and their profiles.
    - `POST /give-tokens`: Allows an admin to manually add tokens to a user's account.
    - `GET /wheel-rewards`: Filterable list of prizes won on the wheel.
- **Webhooks**:
    - `POST /api/paystack-webhook`: Processes successful Paystack charges to add tokens to user accounts.

---

## 2. Frontend (`frontend/`)

The user-facing app is a Next.js (App Router) project styled with Tailwind CSS.

### Key Pages
- **Login (`/`)**: OTP-based authentication entry point.
- **Home (`/home`)**: Dashboard showing token balance, game carousels, "How to Play" section, and sponsorship logos.
- **Lucky Grid (`/luckygrid`)**: The main grid-based game where users pick numbers.
- **Wheel of Fortune (`/wheel`)**: A spin-to-win game.
- **Lucky Card (`/luckycard`)**: (Inferred) Card-based game.

### UI Components
- **PlayNavbar**: Persistent navigation with user profile access.
- **BuyTriesCard**: Integration with Paystack for token purchases.
- **Sponsors**: Displays partner logos (Yango, Caritas).
- **Leaderboard**: Displays top winners (currently hidden/replaced by Sponsors).

---

## 3. Admin Dashboard (`Admin/`)

A protected dashboard for managing games, users, and viewing system health.

### Key Features
- **Secure Login**: Restricted to a pre-defined list of admin emails via OTP.
- **Game Management**: Create new Lucky Grid games, reveal winners, and view game history.
- **User Management**: Search users and manually award tokens.
- **Payment Tracking**: View a log of all Paystack transactions.
- **Notifications**: Real-time alerts for new registrations and payments.
- **Wheel Rewards**: Track and manage prizes won via the wheel game.

---

## 4. Database Schema (Supabase)

### Principal Tables
- **`profiles`**: User metadata (name, phone, tokens, total wins).
- **`lucky_games`**: Records of grid games (range, winning number, status).
- **`lucky_picks`**: Map of user selections to specific games and numbers.
- **`payments`**: Log of all successful financial transactions.
- **`wheel_prizes`**: Configuration for the wheel game (name, probability, image).
- **`wheel_game_spins`**: History of every wheel spin.
- **`wheel_rewards`**: Records of actual prizes won that need fulfillment.
- **`notifications`**: System alerts for administrators.

---

## 5. Security & Vulnerabilities (Audited Dec 2025)

The following areas have been identified for improvement (see `vuls.txt` for details):
1.  **Atomicity**: Token deduction in `/pick` is not currently atomic with the insert operation.
2.  **Hardcoded Data**: Admin emails are hardcoded in the server logic.
3.  **Insecure Randomness**: Game winners are picked using `Math.random()` instead of `crypto`.
4.  **Auth Storage**: Admin tokens are stored in `localStorage` instead of `httpOnly` cookies.
5.  **Rate Limiting**: Missing on sensitive endpoints like OTP requests and game plays.

---

## Setup and Running

### Backend
```bash
cd server
npm install
npm run dev # Port 3001
```

### Frontend
```bash
cd frontend
npm install --force / --legacy-peer-deps
npm run dev # Port 3000
```

### Admin
```bash
cd Admin
npm install
npm run dev # Port 3002
```
