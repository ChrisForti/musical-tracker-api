# musical-tracker-api

Welcome to the Musical Tracker API! This is a robust js-based API built using TypeScript, Node.js, and Express, with Drizzle ORM for database management. It's designed to help you effectively manage and track musical data, offering a seamless integration for developers and music enthusiasts alike.

[Schema Graph](https://drawsql.app/teams/david-ruvinskiy/diagrams/musical-tracker-app-v2)

## Prerequisites

- [Node.js](https://nodejs.org/) v22
- [Docker](https://docs.docker.com/)

## Setup Instructions

1. **Clone the Repository**

```bash
git clone git@github.com:ChrisForti/musical-tracker-api.git
cd musical-tracker-api
```

2. Install Dependencies:

```sh
npm install
```

3. Copy the example env file and update any variables needed:

```sh
cp .env.example .env
```

4. Start the database:

```sh
docker compose up
# If you want to run in the background, start detached:
# docker compose up -d
```

5.  Run Database Migrations:

```sh
npm run db:migrate
```

6.  Start the dev server

```sh
npm run dev
```

The server will start on `http://localhost:3000`.

#### Troubleshooting

- Ensure the database connection string in `.env` is correct.
- Check logs for errors during API requests.
