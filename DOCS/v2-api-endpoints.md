# API Endpoints - Version 2

## Overview

All V2 endpoints use UUID-based identifiers and the "verified" field pattern instead of "approved". Authentication is required for most endpoints via Bearer token.

## ⚠️ **BREAKING CHANGES - Architecture Refactor**

**Database Schema Changes (September 2025):**

- Changed `poster_url` (VARCHAR) → `poster_id` (UUID) with foreign key constraints
- Removed entity linking (`entity_type`, `entity_id`) from uploaded_images table
- Implemented foreign key relationships: `musicals.poster_id` → `uploaded_images.id`
- Implemented foreign key relationships: `performances.poster_id` → `uploaded_images.id`

**API Response Changes:**

- Musicals and performances now return `posterId` field instead of embedded images
- Entity-based image lookup endpoints return 501 (deprecated)
- Simplified responses focus on foreign key relationships

**Migration Path:**

1. Upload images using `POST /media` (unified endpoint for all image types)
2. Use returned `imageId` as `posterId` when creating/updating musicals/performances
3. Fetch image details separately using the `posterId` if needed

This refactor improves data integrity through proper foreign key relationships and follows radical simplicity principles.

## Recent Updates (api-improvements branch)

### Changes Made:

- **Musical**:
  - Changed from `posterUrl` field to `posterId` field with foreign key to uploaded_images
  - **All endpoints now require authentication**
  - PUT endpoint requires admin access if musical is verified
  - **PUT endpoint now accepts `name` parameter instead of `title`**
  - **Verify and delete endpoints now return empty responses `{}`**
  - **GET responses now return posterId instead of embedded images**
- **Performance**:
  - Changed from `posterUrl` field to `posterId` field with foreign key to uploaded_images
  - **Added required `theaterId` field to POST and PUT endpoints**
  - Added optional `date` field to POST and PUT endpoints
  - **GET /performance/:id now requires authentication**
  - **Enhanced GET responses with complex joins including musical, theater, and cast data**
  - **Added `posterUrl` resolution in GET responses using imageDb service**
  - Added actor filtering: `?actorId=uuid` to get performances where specific actor was cast
  - **GET responses now return posterId instead of embedded images**
- **Casting**:
  - Added **required** `performanceId` field to all endpoints
  - POST response now returns only `{"id": "casting-uuid"}`
  - Removed `verified` field completely
  - Removed pending query parameter and verify endpoint
  - **All endpoints now require authentication**
  - GET `/casting` now returns all castings (no filtering)
- **Pending System**:
  - **NEW**: `GET /pending/musicals` - Admin endpoint for unverified musicals
  - **NEW**: `GET /pending/theaters` - Admin endpoint for unverified theaters
  - **NEW**: `GET /pending/actors` - Admin endpoint for unverified actors
  - **NEW**: `GET /pending/roles` - Admin endpoint for unverified roles
  - **SIMPLIFIED**: All pending endpoints return consistent `{id, name}` format
- **Media System**:
  - **ROUTE CHANGE**: `/upload` renamed to `/media` for all endpoints
  - **NEW**: Complete image upload system with AWS S3 integration
  - **NEW**: `POST /media` - Unified endpoint for all image uploads (poster, profile)
  - **NEW**: `DELETE /media/:imageId` - Delete uploaded images
  - **DEPRECATED**: `GET /media/entity/:entityType/:entityId` - Returns 501 error (use foreign key relationships)
  - **ARCHITECTURAL CHANGE**: Removed entity linking, now uses foreign key relationships
  - **SIMPLIFIED**: Single endpoint replaces separate poster/profile upload endpoints
  - Automatic image processing (resize, compress, format conversion)
  - Secure file validation and user permission checks

---

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

#### Get Pending Musicals (Admin Only)

```bash
curl -X GET "http://localhost:3000/v2/musical?pending=true" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Musical (Authentication Required)

```bash
curl -X POST http://localhost:3000/v2/musical \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "Hamilton",
  "composer": "Lin-Manuel Miranda",
  "lyricist": "Lin-Manuel Miranda",
  "posterId": "uuid-of-uploaded-image"
}'
```

#### Get Musical by ID (Authentication Required)

```bash
curl -X GET http://localhost:3000/v2/musical/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
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
    "name": "Unverified Musical"
  }
]
```

#### Get Pending Theaters

```bash
curl -X GET http://localhost:3000/v2/pending/theaters \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

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
- **Actor Filter**: Use `?actorId=uuid` to get performances where a specific actor was cast (users see only their own performances, admins see all)

```bash
curl -X GET http://localhost:3000/v2/performance \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Admin can filter by user
curl -X GET "http://localhost:3000/v2/performance?userId=specific-user-uuid" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by actor (returns performances where this actor was cast)
curl -X GET "http://localhost:3000/v2/performance?actorId=specific-actor-uuid" \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Create Performance

```bash
curl -X POST http://localhost:3000/v2/performance \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "musicalId": "uuid-of-musical",
  "theaterId": "uuid-of-theater",
  "date": "2024-12-25",
  "notes": "Amazing show!",
  "posterId": "uuid-of-uploaded-image"
}'
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
  "id": "uuid-of-performance",
  "musicalId": "uuid-of-musical",
  "theaterId": "uuid-of-theater",
  "userId": "uuid-of-user",
  "date": "2024-12-25",
  "notes": "Amazing show!",
  "posterId": "uuid-of-uploaded-image",
  "posterUrl": "https://signed-s3-url...",
  "musical": {
    "id": "uuid-of-musical",
    "title": "Hamilton",
    "composer": "Lin-Manuel Miranda",
    "lyricist": "Lin-Manuel Miranda"
  },
  "theater": {
    "id": "uuid-of-theater",
    "name": "Richard Rodgers Theatre",
    "city": "New York"
  },
  "cast": [
    {
      "id": "uuid-of-casting",
      "actor": {
        "id": "uuid-of-actor",
        "name": "Lin-Manuel Miranda"
      },
      "role": {
        "id": "uuid-of-role",
        "name": "Alexander Hamilton"
      }
    }
  ]
}
```

#### Update Performance (Authentication Required)

```bash
curl -X PUT http://localhost:3000/v2/performance/:id \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "musicalId": "uuid-of-musical",
  "theaterId": "uuid-of-theater",
  "date": "2024-12-26",
  "notes": "Updated notes",
  "posterId": "uuid-of-uploaded-image"
}'
```

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

Upload any type of media with a single endpoint. The `imageType` parameter determines the upload behavior and validation rules.

```bash
# Upload poster for musical
curl -X POST http://localhost:3000/v2/media \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-F "file=@/path/to/poster.jpg" \
-F "imageType=poster" \
-F "type=musical" \
-F "entityId=uuid-of-musical"

# Upload poster for performance
curl -X POST http://localhost:3000/v2/media \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-F "file=@/path/to/poster.jpg" \
-F "imageType=poster" \
-F "type=performance" \
-F "entityId=uuid-of-performance"

# Upload profile picture
curl -X POST http://localhost:3000/v2/media \
-H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
-F "file=@/path/to/profile.jpg" \
-F "imageType=profile"
```

**Parameters:**

- `file` (required): The image file to upload
- `imageType` (required): Type of image - "poster" or "profile"
- `type` (required for poster): Entity type - "musical" or "performance"
- `entityId` (required for poster): UUID of the musical or performance

**Response:**

```json
{
  "success": true,
  "imageId": "uuid-of-created-image",
  "url": "https://musical-tracker-images.s3.us-east-2.amazonaws.com/posters/musicals/musical-id/poster-timestamp.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=86400&X-Amz-Signature=...",
  "width": 1200,
  "height": 1600,
  "fileSize": 245760,
  "imageType": "poster"
}
```

**Note**: After uploading, use the returned `imageId` as the `posterId` when creating or updating musicals/performances.

#### Delete Uploaded Image

Delete an uploaded image (users can only delete their own images).

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
  "title": "Hamilton",
  "composer": "Lin-Manuel Miranda",
  "lyricist": "Lin-Manuel Miranda",
  "posterId": "uuid-of-associated-image",
  "verified": true
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
