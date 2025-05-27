## Api Endpoints

login user

- **Endpoint**: `POST /v1/login`
- **Request Body**:
  - **Success**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
  - **Failure**:
  ```json
  {
    "error": "Invalid email or password"
  }
  ```
  GET endpoint in casting handler

```sh
GET /casting/:roleId/:actorId/:performanceId
```
