
# QuickNotes API Design Document

## 1. Introduction

QuickNotes is an online note-taking application that allows users to create, view, update, organize and delete personal notes.

This document describes the REST API that the QuickNotes backend team will develop. It defines the available endpoints, HTTP methods, request formats, response formats and error codes.

The API will use JSON (JavaScript Object Notation) for exchanging data between the client and server.

### Base URL

https://api.quicknotes.com/v1

### Data Format

All requests and responses use JSON unless otherwise specified.

### Authentication

The API uses Bearer Token authentication. Protected endpoints require users to include a valid access token in the Authorization header.

Example:

Authorization: Bearer YOUR_ACCESS_TOKEN

---

## 2. REST API Endpoints

The following endpoints define the main operations supported by QuickNotes.

| Method | Endpoint | Description | Success Status |
|---|---|---|---|
| POST | /auth/register | Register a new user | 201 Created |
| POST | /auth/login | Authenticate a user | 200 OK |
| GET | /notes | Retrieve the logged-in user's notes | 200 OK |
| GET | /notes/{id} | Retrieve one specific note | 200 OK |
| POST | /notes | Create a new note | 201 Created |
| PUT | /notes/{id} | Update an existing note | 200 OK |
| DELETE | /notes/{id} | Delete a note | 204 No Content |
| GET | /tags | Retrieve available tags | 200 OK |

### 2.1 Register a User

**Endpoint:** POST /auth/register

**Description:** Creates a new QuickNotes account.

**Request example:**

{
  "name": "John Kamau",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

**Successful response: 201 Created**

{
  "message": "Account created successfully.",
  "user": {
    "id": 1,
    "name": "John Kamau",
    "email": "john@example.com"
  }
}

### 2.2 Login

**Endpoint:** POST /auth/login

**Description:** Authenticates an existing user and returns an access token.

**Request example:**

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

**Successful response: 200 OK**

{
  "message": "Login successful.",
  "accessToken": "example_access_token",
  "user": {
    "id": 1,
    "name": "John Kamau",
    "email": "john@example.com"
  }
}

### 2.3 List Notes

**Endpoint:** GET /notes

**Description:** Retrieves notes belonging to the authenticated user.

**Successful response: 200 OK**

{
  "data": [
    {
      "id": 101,
      "userId": 1,
      "title": "My Study Notes",
      "body": "Remember to revise HTML and CSS.",
      "createdAt": "2026-11-02T10:00:00Z",
      "updatedAt": "2026-11-02T10:00:00Z",
      "tags": [
        {
          "id": 1,
          "name": "Education"
        }
      ]
    },
    {
      "id": 102,
      "userId": 1,
      "title": "Project Ideas",
      "body": "Develop a new website project.",
      "createdAt": "2026-11-02T11:00:00Z",
      "updatedAt": "2026-11-02T11:00:00Z",
      "tags": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}

### 2.4 Retrieve One Note

**Endpoint:** GET /notes/{id}

**Description:** Retrieves a specific note belonging to the authenticated user.

Example:

GET /notes/101

**Successful response: 200 OK**

{
  "id": 101,
  "userId": 1,
  "title": "My Study Notes",
  "body": "Remember to revise HTML and CSS.",
  "createdAt": "2026-11-02T10:00:00Z",
  "updatedAt": "2026-11-02T10:00:00Z"
}

### 2.5 Create a Note

**Endpoint:** POST /notes

**Description:** Creates a new note for the authenticated user.

**Request headers:**

Content-Type: application/json

Authorization: Bearer YOUR_ACCESS_TOKEN

**Request JSON example:**

{
  "title": "Learning API Development",
  "body": "Today I learned how REST APIs work and how to use fetch."
}

**Successful response: 201 Created**

{
  "message": "Note created successfully.",
  "note": {
    "id": 103,
    "userId": 1,
    "title": "Learning API Development",
    "body": "Today I learned how REST APIs work and how to use fetch.",
    "createdAt": "2026-11-02T12:00:00Z",
    "updatedAt": "2026-11-02T12:00:00Z"
  }
}

The server automatically assigns the note ID, user ID and timestamps. The user ID is obtained from the authenticated account rather than trusted from the request body.

### 2.6 Update a Note

**Endpoint:** PUT /notes/{id}

**Description:** Updates the title and body of an existing note.

Example:

PUT /notes/103

**Request JSON example:**

{
  "title": "Learning REST API Development",
  "body": "I have learned how to create, retrieve and update notes."
}

**Successful response: 200 OK**

{
  "message": "Note updated successfully.",
  "note": {
    "id": 103,
    "userId": 1,
    "title": "Learning REST API Development",
    "body": "I have learned how to create, retrieve and update notes.",
    "updatedAt": "2026-11-02T13:00:00Z"
  }
}

### 2.7 Delete a Note

**Endpoint:** DELETE /notes/{id}

**Description:** Permanently deletes a note belonging to the authenticated user.

Example:

DELETE /notes/103

**Successful response: 204 No Content**

The server returns an empty response body after successfully deleting the note.

### 2.8 List Tags

**Endpoint:** GET /tags

**Description:** Retrieves the tags available to the authenticated user.

**Successful response: 200 OK**

{
  "data": [
    {
      "id": 1,
      "name": "Education"
    },
    {
      "id": 2,
      "name": "Personal"
    },
    {
      "id": 3,
      "name": "Work"
    }
  ]
}

---

## 3. HTTP Status Codes

The API uses standard HTTP status codes to communicate the outcome of requests.

| Status Code | Meaning | Description |
|---|---|---|
| 200 | OK | The request was successful. |
| 201 | Created | A new resource was successfully created. |
| 204 | No Content | The request succeeded without returning content. |
| 400 | Bad Request | The request contains invalid information. |
| 401 | Unauthorized | Authentication is missing or invalid. |
| 403 | Forbidden | The user does not have permission to perform the operation. |
| 404 | Not Found | The requested resource does not exist or is not accessible. |
| 409 | Conflict | The request conflicts with existing data, such as a duplicate email. |
| 422 | Unprocessable Entity | The request format is valid, but its content fails validation. |
| 429 | Too Many Requests | The user has exceeded the allowed request limit. |
| 500 | Internal Server Error | An unexpected server-side error occurred. |

## 4. Error Response Format

QuickNotes uses a consistent JSON structure when returning errors.

**Example: 400 Bad Request**

{
  "error": {
    "status": 400,
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid information.",
    "details": [
      {
        "field": "title",
        "message": "The title is required."
      }
    ]
  }
}

Other possible error responses include:

**401 Unauthorized**

{
  "error": {
    "status": 401,
    "code": "UNAUTHORIZED",
    "message": "Please log in to access this resource."
  }
}

**403 Forbidden**

{
  "error": {
    "status": 403,
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource."
  }
}

**404 Not Found**

{
  "error": {
    "status": 404,
    "code": "NOT_FOUND",
    "message": "The requested note could not be found."
  }
}

**500 Internal Server Error**

{
  "error": {
    "status": 500,
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again later."
  }
}

The server should avoid exposing passwords, access tokens, database credentials or internal error details in responses.

---

## 5. API Security and Validation

The QuickNotes API should follow these security and validation practices:

1. Authentication: Protected endpoints must require a valid access token.
2. Authorization: Users can only view, update or delete their own notes.
3. Input validation: Note titles are required and must not exceed 100 characters.
4. Password security: Passwords must be securely hashed before storage.
5. HTTPS: All communication between the client and server must use HTTPS.
6. Rate limiting: Requests should be limited to reduce abuse and automated attacks.
7. SQL injection protection: Database queries should use parameterized statements.
8. Error handling: Responses should provide useful messages without exposing sensitive system information.

## 6. Conclusion

The QuickNotes API provides a structured way for the frontend and backend to communicate.

The REST endpoints support user authentication, note creation, retrieval, updating, deletion and tag management.

Using standard HTTP methods, JSON data formats and consistent status codes makes the API easier to maintain, test and expand as the application grows.

The proposed design provides a foundation for developing a secure and scalable online note-taking service.
