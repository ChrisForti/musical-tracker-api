# musical-tracker-api

Welcome to the Musical Tracker API! This is a robust js-based API built using TypeScript, Node.js, and Express, with Drizzle ORM for database management. It's designed to help you effectively manage and track musical data, offering a seamless integration for developers and music enthusiasts alike.

## Features

- User login with email and password
- Database integration for user data
- Error handling for invalid inputs

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A database (e.g., PostgreSQL, MySQL, etc.) configured for the project

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone git@github.com:ChrisForti/musical-tracker-api.git
   cd musical-tracker-api
   ```
2. Install Dependencies

`npm install`

or

` yarn install`

3. Configure Environment Variables Create a `.env` file in the root directory and add the following:

```env
DATABASE_URL=<your-database-connection-string>
PORT=3000
JWT_SECRET=<your-jwt-secret>
```

- <details>
    <summary>1 Vulnerability</summary>
     - hardcoded-credentials
  Embedding credentials in source code risks unauthorized access
  </details>

4. Run Database Migrations Ensure your database is set up and run migrations (if applicable):
   `npm run migrate`
5. start the server
   `npm run dev`
   The server will start on `http://localhost:3000`.

## Api Endpoints

login user

- Endpoint: `POST /v1/login`
- Request Body:
  - Success
    {
    "email": "user@example.com",
    "password": "password123"
    }
  - Failure
    {
    "error": "Invalid email or password"
    }

### Development

#### Code Structure

- `users.ts`: Contains user-related handlers like login.
- `Database`: Queries are handled using a database abstraction layer.

#### Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the project for production.
- `npm run test`: Runs tests.

#### Troubleshooting

- Ensure the database connection string in `.env` is correct.
- Check logs for errors during API requests.

##### License

This project is licensed under the MIT License.

```

Replace `<repository-url> `and `<your-database-connection-string>` with the actual values for your project. Let me know if you need further customization!

```

```

```
