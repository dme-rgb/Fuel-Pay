# FuelPay - Fuel Payment Web Application

## Overview

FuelPay is a mobile-first web application for processing fuel payments with an internal discount system. Customers enter a fuel amount, the app calculates and applies a per-liter discount (hidden logic), and displays the reduced payable amount along with savings. Users complete payment by selecting cash, card, UPI, or net banking, then receive an auth code (OTP) on the success screen.

The application follows a three-screen flow:
1. **Home** - Customer enters fuel amount, sees calculated savings
2. **Payment** - Customer reviews bill details and selects payment method
3. **Success** - Displays auth code and transaction confirmation

An admin dashboard (protected by Replit Auth) allows managing fuel prices, discount rates, and viewing transaction history.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state, localStorage for transient payment flow data
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and success states
- **Design Approach**: Mobile-first with max-width container (430px) to simulate native app experience on desktop

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Build Tool**: Vite for frontend, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Tables**: users, sessions (Replit Auth), settings, transactions, otps
- **Migrations**: Drizzle Kit with `db:push` command

### Authentication
- **Provider**: Replit OpenID Connect (OIDC)
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple
- **Implementation**: Located in `server/replit_integrations/auth/`

### Key Design Decisions

**Shared Schema Pattern**
- Problem: Type safety between frontend and backend
- Solution: Schema definitions in `shared/` directory imported by both client and server
- Benefit: Single source of truth for data types and API contracts

**Payment Flow State**
- Problem: Passing calculated transaction data between pages
- Solution: localStorage with `txn_pending` and `txn_success` keys
- Rationale: Simple for a linear flow; avoids complex state management for temporary data

**Internal Discount Logic**
- Problem: Customer should see savings but not calculation details
- Solution: Server-side calculation endpoint returns only final amounts
- Implementation: `/api/transactions/calculate` accepts amount, returns processed values

**OTP System**
- Problem: Auth codes for payment verification (simulating external sheet integration)
- Solution: Pre-seeded OTP table with codes marked as used after consumption
- Future: Can be replaced with actual Google Sheets API integration

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit Auth**: OIDC-based authentication for admin access
- **Required Environment Variables**: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`, `DATABASE_URL`

### UI Components
- **shadcn/ui**: Radix UI primitives with Tailwind styling
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, etc.)
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend development server and build tool
- **esbuild**: Server-side bundling for production
- **Replit Plugins**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`

### Utilities
- **date-fns**: Date formatting
- **Zod**: Schema validation for API requests/responses
- **react-hook-form**: Form state management with Zod resolver