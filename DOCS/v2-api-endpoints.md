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

#### Get All Musicals (Authentication Required)

```bash
curl -X GET http://localhost:3000/v2/musical \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
[
  {
    "id": "uuid-of-musical",
    "name": "Hamilton Test Updated",
    "composer": "Lin-Manuel Miranda",
    "lyricist": "Lin-Manuel Miranda",
    "posterId": "uuid-of-image",
    "verified": false,
    "posterUrl": "https://musical-tracker-images.s3.us-east-2.amazonaws.com/uploads/user/user-id/poster-timestamp-hash.jpg"
  }
]
```

#### Get Pending Musicals (Admin Only)

```bash
curl -X GET "http://localhost:3000/v2/musical?pending=true" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Musical (Authentication Required)

#### Create Musical (Authentication Required)

**Note**: Field name changed from `title` to `name` (September 2025).

```bash
curl -X POST http://localhost:3000/v2/musical \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Hamilton",
  "composer": "Lin-Manuel Miranda",
  "lyricist": "Lin-Manuel Miranda",
  "posterId": "uuid-of-uploaded-image"
}'
```

**Response:**

```json
{
  "message": "Musical created successfully",
  "id": "uuid-of-created-musical"
}
```

#### Get Musical by ID (Authentication Required)

```bash
curl -X GET http://localhost:3000/v2/musical/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
{
  "id": "uuid-of-musical",
  "name": "Hamilton Test Updated",
  "composer": "Lin-Manuel Miranda",
  "lyricist": "Lin-Manuel Miranda",
  "posterId": "uuid-of-image",
  "verified": false,
  "posterUrl": "https://musical-tracker-images.s3.us-east-2.amazonaws.com/uploads/user/user-id/poster-timestamp-hash.jpg"
}
```

#### Update Musical (Authentication Required, Admin Required if Verified)

**Note**: If the musical is verified, only admins can make changes. The endpoint now accepts `name` instead of `title`.

```bash
curl -X PUT http://localhost:3000/v2/musical/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "name": "Updated Musical Name",
  "composer": "Updated Composer",
  "lyricist": "Updated Lyricist",
  "posterId": "uuid-of-uploaded-image"
}'
```

#### Verify Musical (Admin Only)

**Returns empty response on success.**

```bash
curl -X POST http://localhost:3000/v2/musical/:id/verify \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:** `{}` (empty object)

#### Delete Musical

**Returns empty response on success.**

```bash
curl -X DELETE http://localhost:3000/v2/musical/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:** `{}` (empty object)

## Pending Endpoints (Admin Only)

These endpoints allow administrators to retrieve lists of unverified entities across all entity types.

#### Get Pending Musicals

```bash
curl -X GET http://localhost:3000/v2/pending/musicals \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
[
  {
    "id": "uuid-of-musical",
    "name": "Unverified Musical Title",
    "composer": "Composer Name",
    "lyricist": "Lyricist Name"
  }
]
```

````

#### Get Pending Theaters

```bash
curl -X GET http://localhost:3000/v2/pending/theaters \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
````

**Response:**

```json
[
  {
    "id": "uuid-of-theater",
    "name": "Unverified Theater"
  }
]
```

#### Get Pending Actors

```bash
curl -X GET http://localhost:3000/v2/pending/actors \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
[
  {
    "id": "uuid-of-actor",
    "name": "Unverified Actor"
  }
]
```

#### Get Pending Roles

```bash
curl -X GET http://localhost:3000/v2/pending/roles \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
[
  {
    "id": "uuid-of-role",
    "name": "Unverified Role"
  }
]
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

#### Get All Castings (Authentication Required)

```bash
curl -X GET http://localhost:3000/v2/casting \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Casting (Authentication Required)

```bash
curl -X POST http://localhost:3000/v2/casting \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "actorId": "uuid-of-actor",
  "roleId": "uuid-of-role",
  "performanceId": "uuid-of-performance"
}'
```

**Response:**

```json
{
  "id": "uuid-of-created-casting"
}
```

#### Get Casting by ID (Authentication Required)

```bash
curl -X GET http://localhost:3000/v2/casting/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Update Casting (Authentication Required)

```bash
curl -X PUT http://localhost:3000/v2/casting/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "actorId": "uuid-of-actor",
  "roleId": "uuid-of-role",
  "performanceId": "uuid-of-performance"
}'
```

#### Delete Casting (Authentication Required)

```bash
curl -X DELETE http://localhost:3000/v2/casting/:id \
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

**Response:**

```json
[
  {
    "posterUrl": "https://musical-tracker-images.s3.us-east-2.amazonaws.com/uploads/user/user-id/poster-timestamp-hash.jpg",
    "date": "2025-12-01",
    "theaterName": "Broadway Test Theater",
    "theaterId": "uuid-of-theater",
    "musicalName": "Hamilton Test Updated"
  }
]
```

#### Create Performance

```bash
curl -X POST http://localhost:3000/v2/performance \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "musicalId": "uuid-of-musical",
  "theaterId": "uuid-of-theater",
  "date": "2025-12-01",
  "notes": "Amazing show!",
  "posterId": "uuid-of-uploaded-image"
}'
```

**Response:**

```json
{
  "id": "uuid-of-created-performance"
}
```

#### Get Performance by ID (Authentication Required)

**Enhanced response with joined data:**

```bash
curl -X GET http://localhost:3000/v2/performance/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
{
  "posterUrl": "https://musical-tracker-images.s3.us-east-2.amazonaws.com/uploads/user/user-id/poster-timestamp-hash.jpg",
  "date": "2025-12-01",
  "theaterName": "Broadway Test Theater",
  "musicalName": "Hamilton Test Updated",
  "notes": "Test performance with poster",
  "cast": []
}
```

````

#### Update Performance (Authentication Required)

```bash
curl -X PUT http://localhost:3000/v2/performance/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "theaterId": "uuid-of-theater",
  "date": "2024-12-26",
  "notes": "Updated notes",
  "posterId": "uuid-of-uploaded-image"
}'
````

#### Delete Performance

```bash
curl -X DELETE http://localhost:3000/v2/performance/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Media Endpoints

The media system provides secure image storage with AWS S3 integration. All uploaded images are automatically processed (resized, compressed) and stored with organized folder structures.

### File Requirements

- **Poster Images**: Max 5MB, formats: JPG, PNG, WebP
- **Profile Images**: Max 2MB, formats: JPG, PNG, WebP
- **Processing**: Automatic resize, compression, and format optimization
- **Storage**: AWS S3 with organized folder structure
- **URLs**: All image URLs are signed and valid for 24 hours, allowing direct browser access

#### Upload Media (Unified Endpoint)

**SIMPLIFIED (September 2025):** Upload any type of media with a single endpoint following radical simplicity principles. No entity linking required - use the returned `imageId` as `posterId` when creating/updating musicals or performances.

```bash
# Upload any poster image (no entity type/id required)
curl -X POST http://localhost:3000/v2/media \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-F "file=@/path/to/poster.jpg" \
-F "imageType=poster"

# Upload profile picture
curl -X POST http://localhost:3000/v2/media \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-F "file=@/path/to/profile.jpg" \
-F "imageType=profile"
```

**Parameters:**

- `file` (required): The image file to upload
- `imageType` (required): Type of image - "poster" or "profile"
- ~~`type` (REMOVED): No longer required - entity linking simplified~~
- ~~`entityId` (REMOVED): No longer required - use returned imageId as posterId~~

**Response:**

```json
{
  "success": true,
  "imageId": "uuid-of-created-image",
  "url": "https://musical-tracker-images.s3.us-east-2.amazonaws.com/uploads/user/user-id/poster-timestamp-hash.jpg",
  "width": 1200,
  "height": 900,
  "fileSize": 201141,
  "imageType": "poster"
}
```

**Note**: The URL returned is a **permanent direct S3 URL** (not a temporary signed URL). Use the returned `imageId` as the `posterId` when creating or updating musicals/performances.

#### Delete Uploaded Image

Delete an uploaded image (users can only delete their own images). **If the image is referenced by musicals or performances, their `posterId` will automatically be set to `null`** - the entities remain intact.

```bash
curl -X DELETE http://localhost:3000/v2/media/uuid-of-image \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Behavior:**

- ✅ **Safe deletion**: Referenced musicals/performances are **not deleted**
- ✅ **Automatic cleanup**: `posterId` fields set to `null` automatically
- ✅ **Consistent responses**: GET endpoints return `posterUrl: null` when no image

#### Debug Media Configuration (Development Only)

Check AWS configuration status (only available in development environment).

```bash
curl -X GET http://localhost:3000/v2/media/debug
```

**Response:**

```json
{
  "message": "AWS Configuration Debug (Development Only)",
  "config": {
    "AWS_ACCESS_KEY_ID": "SET",
    "AWS_SECRET_ACCESS_KEY": "SET",
    "AWS_S3_BUCKET": "musical-tracker-images",
    "AWS_REGION": "us-east-2"
  },
  "issues": []
}
```

### Enhanced Entity Responses

**Musical and Performance GET endpoints now use foreign key relationships:**

```json
{
  "id": "uuid-of-musical",
  "name": "Hamilton",
  "composer": "Lin-Manuel Miranda",
  "lyricist": "Lin-Manuel Miranda",
  "posterId": "uuid-of-associated-image",
  "verified": true,
  "posterUrl": "https://musical-tracker-images.s3.us-east-2.amazonaws.com/uploads/user/user-id/poster-timestamp-hash.jpg"
}
```

**To get the actual image data, make a separate request to:**

```bash
curl -X GET http://localhost:3000/v2/media/uuid-of-associated-image \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Note**: The architecture now uses foreign key relationships instead of embedding images. This provides better data integrity and simpler API responses.

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
