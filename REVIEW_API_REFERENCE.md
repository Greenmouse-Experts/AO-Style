# Review System API Reference

## Overview
This document provides the exact API specifications for the review system as implemented in the AO-Style platform.

## Base URL
```
{LOCAL_URL}/api
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer {access_token}
```

## Endpoints

### 1. Create Review
Submit a new review for a product.

**Endpoint:** `POST /review/create`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Good",
  "content": "Nice work",
  "product_id": "03bd97ac-3fe6-4a73-8868-ee215e636dc2"
}
```

**Minimal Request (rating only):**
```json
{
  "rating": 5,
  "product_id": "03bd97ac-3fe6-4a73-8868-ee215e636dc2"
}
```

**Field Validations:**
- `rating`: Required, integer between 1-5
- `title`: Optional, string, max 100 characters (omit from request if empty)
- `content`: Optional, string, min 10 characters when provided, max 1000 characters (omit from request if empty)
- `product_id`: Required, valid UUID string

**Success Response (201 Created):**
```json
{
  "statusCode": 200,
  "message": "Review created successfully."
}
```

**Error Responses:**
```json
// Validation Error (400)
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "rating": "Rating must be between 1 and 5",
    "title": "Title must be less than 100 characters",
    "content": "Content must be at least 10 characters when provided"
  }
}

// Unauthorized (401)
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// Product Not Found (404)
{
  "statusCode": 404,
  "message": "Product not found"
}
```

### 2. Get Product Reviews
Fetch reviews for a specific product with pagination and sorting.

**Endpoint:** `GET /review/fetch`

**Query Parameters:**
- `product_id`: Required, UUID of the product
- `page`: Optional, page number (default: 1)
- `limit`: Optional, items per page (default: 5, max: 20)
- `sort`: Optional, sorting option
  - `newest`: Sort by creation date (newest first) - default
  - `oldest`: Sort by creation date (oldest first)
  - `highest`: Sort by rating (highest first)
  - `lowest`: Sort by rating (lowest first)

**Example Request:**
```
GET /review/fetch?product_id=03bd97ac-3fe6-4a73-8868-ee215e636dc2&page=1&limit=5&sort=newest
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "d70b9d7d-8dfa-4c63-877b-f229218f89a8",
      "rating": 5,
      "title": "Good",
      "content": "Nice work",
      "created_at": "2025-07-31 20:03:14.704",
      "updated_at": "2025-07-31 21:03:14.704",
      "deleted_at": null,
      "user_id": "7750e65e-33c7-435d-b1ea-e37306cb02c3",
      "product_id": "03bd97ac-3fe6-4a73-8868-ee215e636dc2",
      "user": {
        "id": "7750e65e-33c7-435d-b1ea-e37306cb02c3",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "count": 1,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 5
  }
}
```

**Error Responses:**
```json
// Missing Product ID (400)
{
  "statusCode": 400,
  "message": "Product ID is required"
}

// Invalid Product ID (400)
{
  "statusCode": 400,
  "message": "Invalid product ID format"
}
```

### 3. Get Product Average Rating
Fetch average rating and statistics for a specific product.

**Endpoint:** `GET /review/fetch-avg/{product_id}`

**Path Parameters:**
- `product_id`: Required, UUID of the product

**Example Request:**
```
GET /review/fetch-avg/03bd97ac-3fe6-4a73-8868-ee215e636dc2
```

**Success Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "product_id": "03bd97ac-3fe6-4a73-8868-ee215e636dc2",
    "averageRating": 5,
    "totalReviews": 1,
    "ratingDistribution": {
      "5": 1,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0
    }
  }
}
```

**Response Fields:**
- `product_id`: UUID of the product
- `averageRating`: Decimal average rating (0-5)
- `totalReviews`: Total number of reviews
- `ratingDistribution`: Object with count of reviews per rating level

**Error Responses:**
```json
// Product Not Found (404)
{
  "statusCode": 404,
  "message": "Product not found"
}

// No Reviews Found (200)
{
  "statusCode": 200,
  "data": {
    "product_id": "03bd97ac-3fe6-4a73-8868-ee215e636dc2",
    "averageRating": 0,
    "totalReviews": 0,
    "ratingDistribution": {
      "5": 0,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0
    }
  }
}
```

## Frontend Implementation

### Service Usage
```javascript
import ReviewService from '../../services/api/reviews';

// Create review with all fields
const reviewData = {
  product_id: "03bd97ac-3fe6-4a73-8868-ee215e636dc2",
  rating: 5,
  title: "Great product!",
  content: "Really impressed with the quality."
};
await ReviewService.createReview(reviewData);

// Create review with rating only
const minimalReviewData = {
  product_id: "03bd97ac-3fe6-4a73-8868-ee215e636dc2",
  rating: 4
};
await ReviewService.createReview(minimalReviewData);

// Get reviews
const reviews = await ReviewService.getProductReviews(productId, {
  page: 1,
  limit: 5,
  sort: 'newest'
});

// Get average rating
const avgRating = await ReviewService.getProductAverageRating(productId);
```

### Hook Usage
```javascript
import { useCreateReview, useGetProductReviews, useGetProductAverageRating } from '../../hooks/reviews';

// In your component
const { createReview, isPending } = useCreateReview();
const { reviews, totalReviews, isLoading } = useGetProductReviews(productId);
const { averageRating, totalReviews: ratingCount } = useGetProductAverageRating(productId);
```

## Rate Limiting
- Maximum 10 reviews per user per product
- Maximum 50 API calls per minute per user
- Bulk operations limited to 100 items

## Data Retention
- Reviews are soft-deleted (marked as deleted but not removed)
- Data retained for 7 years for compliance
- Users can request data deletion under GDPR

## Security Notes
- All inputs are sanitized to prevent XSS
- SQL injection protection via parameterized queries
- Content moderation flags inappropriate reviews
- Rate limiting prevents spam submissions

## Error Codes Summary
- `200`: Success
- `201`: Created successfully
- `400`: Bad request / Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `422`: Unprocessable entity
- `429`: Too many requests
- `500`: Internal server error

## Testing Examples

### cURL Examples
```bash
# Create a review
# Create review with all fields
curl -X POST "http://localhost:3000/api/review/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product_id": "03bd97ac-3fe6-4a73-8868-ee215e636dc2",
    "rating": 5,
    "title": "Excellent quality",
    "content": "Really happy with this purchase. Great quality and fast delivery."
  }'

# Create review with rating only
curl -X POST "http://localhost:3000/api/review/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "product_id": "03bd97ac-3fe6-4a73-8868-ee215e636dc2",
    "rating": 4
  }'

# Get reviews
curl "http://localhost:3000/api/review/fetch?product_id=03bd97ac-3fe6-4a73-8868-ee215e636dc2&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get average rating
curl "http://localhost:3000/api/review/fetch-avg/03bd97ac-3fe6-4a73-8868-ee215e636dc2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/Fetch Examples
```javascript
// Create review
// Full review
const response = await fetch('/api/review/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    product_id: '03bd97ac-3fe6-4a73-8868-ee215e636dc2',
    rating: 5,
    title: 'Great product',
    content: 'Exceeded my expectations in every way.'
  })
});

// Rating only
const minimalResponse = await fetch('/api/review/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    product_id: '03bd97ac-3fe6-4a73-8868-ee215e636dc2',
    rating: 5
  })
});

// Get reviews
const reviewsResponse = await fetch(
  `/api/review/fetch?product_id=03bd97ac-3fe6-4a73-8868-ee215e636dc2&page=1&limit=5`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
```

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check token validity and format
2. **400 Bad Request**: Validate all required fields and formats
3. **404 Product Not Found**: Verify product_id exists in database
4. **422 Validation Error**: Check field constraints and data types

### Debug Mode
Enable debug logging by setting environment variable:
```
DEBUG_REVIEWS=true
```

This will log all API requests and responses for debugging purposes.