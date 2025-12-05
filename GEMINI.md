# Lucky Draw Project Overview

This project implements a "Lucky Draw" application with a user-facing frontend, a Node.js/Express backend API, and a dedicated Next.js-based Admin dashboard. Supabase is used as the primary backend-as-a-service for database, authentication, and real-time functionalities.

## Architecture

The project is structured into three main parts:

1.  **`frontend/`**: The main user-facing Next.js application, built with React and likely styled with Tailwind CSS and Shadcn UI (inferred from `Admin` app dependencies).
2.  **`Admin/`**: A separate Next.js application serving as the administration dashboard, also built with React, TypeScript, Tailwind CSS, and Shadcn UI.
3.  **`server/`**: A Node.js and Express.js backend API that handles business logic, interacts with Supabase, processes webhooks (e.g., Paystack), and serves as the central hub for data operations.

## Key Technologies

*   **Frontend/Admin:** Next.js (React, TypeScript), Tailwind CSS, Shadcn UI, Lucide Icons, `cmdk` (Command Menu), `zod` (validation).
*   **Backend:** Node.js, Express.js, Supabase Client Library (`@supabase/supabase-js`), `dotenv`, `cors`, `crypto`, `node-cron`, `nodemailer` (for email services).
*   **Database:** Supabase (PostgreSQL, Authentication, Realtime).
*   **Payments:** Paystack integration via webhooks.

## Setup and Running

Each part of the application needs to be set up and run independently.

### 1. Backend (`server/`)

**Dependencies:**
*   `@supabase/supabase-js`
*   `cors`
*   `dotenv`
*   `express`
*   `node-cron`
*   `nodemailer`
*   `nodemon` (dev dependency)

**Environment Variables (`server/.env`):**
Create a `.env` file in the `server/` directory with the following:
```
SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
SUPABASE_SERVICE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
PAYSTACK_SECRET_KEY="YOUR_PAYSTACK_SECRET_KEY"
ADMIN_EMAIL="josiahiscoding@gmail.com" # Or your primary admin email
```

**Commands:**
```bash
cd server
npm install # or yarn install / pnpm install
npm run dev  # For development with nodemon
# npm start  # For production
```

### 2. Frontend (`frontend/`)

*(No direct modifications were made to this frontend during this session, but general Next.js setup applies.)*

**Commands (inferred):**
```bash
cd frontend
npm install # or yarn install / pnpm install
npm run dev
```

### 3. Admin Dashboard (`Admin/`)

**Dependencies:**
*   `@supabase/supabase-js`
*   Next.js, React, Tailwind CSS, Shadcn UI components (as listed in `package.json`).

**Environment Variables (`Admin/.env.local`):**
Create a `.env.local` file in the `Admin/` directory with the following:
```
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

**Commands:**
```bash
cd Admin
npm install # or yarn install / pnpm install
npm run dev
```
*(Note: If running both `frontend` and `Admin` simultaneously, Next.js will typically assign the Admin app to a different port, e.g., `http://localhost:3002` if `frontend` is on `3000` and `server` is on `3001`.)*

## Database Configuration (Supabase SQL Editor)

The following SQL scripts were provided and should be run in your Supabase SQL Editor.

### 1. `notifications` Table
Creates a table to store admin notifications and sets up Row Level Security (RLS).
*(See `create_notifications_table.sql` for full script.)*

```sql
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info' NOT NULL,
    read BOOLEAN DEFAULT false NOT NULL
);
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
-- RLS Policies (as in create_notifications_table.sql)
```

### 2. `payments` Table
Creates a table to store transaction records from Paystack webhooks and sets up RLS.
*(See `create_payments_table.sql` for full script.)*

```sql
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount BIGINT NOT NULL,
    paystack_reference TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL,
    tokens_purchased INTEGER NOT NULL
);
-- RLS Policies (as in create_payments_table.sql)
```

### 3. `lucky_games` Table Alteration
Adds `title` and `description` columns to the existing `lucky_games` table.
*(See `alter_lucky_games_table.sql` for full script.)*

```sql
ALTER TABLE public.lucky_games
ADD COLUMN title TEXT,
ADD COLUMN description TEXT;
```

### 4. Notification Triggers
Creates database functions and triggers to automatically generate notifications for new user registrations and new payments.
*(See `create_payment_notification_trigger.sql` for full script.)*

```sql
-- Function for new user notifications
CREATE OR REPLACE FUNCTION public.handle_new_user_notification() RETURNS TRIGGER ...;
CREATE TRIGGER on_new_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_notification();

-- Function for new payment notifications
CREATE OR REPLACE FUNCTION public.handle_new_payment_notification() RETURNS TRIGGER ...;
CREATE TRIGGER on_new_payment_created AFTER INSERT ON public.payments FOR EACH ROW EXECUTE PROCEDURE public.handle_new_payment_notification();
```

## Admin Dashboard Features (Implemented during this session)

*   **Secure OTP-based Login:** Admin dashboard access is restricted to pre-defined email addresses using Supabase OTP authentication.
*   **API Proxying:** `Admin/next.config.mjs` is configured to proxy `/api` requests to the backend server.
*   **User Management:**
    *   Display of all users from Supabase `auth.users` and `public.profiles`.
    *   Search functionality by name, email, or phone number.
    *   Client-side pagination (20 users per page) for the user list.
    *   "Give Tokens" feature with a searchable user selection dropdown and backend integration.
*   **Game Management:**
    *   `lucky_games` table now includes `title` and `description`.
    *   "Create Game" page (`Admin/app/create-game/page.tsx`) allows creating games with a title and description, and prevents creating a new game if one is already active.
    *   "Game Details" page (`Admin/app/game-details/page.tsx`) displays details for the active or last closed game, fetches associated entries, and allows force-revealing a winner with a confirmation modal.
    *   "Game History" page (`Admin/app/game-history/page.tsx`) displays all `revealed` games and allows viewing entries for each.
*   **Notifications:**
    *   Real-time admin notifications for new user registrations and successful payments.
    *   Notifications dropdown displays fetched notifications and allows marking them as read.
*   **Payment Tracking:**
    *   `payments` table stores records of all Paystack transactions.
    *   `Payments` page (`Admin/app/payments/page.tsx`) displays a searchable and paginated list of all payments, including user details and Paystack references.
*   **Dashboard Statistics:** Main dashboard page (`Admin/app/page.tsx`) displays real-time `Total Users`, `Total Revenue`, and `Active Games` statistics fetched from the backend.
*   **Sidebar Logout:** A prominent logout button has been added to the bottom of the admin sidebar.

## Development Conventions

*   **TypeScript:** Used throughout the Next.js and backend applications for type safety.
*   **Next.js App Router:** Frontend applications leverage the App Router paradigm.
*   **Tailwind CSS & Shadcn UI:** For consistent and efficient styling across the frontend applications.
*   **API Endpoints:** Backend API endpoints are organized by feature (`luckyGridRoutes`, `AdminRoutes`, `sidegameRoutes`).
*   **Supabase Client:** Separate Supabase clients are initialized for server-side (service key) and client-side (anon key) operations.
