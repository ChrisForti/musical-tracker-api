# musical-tracker-api

Welcome to the Musical Tracker API! This is a robust js-based API built using TypeScript, Node.js, and Express, with Drizzle ORM for database management. It's designed to help you effectively manage and track musical data, offering a seamless integration for developers and music enthusiasts alike.

- [Schema Graph v3](https://drawsql.app/teams/david-ruvinskiy/diagrams/musical-tracker-app-v3)

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

3. **Setup Environment Variables:**

```sh
cp .env.example .env
```

**Edit the `.env` file and configure:**

- **DATABASE_URL** - Your PostgreSQL connection string
- **AWS_ACCESS_KEY_ID** - Your AWS access key (required for image uploads)
- **AWS_SECRET_ACCESS_KEY** - Your AWS secret key (required for image uploads)
- **AWS_S3_BUCKET** - Your S3 bucket name (required for image uploads)
- **AWS_REGION** - Your AWS region (e.g., us-east-1)

**Note:** Image upload features require AWS S3 configuration. Use the debug endpoint `GET /v2/upload/debug` to verify your AWS setup.

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

**Database Issues:**

- Ensure the database connection string in `.env` is correct
- Make sure Docker containers are running: `docker compose ps`
- Check logs for errors during API requests

**Image Upload Issues:**

- Verify AWS credentials are configured in `.env`
- Test AWS configuration: `curl http://localhost:3000/v2/upload/debug`
- Common error: "AWS_S3_BUCKET not configured" means missing S3 bucket name
- Ensure your AWS credentials have S3 permissions

**Getting Started:**

- See API documentation in `DOCS/v2-api-endpoints.md`
- All upload endpoints require authentication
- Images return signed URLs valid for 24 hours
