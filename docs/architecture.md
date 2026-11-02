
# QuickNotes System Architecture Document

## 1. Introduction

QuickNotes is an online note-taking application designed to allow users to create, retrieve, update, organize and delete personal notes.

The initial application uses a browser-based frontend connected to the JSONPlaceholder practice API. The proposed production system will use a dedicated backend service and a relational database.

The purpose of this document is to describe the system requirements, expected workload, proposed architecture, request flows, scalability strategies and technical trade-offs.

The proposed architecture is designed to support approximately one million registered users.

## 2. Functional Requirements

The system must provide the following functions:

1. User registration: New users must be able to create accounts.
2. User authentication: Registered users must be able to log in securely.
3. Create notes: Users must be able to create notes with a title and body.
4. View notes: Users must be able to retrieve their saved notes.
5. Update notes: Users must be able to modify existing notes.
6. Delete notes: Users must be able to delete their notes.
7. Organize notes: Users must be able to assign tags to notes.
8. Search notes: Users must be able to search their notes.
9. Data privacy: Users must only access their own notes.
10. Synchronization: Changes must be available across a user's supported devices.

## 3. Non-Functional Requirements

The system must satisfy the following quality requirements:

1. Scalability: The architecture must support increasing numbers of users and requests.
2. Availability: The application should remain accessible during individual server failures.
3. Performance: Common requests should return quickly under normal operating conditions.
4. Security: User accounts and private notes must be protected through authentication, authorization and encryption.
5. Reliability: The system must protect user data against accidental loss.
6. Maintainability: The application should use clearly separated components that can be maintained independently.
7. Consistency: Database transactions must preserve the accuracy of stored information.
8. Recoverability: Backups and recovery procedures must support restoration after failures.

## 4. Load Estimates for One Million Users

The following estimates use clearly defined assumptions to approximate the expected workload.

### 4.1 Assumptions

- Registered users: 1,000,000.
- Daily active users: 10% of registered users.
- Each active user creates one note per day.
- Each active user performs 20 note-reading requests per day.
- Average stored note size: 2 KB, including its text and basic metadata.
- Each day contains 86,400 seconds.
- Peak traffic is estimated at five times the average traffic.
- Notes are retained for at least one year.
- Storage calculations exclude database indexes, backups and replication overhead.

### 4.2 Daily Active Users

Daily active users are calculated as:

DAU = Registered Users × Daily Activity Percentage

DAU = 1,000,000 × 10%

DAU = 100,000 users

Therefore, approximately 100,000 users are expected to use QuickNotes each day.

### 4.3 Read Requests per Second

Each active user performs 20 reading requests per day.

Total daily reads:

100,000 × 20 = 2,000,000 reads per day

Average reads per second:

2,000,000 ÷ 86,400 = 23.15 reads per second

Peak reads per second:

23.15 × 5 = 115.74 reads per second

Approximately:

- Average: 23 reads per second.
- Peak: 116 reads per second.

### 4.4 Write Requests per Second

Each active user creates one note per day.

Total daily writes:

100,000 × 1 = 100,000 writes per day

Average writes per second:

100,000 ÷ 86,400 = 1.16 writes per second

Peak writes per second:

1.16 × 5 = 5.79 writes per second

Approximately:

- Average: 1.16 writes per second.
- Peak: 5.79 writes per second.

These figures represent note creation requests. Updates, deletions and tag changes would add further write traffic.

### 4.5 Storage per Year

Average note size:

2 KB

Daily storage:

100,000 × 2 KB = 200,000 KB

Daily storage = 200 MB

Annual storage:

200 MB × 365 = 73,000 MB

Annual storage = approximately 73 GB.

Therefore, QuickNotes is expected to generate approximately 73 GB of new note data per year under these assumptions.

This estimate excludes backups, database indexes, logs, replicas and additional storage overhead.

### 4.6 Summary of Load Estimates

| Measurement | Average | Peak (5×) |
|---|---:|---:|
| Read requests/second | 23.15 | 115.74 |
| Write requests/second | 1.16 | 5.79 |

| Storage Measurement | Estimate |
|---|---:|
| Daily active users | 100,000 |
| Notes created daily | 100,000 |
| Average note size | 2 KB |
| Daily storage growth | 200 MB |
| Annual storage growth | 73 GB |

### 4.7 Interpretation

QuickNotes is expected to be a read-heavy system because users retrieve and view their existing notes more frequently than they create new notes.

There are approximately 20 reading requests for every one note creation request.

This means the architecture should prioritize fast data retrieval.

Caching frequently accessed information, distributing requests across multiple application servers and using a database read replica will help reduce the workload on the primary database.

The primary database will handle writes, while the read replica can handle suitable read requests.

## 5. Proposed System Architecture

The system will use a distributed architecture containing multiple application servers, a load balancer, caching, database replication and a background processing queue.

### 5.1 Architecture Diagram

```text
                 +----------------------+
                 |       CLIENT         |
                 |   Web / Mobile App   |
                 +----------------------+
                            |
                            v
                 +----------------------+
                 |         DNS          |
                 | Domain Resolution    |
                 +----------------------+
                            |
                            v
                 +----------------------+
                 |         CDN          |
                 | Static File Delivery|
                 +----------------------+
                            |
                            v
                 +----------------------+
                 |    LOAD BALANCER     |
                 | Request Distribution |
                 +----------------------+
                       /          \
                      v            v
              +-------------+  +-------------+
              | APP SERVER 1|  | APP SERVER 2|
              | Backend API |  | Backend API |
              +-------------+  +-------------+
                      \            /
                       \          /
                        v        v
                    +----------------+
                    |     CACHE      |
                    |  Redis Cache   |
                    +----------------+
                            |
                            v
                 +----------------------+
                 |   PRIMARY DATABASE   |
                 |      PostgreSQL     |
                 |    Read / Write     |
                 +----------------------+
                            |
                            | Replication
                            v
                 +----------------------+
                 |    READ REPLICA      |
                 |     PostgreSQL      |
                 |    Read Requests    |
                 +----------------------+

          APP SERVERS
               |
               | Background Jobs
               v
       +--------------------+
       |       QUEUE        |
       |   Message Broker   |
       +--------------------+
               |
               v
       +--------------------+
       |       WORKER       |
       | Background Tasks   |
       +--------------------+
```

### 5.2 Component Explanations

**1. Client**

The client is the web or mobile application through which users interact with QuickNotes and send requests to the backend.

**2. DNS (Domain Name System)**

DNS translates the QuickNotes domain name into the IP address of the appropriate service, allowing users to access the application.

**3. CDN (Content Delivery Network)**

The CDN distributes static resources such as CSS, JavaScript, fonts and images from geographically distributed locations, reducing loading times and pressure on the main servers.

Private note data should not be publicly cached by the CDN.

**4. Load Balancer**

The load balancer distributes incoming application requests across multiple application servers to prevent one server from becoming overloaded.

**5. Application Servers**

The application servers process API requests, validate user input, authenticate users and communicate with the database and other services.

Running at least two application servers provides capacity and allows the service to continue operating if one server fails.

**6. Cache (Redis)**

Redis stores frequently accessed information temporarily in memory, reducing repeated database queries and improving response times.

**7. Primary Database**

The PostgreSQL primary database stores permanent application information, including users, notes and tags, and handles database write operations.

**8. Read Replica**

The read replica maintains a copy of the primary database and handles suitable read queries, reducing the reading workload on the primary database.

**9. Queue**

The queue stores background tasks that do not need to be completed during the original user request, allowing the application servers to respond quickly.

**10. Worker**

The worker processes background jobs retrieved from the queue, such as sending notifications, indexing notes for search and performing other asynchronous tasks.

## 6. Request Flows

### 6.1 GET /notes: Retrieving Notes

When a user requests their notes, the following process takes place:

1. The user opens the QuickNotes application and requests their notes.
2. DNS resolves the application domain.
3. The request passes through the CDN, which serves eligible static resources while private API requests continue to the backend.
4. The load balancer forwards the API request to a healthy application server.
5. The application server verifies the user's authentication token and permissions.
6. The server checks Redis to determine whether the requested notes are available in the cache.
7. If the data is available, Redis returns the cached notes.
8. If the data is not available, the application server retrieves the notes from the database read replica.
9. The retrieved data is placed in the cache for future requests.
10. The application server returns the notes to the client as a JSON response.

If the read replica is unavailable, the application can temporarily retrieve the data from the primary database.

### 6.2 POST /notes: Creating a Note

When a user creates a new note, the following process takes place:

1. The user enters a note title and body in the QuickNotes application.
2. The frontend validates the title and sends a POST /notes request containing JSON data.
3. DNS resolves the application domain.
4. The request passes through the CDN to the backend service.
5. The load balancer forwards the request to a healthy application server.
6. The application server verifies the user's authentication token.
7. The server validates the submitted note title and body.
8. The application server sends an INSERT operation to the primary PostgreSQL database.
9. The primary database stores the new note and returns the generated note ID.
10. The application server invalidates or updates the relevant cached note collection.
11. The server places any required background tasks, such as search indexing or notification delivery, into the queue.
12. The worker processes those background tasks independently.
13. The application server returns a 201 Created response containing the newly created note.
14. The frontend displays the new note to the user.

The write is acknowledged by the primary database before the successful creation response is returned.

## 7. Scalability Strategies

QuickNotes will use several strategies to support increasing user traffic.

### 7.1 Horizontal Scaling

Additional application servers can be introduced behind the load balancer as the number of users and requests increases.

This allows the application to handle more requests without depending on one powerful server.

### 7.2 Caching

Redis will store frequently requested information, reducing repeated database access and improving response times.

### 7.3 Database Replication

A read replica will handle suitable read operations while the primary database processes writes.

### 7.4 Background Processing

A queue and worker will handle tasks that do not require immediate completion, preventing lengthy background operations from slowing down user requests.

### 7.5 Database Indexing

Indexes on frequently queried fields, such as user_id and created_at, will improve database retrieval performance.

### 7.6 Connection Pooling

Database connection pooling will allow application servers to reuse database connections instead of creating a new connection for every request.

## 8. System Trade-offs

### Trade-off 1: SQL vs NoSQL

QuickNotes uses PostgreSQL because its data contains structured relationships between users, notes and tags.

The advantage is strong relational integrity, support for transactions and powerful SQL queries.

The disadvantage is that relational database scaling and schema changes require careful planning as the system grows.

**Decision:** PostgreSQL is preferred because the application depends on structured relationships and reliable data consistency.

### Trade-off 2: Caching vs Data Consistency

Caching improves performance by reducing database queries.

However, cached information can become outdated when users create, update or delete notes.

**Decision:** QuickNotes will invalidate or update affected cache entries after successful database writes. Cache expiration will also be used as an additional safeguard.

### Trade-off 3: Read Replicas vs Immediate Consistency

Read replicas improve read performance by distributing database queries.

However, replication can introduce a delay between a successful write on the primary database and the appearance of that change on the replica.

**Decision:** The primary database will handle writes, and users will receive the newly created or updated data directly from the write response. Critical follow-up reads can temporarily use the primary database.

### Trade-off 4: Synchronous vs Asynchronous Processing

Synchronous processing completes work during the user's request, while asynchronous processing places longer tasks into a queue.

Asynchronous processing improves responsiveness but introduces additional infrastructure and complexity.

**Decision:** Critical note creation will remain synchronous, while notifications and search indexing will be handled asynchronously.

## 9. Avoiding Single Points of Failure

A single point of failure is a component whose failure can bring down the entire application.

QuickNotes will reduce this risk through the following measures:

1. Multiple application servers: At least two application servers will operate behind the load balancer so that one server can continue handling requests if another fails.
2. Load balancer health checks: Unhealthy application servers will be removed from request distribution until they recover.
3. Database failover: A monitored read replica with an automated or controlled promotion procedure will provide a recovery path if the primary database fails.
4. Queue reliability: The message broker will use durable messages and replicated storage so that queued jobs are not easily lost.
5. Cache fallback: If Redis becomes unavailable, the application will retrieve required information directly from the database.
6. DNS reliability: Managed DNS with redundant infrastructure will reduce the risk of domain resolution failures.
7. Backups: Regular database backups and tested restoration procedures will protect against data loss.
8. Multiple availability zones: Critical application and infrastructure components should be distributed across separate availability zones where supported.

The read replica alone does not automatically guarantee failover. A monitoring and promotion mechanism is required to make it a reliable recovery solution.

## 10. Security Considerations

QuickNotes will implement the following security measures:

- HTTPS encryption for communication between clients and servers.
- Secure password hashing.
- Authentication using access tokens.
- Authorization checks to prevent users from accessing other users' notes.
- Input validation and parameterized SQL queries.
- Rate limiting to reduce abuse.
- Regular database backups.
- Secure storage of application secrets and database credentials.

## 11. Conclusion

The proposed QuickNotes architecture provides a foundation for building an online note-taking service capable of supporting approximately one million registered users.

The architecture uses a CDN, load balancer, multiple application servers, Redis caching, PostgreSQL database replication and background processing.

The workload estimates show that the application is read-heavy, making caching and read replicas important performance strategies.

Horizontal scaling, database backups, health checks and redundancy will help improve availability and reliability as the application grows.

The proposed design provides a scalable, maintainable and secure foundation for future development.
