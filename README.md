# Musical Tracker API

Welcome to the Musical Tracker API! This API is designed to help you manage and track musical data efficiently. Built with modern technologies, it offers a robust foundation for developing music-related applications.

## Technologies Used

- TypeScript: Ensures a typed codebase for better readability and maintenance.
- Express: Handles the server and routing with minimal setup and flexibility.
- Drizzle: Serves as the ORM, providing clear and type-safe interactions with the database.
- PostgreSQL: Used as the database for reliable and scalable data storage.

## Getting Started

- **Prerequisites**
  - Node.js: Ensure you have Node.js installed (preferably the latest LTS version).
  - PostgreSQL: A running instance of PostgreSQL.

1. Clone the Repository

- `git clone https://github.com/ChrisForti/musical-tracker-api.git`
- `cd musical-tracker-api`

2. Install Dependencies

- `npm install`

3. Environment Setup

- Create a `.env` file in the root directory and provide the necessary environment variables:
- `DATABASE_URL=your_postgresql_database_url
PORT=your_preferred_port`

4. Database Migration

- `npx drizzle migrate`

5. Start the API

- `npm run dev`
