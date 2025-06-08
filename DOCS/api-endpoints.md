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

```sh
GET /casting/:roleId/:actorId/:performanceId
```

## User flow schema

### Elements

1. User Actions:
   Add/Edit Performance (No approval required; tied to user)
   Add/Edit Casting (No approval required; tied to user)
2. Admin Actions:
   Approve CRUD for Musicals
   Approve CRUD for Productions
   Approve CRUD for Theaters
   Approve CRUD for Actors
   Approve CRUD for Roles
3. Approval Process:
   Request: Add Role (If not in DB, requires admin approval)
   Request: Add Actor (If not in DB, requires admin approval)
   Request: Add Theater (If not in DB, requires admin approval)

### Flow

1. User:
2. Performance
   Direct Action → “Add/Edit Performance” → Personal Database
3. Casting
   Direct Action → “Add/Edit Casting” → Personal Database
4. Admin Approval Needed:
5. Role (If not in DB)
   User Request → “Add Role” → Admin Approval → Central DB
6. Actor (If not in DB)
   User Request → “Add Actor” → Admin Approval → Central DB
7. Theater (If not in DB)
   User Request → “Add Theater” → Admin Approval → Central DB
8. Central Database Actions (Admin Only):
   CRUD for Musicals, Productions, Theaters, Roles/Actors

### Admin approval required

- Musical
  - User Request → “Add/Edit Musical” → Admin Approval → Central Database
- Role/Actor (if not in DB)
  - User Request → “Add Role/Actor” → Admin Approval → Central Database
- Theater (if not in DB)
  - User Request → “Add Theater” → Admin Approval → Central Database

### shortened list

- Users: Store user information.
- Performances: Store user-specific performances.
- Castings: Store user-specific castings.
- Musicals: Admin-approved musicals.
- Productions: Admin-approved productions.
- Theaters: Admin-approved theaters.
- Roles/Actors: Admin-approved roles and actors.
- ApprovalRequests: Track user requests for roles/actors and theaters.
