
# QuickNotes - API Client and System Design

## 1. Project Overview

QuickNotes is a web-based note-taking application designed to help users create, view, manage and organize their personal notes.

The project demonstrates how a frontend application communicates with a REST API and how a scalable backend system can be designed to support up to one million registered users.

The frontend is built using HTML5, CSS3 and JavaScript. It connects to the JSONPlaceholder practice API to demonstrate GET, POST and DELETE operations.

The project also includes technical documentation describing the proposed production API, relational database and system architecture.

## 2. Project Objectives

The main objectives are to:

- Build a professional and responsive note-taking interface.
- Understand how frontend applications communicate with APIs.
- Implement GET, POST and DELETE HTTP requests.
- Apply asynchronous JavaScript using async and await.
- Handle loading, success, error and empty states.
- Validate user input before submitting requests.
- Design a RESTful API for a real-world application.
- Develop a relational database model using PostgreSQL.
- Plan a scalable architecture capable of supporting one million users.

## 3. Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Application styling and layout |
| JavaScript | Application functionality |
| Fetch API | Communication with the server |
| JSONPlaceholder | Practice REST API |
| PostgreSQL | Proposed production database |
| Redis | Proposed caching system |
| Git | Version control |
| GitHub | Source code hosting |

## 4. Project Structure

```text
quicknotes-system-design/
│
├── index.html
├── style.css
├── api.js
├── README.md
│
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## 5. How to Run the Application

### Requirements

- A computer with a modern web browser.
- Visual Studio Code or another code editor.
- An active internet connection.
- The Live Server extension for Visual Studio Code.

### Running the Application

1. Clone or download this repository from GitHub.
2. Open the project folder in Visual Studio Code.
3. Locate index.html.
4. Right-click index.html.
5. Select Open with Live Server.
6. The application will open in your default browser.

The application uses JSONPlaceholder as its demonstration API:

https://jsonplaceholder.typicode.com/posts

An internet connection is required for API requests.

## 6. Application Features

### Load Notes (GET)

Users can retrieve ten sample notes from the JSONPlaceholder API.

The application displays the note titles and descriptions and provides a loading message while the request is processing.

### Create Notes (POST)

Users can create notes by providing a title and optional body.

The application validates the title before submitting the request and displays the returned HTTP status and note ID.

### Delete Notes (DELETE)

Users can delete notes through the application's Delete button.

The application sends a DELETE request to the API and removes the note from the current browser session after a successful response.

### Search Notes

Users can search the currently loaded notes using keywords in the title or body.

### Error and Status Handling

The application provides loading, success, error and empty states to communicate the outcome of operations.

## 7. API Demonstration Limitations

JSONPlaceholder is a practice API and does not permanently store newly created or deleted records.

Therefore, POST and DELETE operations demonstrate the HTTP request and response process rather than permanent database changes.

The application updates its local browser state to reflect successful demonstration requests.

A production version would connect to a dedicated backend service and persistent database.

## 8. System Design Documentation

The following documents describe the proposed production system.

### API Design

Describes the REST endpoints, HTTP methods, request and response examples, authentication and error handling.

[Read API Design](docs/api-design.md)

### Data Model

Describes the Users, Notes, Tags and Note_Tags entities, their relationships, SQL statements, queries and indexes.

[Read Data Model](docs/data-model.md)

### System Architecture

Describes the functional and non-functional requirements, one-million-user load estimates, architecture diagram, request flows, scalability strategies and trade-offs.

[Read System Architecture](docs/architecture.md)

## 9. What I Learned

Through this project, I learned how to:

1. Connect a frontend application to an external REST API using JavaScript Fetch.
2. Use asynchronous functions, async and await to handle API requests.
3. Implement GET, POST and DELETE operations.
4. Handle API errors and display appropriate status messages.
5. Validate user input before sending data to a server.
6. Use textContent to display user-provided information safely.
7. Design REST API endpoints and understand HTTP status codes.
8. Design relational databases using primary keys and foreign keys.
9. Write SQL queries involving SELECT, JOIN, INSERT and DELETE operations.
10. Understand system scalability through caching, load balancing and database replication.
11. Use Git and GitHub to manage source code and project history.

## 10. Future Improvements

Future versions of QuickNotes could include:

- User registration and secure login.
- Permanent database storage.
- Note editing functionality.
- Note categorization and tagging.
- Advanced search and filtering.
- Cloud synchronization.
- Mobile application support.
- Automated testing and monitoring.

## 11. Author

**QuickNotes System Design Project**

Developed as part of the Web Foundations course.

## 12. Conclusion

QuickNotes demonstrates the relationship between frontend development, REST API communication, database design and scalable system architecture.

The project combines a working API client with technical documentation that provides a foundation for developing a production-ready online note-taking application.
