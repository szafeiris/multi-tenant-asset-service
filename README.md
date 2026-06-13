# Multi-Tenant Asset Management Service

## Overview
This project is a **Multi-Tenant Asset Management Service** built with Node.js, Express, and TypeScript. It ensures robust data isolation between different tenants using a combination of a relational database (PostgreSQL via Prisma) for structured data (Users, Tenants) and a NoSQL database (MongoDB via Mongoose) for flexible asset storage. It incorporates features like role-based access control (RBAC), audit logging, JWT-based authentication, and Redis for caching.

## Roles and Permissions

The system implements Role-Based Access Control (RBAC) to restrict access to endpoints and data based on the user's role.

| Role | Actions / Permissions |
| :--- | :--- |
| `admin` | **Full access**. Can create, read, update, and delete tenants, users, and assets across their assigned tenant space. |
| `editor` | **Read & Write**. Can create, read, update, and delete users and assets within their tenant, but cannot manage the tenant configuration itself. |
| `viewer` | **Read-only**. Can only read users and assets within their tenant. Cannot create, update, or delete any entities. |

## Development Environment Setup

Follow these step-by-step instructions to get your development environment running:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v22+ recommended)
- [Docker](https://www.docker.com/) and Docker Compose (required for running databases)

### 2. Clone and Install
```bash
git clone https://github.com/szafeiris/multi-tenant-asset-service.git
cd multi-tenant-asset-service
npm install
```

### 3. Environment Variables
Copy the example environment file and configure it for your local setup:
```bash
cp .env.example .env.development
```
_Note: You may need to verify the database host settings depending on whether you are running Node.js on your host machine or entirely within Docker._

### 4. Start Infrastructure (Databases)
Start PostgreSQL, Redis, and MongoDB in the background using Docker Compose:
```bash
docker-compose -f docker-compose.db.yml up -d
```

### 5. Database Setup & Seeding
Apply the Prisma migrations to set up the PostgreSQL schema, and seed both databases with initial data:
```bash
# Migrate PostgreSQL schema
npm run db:migrate

# Seed PostgreSQL with default tenants and users
npm run db:seed

# Seed MongoDB with initial asset data
npm run seed:assets
```

## Different Ways to Run the Project

You can run the application in several modes depending on your needs:

### 1. Local Development (Hot Reloading)
Runs the server with `tsx`, automatically reloading on file changes. Uses `.env.development`.
```bash
npm run dev
```

### 2. Production Build (Local)
Compiles the TypeScript code into JavaScript and runs the compiled bundle. Uses `.env.production`.
```bash
npm run build
npm run start
```

### 3. Fully Dockerized (Production-like)
Spins up the entire stack, including the Node.js backend application and all databases, using the production docker-compose file.
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## How to Test

The project uses [Vitest](https://vitest.dev/) along with Testcontainers. **You must have Docker running** to execute the tests, as Testcontainers will automatically spin up isolated instances of PostgreSQL, MongoDB, and Redis for the test suites.

- **Run all tests (Unit & E2E):**
  ```bash
  npm run test:run
  ```
- **Run tests in watch mode (for development):**
  ```bash
  npm run test
  ```
- **Run tests with coverage report:**
  ```bash
  npm run coverage
  ```
- **Test the API endpoints interactively:**
  You can use [Bruno](https://www.usebruno.com/) to explore and test the APIs manually. Open the `bruno/` directory in the Bruno app. 
  _Note: There is an automated workflow to keep Bruno collections in sync with the codebase (`/bruno-agent`)._

## Code Quality Commands
Ensure your code meets the project's standards before committing:
- **Linting:** `npm run lint` (or `npm run lint:fix` to auto-fix issues)
- **Formatting:** `npm run format`
- **Type Checking:** `npm run type-check`
