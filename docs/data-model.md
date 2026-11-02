
# QuickNotes Database Data Model

## 1. Introduction

QuickNotes is an online note-taking application that allows users to create, manage and organize personal notes.

The database must store user accounts, notes, tags and the relationships between notes and tags.

This document describes the proposed relational database structure, including entities, attributes, primary keys, foreign keys, SQL statements, example queries and indexing strategies.

The proposed database management system is PostgreSQL.

## 2. Database Entities

The QuickNotes database contains four main entities:

1. Users
2. Notes
3. Tags
4. Note_Tags

### 2.1 Users Entity

The Users table stores information about registered QuickNotes users.

| Column | Data Type | Key | Description |
|---|---|---|---|
| id | BIGINT | Primary Key | Unique user identifier |
| name | VARCHAR(100) | | User's full name |
| email | VARCHAR(255) | UNIQUE | User's email address |
| password_hash | VARCHAR(255) | | Securely hashed password |
| created_at | TIMESTAMPTZ | | Account creation date |
| updated_at | TIMESTAMPTZ | | Last account update |

Each user has a unique ID and email address.

### 2.2 Notes Entity

The Notes table stores the notes created by users.

| Column | Data Type | Key | Description |
|---|---|---|---|
| id | BIGINT | Primary Key | Unique note identifier |
| user_id | BIGINT | Foreign Key | References the user who owns the note |
| title | VARCHAR(100) | | Note title |
| body | TEXT | | Main note content |
| created_at | TIMESTAMPTZ | | Note creation date |
| updated_at | TIMESTAMPTZ | | Last note update |

The user_id column references the id column in the Users table.

### 2.3 Tags Entity

The Tags table stores categories that users can assign to their notes.

| Column | Data Type | Key | Description |
|---|---|---|---|
| id | BIGINT | Primary Key | Unique tag identifier |
| user_id | BIGINT | Foreign Key | References the user who owns the tag |
| name | VARCHAR(50) | | Tag name |
| created_at | TIMESTAMPTZ | | Tag creation date |

A user can create tags such as Education, Personal, Work and Projects.

The combination of user_id and name must be unique so that one user cannot create duplicate tags with the same name.

### 2.4 Note_Tags Entity

The Note_Tags table connects notes with tags.

| Column | Data Type | Key | Description |
|---|---|---|---|
| note_id | BIGINT | Primary Key and Foreign Key | References a note |
| tag_id | BIGINT | Primary Key and Foreign Key | References a tag |
| created_at | TIMESTAMPTZ | | Date the tag was assigned |

The combination of note_id and tag_id forms a composite primary key.

This prevents the same tag from being assigned to the same note more than once.

---

## 3. Database Relationships

The QuickNotes database uses one-to-many and many-to-many relationships.

### 3.1 One-to-Many Relationship: Users and Notes

One user can create many notes, but each note belongs to only one user.

For example, a user named John can create notes about school, work and personal activities.

The relationship is:

USERS (1) -------- (M) NOTES

The user_id foreign key in the Notes table connects each note to its owner.

### 3.2 One-to-Many Relationship: Users and Tags

One user can create many tags, but each tag belongs to one user.

The relationship is:

USERS (1) -------- (M) TAGS

The user_id foreign key in the Tags table identifies the owner of each tag.

### 3.3 Many-to-Many Relationship: Notes and Tags

One note can have multiple tags, and one tag can be assigned to multiple notes.

For example, a note about studying HTML could have the tags Education and Programming.

The relationship is:

NOTES (1) -------- (M) NOTE_TAGS (M) -------- (1) TAGS

The Note_Tags table resolves the many-to-many relationship by storing the IDs of the connected notes and tags.

---

## 4. Database Architecture Diagram

```text
             +------------------+
             |      USERS       |
             +------------------+
             | PK id            |
             | name             |
             | email            |
             | password_hash    |
             | created_at       |
             | updated_at       |
             +------------------+
                |            |
              1 |            | 1
                |            |
              M |            | M
       +----------------+  +----------------+
       |     NOTES      |  |      TAGS      |
       +----------------+  +----------------+
       | PK id          |  | PK id          |
       | FK user_id     |  | FK user_id     |
       | title          |  | name           |
       | body           |  | created_at     |
       | created_at     |  +----------------+
       | updated_at     |          |
       +----------------+          |
                |                  |
              1 |                  | 1
                |                  |
              M |                  | M
                +------------------+
                         |
                  +----------------+
                  |   NOTE_TAGS    |
                  +----------------+
                  | PK, FK note_id |
                  | PK, FK tag_id  |
                  | created_at     |
                  +----------------+
```

---

## 5. SQL CREATE TABLE Statements

The following SQL statements create the four QuickNotes database tables using PostgreSQL.

### 5.1 Create Users Table

```sql
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

This table stores user account details. The email column is unique to prevent multiple accounts from using the same email address.

### 5.2 Create Notes Table

```sql
CREATE TABLE notes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

This table stores note information. The foreign key ensures that every note belongs to an existing user.

### 5.3 Create Tags Table

```sql
CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tags_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_tag
        UNIQUE (user_id, name)
);
```

This table stores tags created by users. Each user can create multiple tags but cannot create duplicate tag names within their account.

### 5.4 Create Note_Tags Table

```sql
CREATE TABLE note_tags (
    note_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (note_id, tag_id),

    CONSTRAINT fk_note_tags_note
        FOREIGN KEY (note_id)
        REFERENCES notes(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_note_tags_tag
        FOREIGN KEY (tag_id)
        REFERENCES tags(id)
        ON DELETE CASCADE
);
```

This table connects notes with tags. The composite primary key prevents duplicate note and tag combinations.

The backend must also verify that a note and its assigned tag belong to the same user.

---

## 6. Example SQL Queries

The following queries demonstrate how the QuickNotes database can retrieve, organize and manage information.

### Query 1: Retrieve All Notes Belonging to a User

```sql
SELECT
    id,
    title,
    body,
    created_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC;
```

**Explanation:**

This query retrieves all notes belonging to the user whose ID is 1.

The ORDER BY clause displays the most recently created notes first.

### Query 2: Retrieve a Specific Note

```sql
SELECT
    id,
    title,
    body,
    created_at,
    updated_at
FROM notes
WHERE id = 101
AND user_id = 1;
```

**Explanation:**

This query retrieves a particular note belonging to a specified user.

Including the user ID helps prevent users from accessing notes belonging to other accounts.

### Query 3: Retrieve Notes with Their Tags Using JOIN

```sql
SELECT
    notes.id AS note_id,
    notes.title,
    notes.body,
    tags.name AS tag_name
FROM notes
JOIN note_tags
    ON notes.id = note_tags.note_id
JOIN tags
    ON note_tags.tag_id = tags.id
WHERE notes.user_id = 1
ORDER BY notes.id;
```

**Explanation:**

This query uses JOIN operations to combine information from the Notes, Note_Tags and Tags tables.

It retrieves notes together with their assigned tags.

### Query 4: Count the Total Notes for Each User

```sql
SELECT
    users.id,
    users.name,
    COUNT(notes.id) AS total_notes
FROM users
LEFT JOIN notes
    ON users.id = notes.user_id
GROUP BY users.id, users.name
ORDER BY total_notes DESC;
```

**Explanation:**

This query counts the number of notes created by each user.

The LEFT JOIN ensures that users who have not created any notes are also included.

### Query 5: Delete a Specific Note

```sql
DELETE FROM notes
WHERE id = 101
AND user_id = 1;
```

**Explanation:**

This query deletes a specific note belonging to a particular user.

The user ID condition helps ensure that users cannot delete notes belonging to other accounts.

---

## 7. Database Indexing

An index improves database performance by allowing the database to locate records without scanning every row.

QuickNotes will use indexes on frequently searched columns.

### Recommended Indexes

**Index 1: Notes User ID**

```sql
CREATE INDEX idx_notes_user_id
ON notes(user_id);
```

**Reason:**

QuickNotes users frequently retrieve their own notes. This index helps the database find notes belonging to a particular user more efficiently.

**Index 2: Notes Creation Date**

```sql
CREATE INDEX idx_notes_created_at
ON notes(created_at DESC);
```

**Reason:**

This index supports queries that display the newest notes first.

**Index 3: Note Tags Tag ID**

```sql
CREATE INDEX idx_note_tags_tag_id
ON note_tags(tag_id);
```

**Reason:**

The primary key on note_tags already indexes note_id followed by tag_id. An additional index on tag_id helps retrieve all notes associated with a particular tag efficiently.

Indexes improve reading performance, but they require additional storage and can increase the cost of inserting, updating and deleting records.

---

## 8. Choice of SQL or NoSQL Database

QuickNotes will use a relational SQL database, specifically PostgreSQL.

This choice is appropriate because the application contains structured information and clearly defined relationships between users, notes and tags.

PostgreSQL supports primary keys, foreign keys, constraints and transactions, which help maintain data accuracy and consistency.

It also supports JOIN operations that make it easier to retrieve notes together with their tags.

Although NoSQL databases can provide flexible document storage and horizontal scaling, PostgreSQL is a suitable choice for QuickNotes because its data structure is relational and its relationships need to be maintained reliably.

As the application grows to support one million users, PostgreSQL can be scaled using indexing, caching, database read replicas, connection pooling and suitable database infrastructure.

---

## 9. Conclusion

The QuickNotes database design provides a structured approach to storing and managing application information.

The four entities, Users, Notes, Tags and Note_Tags, support user accounts, personal notes and note categorization.

Primary keys and foreign keys maintain relationships between records, while SQL queries support common operations such as retrieving notes, counting records and connecting notes with tags.

PostgreSQL provides the relational features, data consistency and querying capabilities required to support the QuickNotes application as it grows.
