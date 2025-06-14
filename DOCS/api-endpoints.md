## User Endpoints

1. Create User:

```sh
curl -X POST http://localhost:3000/v1/user/ \
-H "Content-Type: application/json" \
-d '{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "password": "password123",
}'
```

2. Login User:

```sh
curl -X POST http://localhost:3000/v1/user/login \
-H "Content-Type: application/json" \
-d '{
  "email": "user@example.com",
  "password": "password123"
}'
```

3. Get user by ID:

```sh
curl -X GET "http://localhost:3000/v1/user \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

4. Update User:

```sh
curl -X PUT http://localhost:3000/v1/user/ \
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
curl -X DELETE http://localhost:3000/v1/user/ \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Actor Endpoints

q. Create actor:

```sh
curl -X POST http://localhost:3000/v1/actor/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "name": "Actor Name"
}'
```

2. Get Actor by ID:

```sh
curl -X GET http://localhost:3000/v1/actor/1 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. Update Actor:

```sh
curl -X GET http://localhost:3000/v1/actor/1 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. Update Actor:

```sh
curl -X PUT http://localhost:3000/v1/actor/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "name": "Updated Actor Name"
}'
```

4. Delete Actor:

```sh
curl -X DELETE http://localhost:3000/v1/actor/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1
}'
```

5. Approve Actor:

```sh
curl -X POST http://localhost:3000/v1/actor/1/approve \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

## Casting endpoints

- Usage:
  - Replace 1, 2, and 3 with the actual `roleId`, `actorId`, and `performanceId`, respectively.
  - Replace `YOUR_ACCESS_TOKEN` with a valid token if authentication is required.

1. Create Casting:

```sh
curl -X POST http://localhost:3000/v1/casting/ \
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
curl -X GET http://localhost:3000/v1/casting/1/2/3 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. Update Casting:

```sh
curl -X PUT http://localhost:3000/v1/casting/ \
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
curl -X DELETE http://localhost:3000/v1/casting/ \
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
curl -X GET http://localhost:3000/v1/casting/ \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Use an admin token for YOUR_ADMIN_ACCESS_TOKEN.

## Musical endpoints

1. Create a Musical:

```sh
curl -X POST http://localhost:3000/v1/musical/ \
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
curl -X GET http://localhost:3000/v1/musical/1 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

- Replace `1` with the actual `id` of the musical.

3. Update a Musical:

```sh
curl -X PUT http://localhost:3000/v1/musical/ \
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
curl -X DELETE http://localhost:3000/v1/musical/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1
}'
```

- Replace `1` with the actual `id` of the musical to delete.

5. Approve a Musical:

```sh
curl -X POST http://localhost:3000/v1/musical/:musicalId/approve \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Replace `1` with the `id` of the musical to approve.
- Requires admin privileges.

6. Get Pending Musicals:

```sh
curl -X GET http://localhost:3000/v1/musical/pending \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Requires admin privileges.

## Performance endpoints

1. Create Performance:

```sh
curl -X POST http://localhost:3000/v1/performance/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "productionId": 2,
  "date": "2023-10-01T19:00:00Z",
  "theaterId": 3
}'
```

2. Get Performance by ID:

```sh
curl -X GET http://localhost:3000/v1/performance/1 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. Update Performance:

```sh
curl -X PUT http://localhost:3000/v1/performance/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "productionId": 2,
  "date": "2023-10-02T19:00:00Z",
  "theaterId": 4
}'
```

4. Delete Performance:

```sh
curl -X PUT http://localhost:3000/v1/performance/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "productionId": 2,
  "date": "2023-10-02T19:00:00Z",
  "theaterId": 4
}'
```

5. Get all Performances:

```sh
curl -X GET http://localhost:3000/v1/performance/ \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

## Production endpoints

1. Create Production:

```sh
curl -X POST http://localhost:3000/v1/production/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "musicalId": 2,
  "startDate": "2023-10-01T19:00:00Z",
  "endDate": "2023-10-10T19:00:00Z",
  "posterUrl": "https://example.com/poster.jpg"
}'
```

2. Get Production by ID:

```sh
curl -X GET http://localhost:3000/v1/production/1 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. Update Production:

```sh
curl -X PUT http://localhost:3000/v1/production/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "musicalId": 3,
  "startDate": "2023-10-05T19:00:00Z",
  "endDate": "2023-10-15T19:00:00Z",
  "posterUrl": "https://example.com/new-poster.jpg"
}'
```

4. Delete Production:

```sh
curl -X DELETE http://localhost:3000/v1/production/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1
}'
```

5. Approve Production:

```sh
curl -X POST http://localhost:3000/v1/production/:productionId/approve \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Requires admin privileges.

6. get pending Productions:

```sh
curl -X GET http://localhost:3000/v1/production/pending \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Requires admin privileges.

## Role endpoints

1. Create Role:

```sh
curl -X POST http://localhost:3000/v1/role/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "name": "Lead Actor"
}'
```

2. Get Role by ID:

```sh
curl -X GET http://localhost:3000/v1/role/1 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. Update Role:

```sh
curl -X PUT http://localhost:3000/v1/role/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "name": "Supporting Actor"
}'
```

4. Delete Role:

```sh
curl -X DELETE http://localhost:3000/v1/role/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1
}'
```

5. Approve Role:

```sh
curl -X POST http://localhost:3000/v1/role/:roleId/approve \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Requires admin privileges.

6. Get pending Roles:

```sh
curl -X GET http://localhost:3000/v1/role/pending \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Requires admin privileges.

## Theater endpoints

1. Create Theater:

```sh
curl -X POST http://localhost:3000/v1/theater/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "name": "Broadway Theater"
}'
```

2. Get Theater by ID:

```sh
curl -X GET http://localhost:3000/v1/theater/1 \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

3. Update Theater:

```sh
curl -X PUT http://localhost:3000/v1/theater/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1,
  "name": "Updated Theater Name"
}'
```

4. Delete Theater:

```sh
curl -X DELETE http://localhost:3000/v1/theater/ \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-d '{
  "id": 1
}'
```

5. Approve Theater:

```sh
curl -X POST http://localhost:3000/v1/theater/:theaterId/approve \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Requires admin privileges.

6. Get Pending Theaters:

```sh
curl -X GET http://localhost:3000/v1/theater/pending \
-H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN"
```

- Requires admin privileges.
