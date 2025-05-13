# musical-tracker-api

Welcome to the Musical Tracker API! This is a robust js-based API built using TypeScript, Node.js, and Express, with Drizzle ORM for database management. It's designed to help you effectively manage and track musical data, offering a seamless integration for developers and music enthusiasts alike.
[Schema Graph](https://drawsql.app/teams/david-ruvinskiy/diagrams/musical-tracker-app)

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- `docker` we used a a `postgres` image

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone git@github.com:ChrisForti/musical-tracker-api.git
   cd musical-tracker-api
   ```
2. Install Dependencies:

- `npm install`

3. Configure Environment Variables Create a file in the root directory and add the following:

- `cp .env.example .env`

```env
DATABASE_URL=<your-database-connection-string>
PORT=3000

```

4. Get your Database running, we used a docker container with a postgres image.

```bash
docker compose up
# If you want to run in the background, start detached:
# docker compose up -d
```

5.  Run Database Migrations Ensure your database is set up and run migrations (if applicable):
    `npm run migrate`
6.  start the server
    `npm run dev`
    The server will start on `http://localhost:3000`.

### Development

#### Code Structure

- `users.ts`: Contains user-related handlers like login.
- `drizzle`: Allows for handling user-related operations such as authentication, retrieval, updates, and deletions with minimal boilerplate.

#### Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the project for production.
- `npm run test`: Runs tests.
- `db:generate`: Used to generate migration files based on changes in your schema.
- `db:migrate`: Compiles typescript and runs the migrations script, leveraging **Drizzle ORM**.

#### Troubleshooting

- Ensure the database connection string in `.env` is correct.
- Check logs for errors during API requests.
