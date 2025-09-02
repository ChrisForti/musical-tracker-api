# API Endpoints - Version 2

## Overview

All V2 endpoints use UUID-based identifiers and the "verified" field pattern instead of "approved". Authentication is required for most endpoints via Bearer token.

## Authentication Endpoints

### Users

#### Create User (Register)

```bash
curl -X POST http://localhost:3000/v2/user \
-H "Content-Type: application/json" \
-d '{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}'
```

#### Login User

```bash
curl -X POST http://localhost:3000/v2/user/login \
-H "Content-Type: application/json" \
-d '{
  "email": "john@example.com",
  "password": "password123"
}'
```

#### Get Current User Profile

```bash
curl -X GET http://localhost:3000/v2/user \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Update Current User

```bash
curl -X PUT http://localhost:3000/v2/user \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "firstName": "Updated Name",
  "lastName": "Updated Last",
  "email": "updated@example.com"
}'
```

#### Get All Users (Admin Only)

```bash
curl -X GET http://localhost:3000/v2/user/all \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Delete Current User

```bash
curl -X DELETE http://localhost:3000/v2/user \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Theater Endpoints

#### Get All Verified Theaters

```bash
curl -X GET http://localhost:3000/v2/theater
```

#### Get Pending Theaters (Admin Only)

```bash
curl -X GET "http://localhost:3000/v2/theater?pending=true" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Theater

```bash
curl -X POST http://localhost:3000/v2/theater \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Broadway Theatre",
  "city": "New York"
}'
```

#### Get Theater by ID

```bash
curl -X GET http://localhost:3000/v2/theater/:id
```

#### Update Theater

```bash
curl -X PUT http://localhost:3000/v2/theater/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Updated Theater Name",
  "city": "Updated City"
}'
```

#### Delete Theater

```bash
curl -X DELETE http://localhost:3000/v2/theater/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Verify Theater (Admin Only)

```bash
curl -X POST http://localhost:3000/v2/theater/:id/verify \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Actor Endpoints

#### Get All Verified Actors

```bash
curl -X GET http://localhost:3000/v2/actor
```

#### Get Pending Actors (Admin Only)

```bash
curl -X GET "http://localhost:3000/v2/actor?pending=true" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Actor

```bash
curl -X POST http://localhost:3000/v2/actor \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Hugh Jackman"
}'
```

#### Get Actor by ID

```bash
curl -X GET http://localhost:3000/v2/actor/:id
```

#### Update Actor

```bash
curl -X PUT http://localhost:3000/v2/actor/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Updated Actor Name"
}'
```

#### Delete Actor

```bash
curl -X DELETE http://localhost:3000/v2/actor/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Verify Actor (Admin Only)

```bash
curl -X POST http://localhost:3000/v2/actor/:id/verify \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Musical Endpoints

#### Get All Verified Musicals

```bash
curl -X GET http://localhost:3000/v2/musical
```

#### Get Pending Musicals (Admin Only)

```bash
curl -X GET "http://localhost:3000/v2/musical?pending=true" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Musical

```bash
curl -X POST http://localhost:3000/v2/musical \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "Hamilton",
  "composer": "Lin-Manuel Miranda",
  "lyricist": "Lin-Manuel Miranda"
}'
```

#### Get Musical by ID

```bash
curl -X GET http://localhost:3000/v2/musical/:id
```

#### Update Musical

```bash
curl -X PUT http://localhost:3000/v2/musical/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "Updated Musical Title",
  "composer": "Updated Composer",
  "lyricist": "Updated Lyricist"
}'
```

#### Delete Musical

```bash
curl -X DELETE http://localhost:3000/v2/musical/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Verify Musical (Admin Only)

```bash
curl -X POST http://localhost:3000/v2/musical/:id/verify \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Role Endpoints

#### Get All Verified Roles

```bash
curl -X GET http://localhost:3000/v2/role
```

#### Get Pending Roles (Admin Only)

```bash
curl -X GET "http://localhost:3000/v2/role?pending=true" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Role

```bash
curl -X POST http://localhost:3000/v2/role \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Alexander Hamilton",
  "musicalId": "uuid-of-musical"
}'
```

#### Get Role by ID

```bash
curl -X GET http://localhost:3000/v2/role/:id
```

#### Update Role

```bash
curl -X PUT http://localhost:3000/v2/role/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Updated Role Name",
  "musicalId": "uuid-of-musical"
}'
```

#### Delete Role

```bash
curl -X DELETE http://localhost:3000/v2/role/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Verify Role (Admin Only)

```bash
curl -X POST http://localhost:3000/v2/role/:id/verify \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Casting Endpoints

#### Get All Verified Castings

```bash
curl -X GET http://localhost:3000/v2/casting
```

#### Get Pending Castings (Admin Only)

```bash
curl -X GET "http://localhost:3000/v2/casting?pending=true" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Casting

```bash
curl -X POST http://localhost:3000/v2/casting \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "actorId": "uuid-of-actor",
  "roleId": "uuid-of-role"
}'
```

#### Get Casting by ID

```bash
curl -X GET http://localhost:3000/v2/casting/:id
```

#### Update Casting

```bash
curl -X PUT http://localhost:3000/v2/casting/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "actorId": "uuid-of-actor",
  "roleId": "uuid-of-role"
}'
```

#### Delete Casting

```bash
curl -X DELETE http://localhost:3000/v2/casting/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Verify Casting (Admin Only)

```bash
curl -X POST http://localhost:3000/v2/casting/:id/verify \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Performance Endpoints

#### Get Performances

- **User**: Returns only their own performances
- **Admin**: Returns all performances, or use `?userId=uuid` to filter by user

```bash
curl -X GET http://localhost:3000/v2/performance \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Admin can filter by user
curl -X GET "http://localhost:3000/v2/performance?userId=specific-user-uuid" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Performance

```bash
curl -X POST http://localhost:3000/v2/performance \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "musicalId": "uuid-of-musical",
  "notes": "Amazing show!",
  "posterUrl": "https://example.com/poster.jpg"
}'
```

#### Get Performance by ID

```bash
curl -X GET http://localhost:3000/v2/performance/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Update Performance

```bash
curl -X PUT http://localhost:3000/v2/performance/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "musicalId": "uuid-of-musical",
  "notes": "Updated notes",
  "posterUrl": "https://example.com/updated-poster.jpg"
}'
```

#### Delete Performance

```bash
curl -X DELETE http://localhost:3000/v2/performance/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Response Formats

### Success Responses

- **200 OK**: Successful GET, PUT operations
- **201 Created**: Successful POST operations
- **204 No Content**: Successful DELETE operations

### Error Responses

- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Example Success Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Broadway Theatre",
  "city": "New York",
  "verified": true,
  "createdAt": "2025-09-02T12:00:00Z",
  "updatedAt": "2025-09-02T12:00:00Z"
}
```

### Example Error Response

```json
{
  "error": "Theater not found"
}
```

### Example Validation Error Response

```json
{
  "errors": {
    "name": "Name is required",
    "city": "City is required"
  }
}
```

## Notes

1. All IDs are UUIDs (not sequential numbers)
2. All endpoints except user registration/login require authentication
3. Admin-only endpoints return 403 for non-admin users
4. The `pending=true` query parameter shows unverified content (admin only)
5. Users can only modify/delete their own content unless they're admin
6. All timestamps are in ISO 8601 format
7. File uploads (like poster images) should be handled separately and URLs stored in the database
