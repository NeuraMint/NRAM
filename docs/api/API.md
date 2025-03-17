# NeuraMint API Documentation

## Overview

NeuraMint provides a RESTful API for interacting with the platform services. This document outlines the available endpoints, request formats, and response structures.

## Base URL

The base URL for all API requests depends on the environment:

- **Development**: `https://dev-api.neuramint.tech/api`
- **Staging**: `https://staging-api.neuramint.tech/api`
- **Production**: `https://api.neuramint.tech/api`

## Authentication

Most endpoints require authentication using a JSON Web Token (JWT). Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Memory NFT Endpoints

### Get All Memories

Retrieves a list of all memory NFTs.

```
GET /memories
```

#### Query Parameters

| Parameter | Type   | Description                           |
|-----------|--------|---------------------------------------|
| limit     | number | Maximum number of records to return   |
| offset    | number | Number of records to skip             |
| owner     | string | Filter by owner address               |
| type      | string | Filter by memory type                 |
| quality   | string | Filter by memory quality              |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "mint": "string",
      "owner": "string",
      "name": "string",
      "description": "string",
      "imageUrl": "string",
      "price": 0,
      "isListed": false,
      "quality": "common | fine | excellent | legendary",
      "memoryType": "cognitive | emotional | cultural | therapeutic",
      "createdAt": 0,
      "neuralFingerprint": "string",
      "brainRegion": "string",
      "emotionalValence": 0,
      "cognitiveLoad": 0,
      "uri": "string"
    }
  ]
}
```

### Get Memory by ID

Retrieves a specific memory NFT by ID.

```
GET /memories/:id
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "mint": "string",
    "owner": "string",
    "name": "string",
    "description": "string",
    "imageUrl": "string",
    "price": 0,
    "isListed": false,
    "quality": "common | fine | excellent | legendary",
    "memoryType": "cognitive | emotional | cultural | therapeutic",
    "createdAt": 0,
    "neuralFingerprint": "string",
    "brainRegion": "string",
    "emotionalValence": 0,
    "cognitiveLoad": 0,
    "uri": "string"
  }
}
```

### Create Memory NFT

Mints a new memory NFT.

```
POST /memories
```

#### Request Body

```json
{
  "name": "string",
  "description": "string",
  "image": "base64 encoded string",
  "memoryType": "cognitive | emotional | cultural | therapeutic",
  "brainRegion": "string",
  "emotionalValence": 0,
  "cognitiveLoad": 0,
  "neuralFingerprint": "string"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": "string",
    "mint": "string",
    "owner": "string",
    "transactionSignature": "string",
    "uri": "string"
  }
}
```

## Marketplace Endpoints

### List Memory for Sale

Lists a memory NFT for sale on the marketplace.

```
POST /market/list
```

#### Request Body

```json
{
  "mint": "string",
  "price": 0
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "mint": "string",
    "price": 0,
    "seller": "string",
    "transactionSignature": "string"
  }
}
```

### Buy Memory

Purchases a memory NFT from the marketplace.

```
POST /market/buy
```

#### Request Body

```json
{
  "mint": "string"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "mint": "string",
    "buyer": "string",
    "seller": "string",
    "price": 0,
    "transactionSignature": "string"
  }
}
```

### Get Listed Memories

Retrieves all memories listed for sale.

```
GET /market/listings
```

#### Query Parameters

| Parameter | Type   | Description                           |
|-----------|--------|---------------------------------------|
| limit     | number | Maximum number of records to return   |
| offset    | number | Number of records to skip             |
| minPrice  | number | Minimum price filter                  |
| maxPrice  | number | Maximum price filter                  |
| type      | string | Filter by memory type                 |
| quality   | string | Filter by memory quality              |

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "mint": "string",
      "seller": "string",
      "price": 0,
      "listedAt": 0,
      "memory": {
        // Memory object as described above
      }
    }
  ]
}
```

## Validation Endpoints

### Register as Validator

Registers a user as a memory validator.

```
POST /validators/register
```

#### Request Body

```json
{
  "stake": 0
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "validatorId": "string",
    "owner": "string",
    "stake": 0,
    "reputation": 0,
    "transactionSignature": "string"
  }
}
```

### Get Validator Status

Retrieves the status of a validator.

```
GET /validators/:address
```

#### Response

```json
{
  "success": true,
  "data": {
    "validatorId": "string",
    "owner": "string",
    "stake": 0,
    "reputation": 0,
    "totalValidations": 0,
    "successRate": 0,
    "pendingRewards": 0,
    "status": "active | inactive | suspended"
  }
}
```

### Submit Validation

Submits a validation for a memory.

```
POST /validations/submit
```

#### Request Body

```json
{
  "memoryId": "string",
  "score": 0,
  "comments": "string"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "validationId": "string",
    "validator": "string",
    "memory": "string",
    "score": 0,
    "timestamp": 0,
    "transactionSignature": "string"
  }
}
```

### Get Memories to Validate

Retrieves memories pending validation.

```
GET /validations/pending
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "mint": "string",
      "name": "string",
      "description": "string",
      "imageUrl": "string",
      "submittedAt": 0,
      "owner": "string",
      "neuralFingerprint": "string"
    }
  ]
}
```

### Get Validator Rankings

Retrieves the rankings of validators.

```
GET /validators/rankings
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "rank": 0,
      "validatorId": "string",
      "owner": "string",
      "reputation": 0,
      "totalValidations": 0,
      "successRate": 0
    }
  ]
}
```

## Error Handling

All API endpoints follow a consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

Common error codes:

| Code              | Description                                 |
|-------------------|---------------------------------------------|
| UNAUTHORIZED      | Authentication required or token invalid    |
| FORBIDDEN         | User lacks permission for this operation    |
| NOT_FOUND         | Requested resource not found                |
| VALIDATION_ERROR  | Request data failed validation              |
| BLOCKCHAIN_ERROR  | Error occurred during blockchain transaction|
| INTERNAL_ERROR    | Internal server error                       |

## Rate Limiting

API requests are subject to rate limiting:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1628785282
```

## Webhooks

NeuraMint supports webhooks for real-time notifications. Configure webhook endpoints in your account settings to receive notifications for events like:

- Memory NFT minted
- Validation submitted
- Marketplace listing created
- Purchase completed

Webhook payloads include event type and relevant data in JSON format. 