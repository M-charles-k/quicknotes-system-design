
/* =========================================
   QUICKNOTES - API CLIENT
   API: JSONPlaceholder
   ========================================= */

// API configuration
const API_URL = "https://jsonplaceholder.typicode.com/posts";

// Application state
let allNotes = [];
let activeRequests = 0;


// DOM ELEMENTS
const loadBtn = document.getElementById("load-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");
const statusMessage = document.getElementById("status");
const searchInput = document.getElementById("search-input");
const notesCount = document.getElementById("notes-count");
const apiStatus = document.getElementById("api-status");
const resultsLabel = document.getElementById("results-label");


// =========================================
// 1. REUSABLE API REQUEST FUNCTION
// =========================================

async function request(url, options = {}) {

    const response = await fetch(url, options);

    // Check whether the server returned a successful response.
    if (!response.ok) {
        const error = new Error(`Request failed: ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const data = response.status === 204
        ? null
        : await response.json();

    return {
        data,
        status: response.status
    };
}


// =========================================
// 2. STATUS MESSAGE HANDLER
// =========================================

function setStatus(message, type = "") {

    statusMessage.textContent = message;

    statusMessage.className = "status-message";

    if (type) {
        statusMessage.classList.add(type);
    }
}


// =========================================
// 3. BUTTON STATE MANAGEMENT
// =========================================

function updateButtonStates() {

    const busy = activeRequests > 0;

    loadBtn.disabled = busy;
    submitBtn.disabled = busy;

    const deleteButtons = document.querySelectorAll(".delete-btn");

    deleteButtons.forEach(button => {
        button.disabled = busy;
    });
}

function beginRequest() {

    activeRequests++;
    updateButtonStates();
}

function endRequest() {

    activeRequests = Math.max(0, activeRequests - 1);
    updateButtonStates();
}


// =========================================
// 4. UPDATE STATISTICS
// =========================================

function updateStatistics() {

    notesCount.textContent = allNotes.length;

    const visibleNotes = getFilteredNotes();

    resultsLabel.textContent =
        `${visibleNotes.length} ${visibleNotes.length === 1 ? "note" : "notes"}`;
}


// =========================================
// 5. SEARCH AND FILTER NOTES
// =========================================

function getFilteredNotes() {

    const searchTerm = searchInput.value.trim().toLowerCase();

    return allNotes.filter(note => {

        const title = String(note.title || "").toLowerCase();
        const body = String(note.body || "").toLowerCase();

        return title.includes(searchTerm) || body.includes(searchTerm);
    });
}


// =========================================
// 6. CREATE A NOTE CARD SAFELY
// =========================================

function createNoteCard(note) {

    const card = document.createElement("li");
    card.className = "note-card";

    const top = document.createElement("div");
    top.className = "note-top";

    const label = document.createElement("span");
    label.className = "note-label";
    label.textContent = "QUICK NOTE";

    const noteId = document.createElement("span");
    noteId.className = "note-id";
    noteId.textContent = `#${note.id}`;

    top.append(label, noteId);


    const title = document.createElement("h3");
    title.className = "note-title";
    title.textContent = note.title || "Untitled note";


    const body = document.createElement("p");
    body.className = "note-body";
    body.textContent = note.body || "No additional details provided.";


    const bottom = document.createElement("div");
    bottom.className = "note-bottom";

    const noteInfo = document.createElement("small");
    noteInfo.textContent = `Note ID: ${note.id}`;


    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", () => {
        deleteNote(note.id);
    });


    bottom.append(noteInfo, deleteBtn);

    card.append(top, title, body, bottom);

    return card;
}


// =========================================
// 7. DISPLAY NOTES
// =========================================

function renderNotes() {

    notesList.replaceChildren();

    const visibleNotes = getFilteredNotes();

    if (visibleNotes.length === 0) {

        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-state";

        emptyMessage.textContent = allNotes.length === 0
            ? "No notes yet. Select Load notes to get started."
            : "No notes match your search. Try another keyword.";

        notesList.appendChild(emptyMessage);

    } else {

        visibleNotes.forEach(note => {

            const noteCard = createNoteCard(note);
            notesList.appendChild(noteCard);

        });
    }

    updateStatistics();
    updateButtonStates();
}


// =========================================
// 8. GET - LOAD NOTES
// =========================================

async function loadNotes() {

    beginRequest();

    setStatus("Loading notes...", "loading");

    try {

        const result = await request(`${API_URL}?_limit=10`);

        allNotes = result.data;

        renderNotes();

        apiStatus.textContent = "Connected";

        setStatus(
            `Loaded ${allNotes.length} notes from the server.`,
            "success"
        );

    } catch (error) {

        console.error("Loading notes failed:", error);

        apiStatus.textContent = "Offline";

        setStatus(
            error.status
                ? `Unable to load notes (HTTP ${error.status}). Please try again.`
                : "Unable to connect to the server. Check your internet connection and try again.",
            "error"
        );

    } finally {

        endRequest();

    }
}


// =========================================
// 9. POST - CREATE A NOTE
// =========================================

async function createNote(event) {

    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validate the title.
    if (!title) {

        setStatus("Please enter a note title.", "error");

        titleInput.focus();
        return;
    }

    if (title.length > 100) {

        setStatus(
            "The title cannot exceed 100 characters.",
            "error"
        );

        titleInput.focus();
        return;
    }

    beginRequest();

    setStatus("Creating your note...", "loading");

    try {

        const result = await request(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1
            })

        });

        const newNote = result.data;

        // JSONPlaceholder simulates creation and returns a new ID.
        // We add the returned note to local application state because
        // JSONPlaceholder does not permanently save created notes.

        allNotes.unshift(newNote);

        noteForm.reset();

        renderNotes();

        setStatus(
            `Note created (status ${result.status}, id ${newNote.id}).`,
            "success"
        );

    } catch (error) {

        console.error("Creating note failed:", error);

        setStatus(
            error.status
                ? `Unable to create note (HTTP ${error.status}).`
                : "Could not create your note. Please check your connection.",
            "error"
        );

    } finally {

        endRequest();

    }
}


// =========================================
// 10. DELETE - REMOVE A NOTE
// =========================================

async function deleteNote(id) {

    beginRequest();

    setStatus("Deleting note...", "loading");

    try {

        const result = await request(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        // JSONPlaceholder simulates deletion but does not permanently
        // change its database. We remove the note from the local
        // application state to reflect the successful demo request.

        allNotes = allNotes.filter(note => note.id !== id);

        renderNotes();

        setStatus(
            `Note ${id} deleted successfully (status ${result.status}).`,
            "success"
        );

    } catch (error) {

        console.error("Deleting note failed:", error);

        setStatus(
            error.status
                ? `Unable to delete note (HTTP ${error.status}).`
                : "Could not delete the note. Please try again.",
            "error"
        );

    } finally {

        endRequest();

    }
}


// =========================================
// 11. EVENT LISTENERS
// =========================================

// Load notes
loadBtn.addEventListener("click", loadNotes);

// Create a note
noteForm.addEventListener("submit", createNote);

// Search notes
searchInput.addEventListener("input", renderNotes);


// =========================================
// 12. INITIAL APPLICATION STATE
// =========================================

renderNotes();

setStatus(
    "Welcome! Select Load notes to get started."
);
