## User Endpoints

1. Create User:

```sh
curl -X POST http://localhost:3000/users/ \
-H "Content-Type: application/json" \
-d '{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "password": "password123",
  "accountType": "user"
}'
```

2. Login User:

```sh
curl -X POST http://localhost:3000/v1/login \
-H "Content-Type: application/json" \
-d '{
  "email": "user@example.com",
  "password": "password123"
}'
```

3. Get user by ID:

```sh
curl -X GET "http://localhost:3000/users/?id=USER_ID" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

4. Update User:

```sh
curl -X PUT http://localhost:3000/users/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "firstName": "UpdatedFirstName",
  "lastName": "UpdatedLastName",
  "email": "updatedemail@example.com",
  "password": "newpassword123",
  "accountType": "admin"
}'
```

5. Delete User:

```sh
curl -X DELETE http://localhost:3000/users/ \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Actor Endpoints

q. Create actor:

```sh
curl -X POST http://localhost:3000/actors/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "name": "Actor Name"
}'
```

2. Get Actor by ID:

```sh
curl -X GET http://localhost:3000/actors/1 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. Update Actor:

```sh
curl -X GET http://localhost:3000/actors/1 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. Update Actor:

```sh
curl -X PUT http://localhost:3000/actors/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "name": "Updated Actor Name"
}'
```

4. Delete Actor:

```sh
curl -X DELETE http://localhost:3000/actors/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1
}'
```

5. Approve Actor:

```sh
curl -X POST http://localhost:3000/actors/1/approve \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

## Casting endpoints

- Usage:
  - Replace 1, 2, and 3 with the actual roleId, actorId, and performanceId, respectively.
  - Replace YOUR_ACCESS_TOKEN with a valid token if authentication is required.

1. Create Casting:

```sh
curl -X POST http://localhost:3000/casting/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "roleId": 1,
  "actorId": 2,
  "performanceId": 3
}'
```

2. Get Casting by Role, Actor, and Performance IDs:

```sh
curl -X GET http://localhost:3000/casting/1/2/3 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. Update Casting:

```sh
curl -X PUT http://localhost:3000/casting/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "roleId": 1,
  "actorId": 2,
  "performanceId": 3
}'
```

4. Delete Casting:

```sh
curl -X DELETE http://localhost:3000/casting/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "roleId": 1,
  "actorId": 2,
  "performanceId": 3
}'
```

5. Get All Castings:

```sh
curl -X GET http://localhost:3000/casting/ \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Use an admin token for YOUR_ADMIN_ACCESS_TOKEN.

## Musical endpoints

1. Create a Musical:

```sh
curl -X POST http://localhost:3000/musical/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "composer": "John Doe",
  "lyricist": "Jane Smith",
  "title": "The Great Musical"
}'
```

2. Get a Musical by ID:

```sh
curl -X GET http://localhost:3000/musical/1 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

- Replace `1` with the actual `id` of the musical.

3. Update a Musical:

```sh
curl -X PUT http://localhost:3000/musical/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "composer": "Updated Composer",
  "lyricist": "Updated Lyricist",
  "title": "Updated Title"
}'
```

- Replace `1` with the actual `id` of the musical to update.

4. Delete a Musical:

```sh
curl -X DELETE http://localhost:3000/musical/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1
}'
```

- Replace `1` with the actual `id` of the musical to delete.

5. Approve a Musical:

```sh
curl -X POST http://localhost:3000/musical/1/approve \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Replace `1` with the `id` of the musical to approve.
- Requires admin privileges.

6. Get Pending Musicals:

```sh
curl -X GET http://localhost:3000/musical/pending \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Requires admin privileges.

## Performance endpoints

## Production endpoints

## Role endpoints

## Theater endpoints

```json
{
"firstName": "string",
"lastName": "string",
"email": "string",
"password": "string",
"accountType": "admin" | "user"
}
```

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
