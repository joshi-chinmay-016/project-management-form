// Configuration is loaded from config.js (JPDB_CONFIG)

// Helper to send HTTP requests to JsonPowerDB
async function executeJPDBCommand(payload, endpoint) {
    const url = `${JPDB_CONFIG.baseUrl}${endpoint}`;
    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload)
    });
    return await response.json();
}

// DOM Elements
const projectIdInput = document.getElementById("projectId");
const projectNameInput = document.getElementById("projectName");
const assignedToInput = document.getElementById("assignedTo");
const assignmentDateInput = document.getElementById("assignmentDate");
const deadlineInput = document.getElementById("deadline");

const saveBtn = document.getElementById("saveBtn");
const updateBtn = document.getElementById("updateBtn");
const resetBtn = document.getElementById("resetBtn");
const messageEl = document.getElementById("message");
const projectForm = document.getElementById("projectForm");

// Show status message under form
function showMessage(text, color = "black") {
    messageEl.textContent = text;
    messageEl.style.color = color;
}

/**
 * Step-2 Requirement:
 * "On page load or any control button click, an empty form will be displayed
 * and the cursor will remain at the first input field in the form which will
 * have the primary key in the relation. All other fields and buttons should
 * be disabled at this time."
 */
function initForm() {
    // 1. Reset all form input values
    projectForm.reset();
    localStorage.removeItem("rec_no");

    // 2. Enable only the primary key field (Project ID)
    projectIdInput.disabled = false;

    // 3. Disable all other input fields
    projectNameInput.disabled = true;
    assignedToInput.disabled = true;
    assignmentDateInput.disabled = true;
    deadlineInput.disabled = true;

    // 4. Disable all control buttons
    saveBtn.disabled = true;
    updateBtn.disabled = true;
    resetBtn.disabled = true;

    // 5. Keep cursor at the primary key input field
    projectIdInput.focus();
}

/**
 * Validation:
 * "Check that the data should be valid i.e. no empty fields."
 */
function validateFormData() {
    const pId = projectIdInput.value.trim();
    const pName = projectNameInput.value.trim();
    const assigned = assignedToInput.value.trim();
    const aDate = assignmentDateInput.value;
    const dLine = deadlineInput.value;

    if (!pId) {
        alert("Project ID is required.");
        showMessage("Project ID is required.", "red");
        projectIdInput.focus();
        return null;
    }
    if (!pName) {
        alert("Project Name is required.");
        showMessage("Project Name is required.", "red");
        projectNameInput.focus();
        return null;
    }
    if (!assigned) {
        alert("Assigned To is required.");
        showMessage("Assigned To is required.", "red");
        assignedToInput.focus();
        return null;
    }
    if (!aDate) {
        alert("Assignment Date is required.");
        showMessage("Assignment Date is required.", "red");
        assignmentDateInput.focus();
        return null;
    }
    if (!dLine) {
        alert("Deadline is required.");
        showMessage("Deadline is required.", "red");
        deadlineInput.focus();
        return null;
    }
    if (new Date(dLine) < new Date(aDate)) {
        alert("Deadline cannot be earlier than Assignment Date.");
        showMessage("Deadline cannot be earlier than Assignment Date.", "red");
        deadlineInput.focus();
        return null;
    }

    return {
        projectId: pId,
        projectName: pName,
        assignedTo: assigned,
        assignmentDate: aDate,
        deadline: dLine
    };
}

/**
 * Primary Key Verification:
 * User enters data in Project ID.
 * - If NOT present: enable [Save] and [Reset], move cursor to next field.
 * - If PRESENT: display data, enable [Update] and [Reset], keep Project ID disabled, move cursor to next field.
 */
async function checkProjectId() {
    const pId = projectIdInput.value.trim();
    if (!pId) {
        showMessage("Please enter a Project ID.", "red");
        return;
    }

    showMessage("Checking Project ID in database...", "#2563eb");

    const getByKeyPayload = {
        token: JPDB_CONFIG.token,
        cmd: "GET_BY_KEY",
        dbName: JPDB_CONFIG.dbName,
        rel: JPDB_CONFIG.relation,
        jsonStr: {
            projectId: pId
        }
    };

    try {
        const result = await executeJPDBCommand(getByKeyPayload, "/api/irl");
        console.log("GET_BY_KEY response:", result);

        if (result.status === 400 || !result.data || (Array.isArray(result.data) && result.data.length === 0)) {
            // Primary key does NOT exist in the database
            // Enable [Save] and [Reset] buttons
            saveBtn.disabled = false;
            updateBtn.disabled = true;
            resetBtn.disabled = false;

            // Enable remaining fields
            projectNameInput.disabled = false;
            assignedToInput.disabled = false;
            assignmentDateInput.disabled = false;
            deadlineInput.disabled = false;

            // Keep primary key field disabled so ID cannot be accidentally altered while typing
            projectIdInput.disabled = true;

            // Move cursor to the next field
            projectNameInput.focus();

            showMessage("New Project ID. Complete the form and click Save.", "#2563eb");
        } else if (result.status === 200) {
            // Primary key value IS present in database: display data in the form
            let parsedData = typeof result.data === "string" ? JSON.parse(result.data) : result.data;
            const record = parsedData.record || parsedData;
            const recNo = parsedData.rec_no;

            if (recNo !== undefined) {
                localStorage.setItem("rec_no", recNo);
            }

            // Populate form fields
            projectNameInput.value = record.projectName || "";
            assignedToInput.value = record.assignedTo || "";
            assignmentDateInput.value = record.assignmentDate || "";
            deadlineInput.value = record.deadline || "";

            // Keep primary key disabled and allow users to change other form fields
            projectIdInput.disabled = true;
            projectNameInput.disabled = false;
            assignedToInput.disabled = false;
            assignmentDateInput.disabled = false;
            deadlineInput.disabled = false;

            // Enable [Update] and [Reset] buttons
            saveBtn.disabled = true;
            updateBtn.disabled = false;
            resetBtn.disabled = false;

            // Move cursor to the next field
            projectNameInput.focus();

            showMessage("Record found. Edit fields and click Update.", "#0f766e");
        } else {
            showMessage(result.message || "Failed to check Project ID.", "red");
        }
    } catch (error) {
        console.error("Error checking Project ID:", error);
        showMessage("Error communicating with JPDB. Check console.", "red");
    }
}

/**
 * [Save] button:
 * Complete the data entry form and click [Save] to store data in database and go to step-2.
 */
async function saveProject() {
    const data = validateFormData();
    if (!data) return;

    showMessage("Saving data to database...", "#2563eb");

    const putPayload = {
        token: JPDB_CONFIG.token,
        cmd: "PUT",
        dbName: JPDB_CONFIG.dbName,
        rel: JPDB_CONFIG.relation,
        jsonStr: data
    };

    try {
        const result = await executeJPDBCommand(putPayload, "/api/iml");
        console.log("PUT response:", result);

        if (result.status === 200) {
            alert("Data saved successfully in " + JPDB_CONFIG.dbName + " -> " + JPDB_CONFIG.relation);
            // Go to step-2
            initForm();
            showMessage("Data saved successfully! Enter next Project ID.", "green");
        } else {
            alert("Save failed: " + (result.message || "Error"));
            showMessage("Save failed: " + (result.message || "Error"), "red");
        }
    } catch (error) {
        console.error("Error saving data:", error);
        alert("Network error while saving data.");
        showMessage("Network error while saving data.", "red");
    }
}

/**
 * [Update] button:
 * Click on [Update] button to update the data in the database and go to step-2.
 */
async function updateProject() {
    const data = validateFormData();
    if (!data) return;

    const recNo = localStorage.getItem("rec_no");
    if (!recNo) {
        alert("Record reference missing. Please re-enter Project ID.");
        showMessage("Record reference missing. Please re-enter Project ID.", "red");
        return;
    }

    showMessage("Updating data in database...", "#0f766e");

    const updatePayload = {
        token: JPDB_CONFIG.token,
        cmd: "UPDATE",
        dbName: JPDB_CONFIG.dbName,
        rel: JPDB_CONFIG.relation,
        jsonStr: {
            [recNo]: data
        }
    };

    try {
        const result = await executeJPDBCommand(updatePayload, "/api/iml");
        console.log("UPDATE response:", result);

        if (result.status === 200) {
            alert("Data updated successfully!");
            // Go to step-2
            initForm();
            showMessage("Data updated successfully! Enter next Project ID.", "green");
        } else {
            alert("Update failed: " + (result.message || "Error"));
            showMessage("Update failed: " + (result.message || "Error"), "red");
        }
    } catch (error) {
        console.error("Error updating data:", error);
        alert("Network error while updating data.");
        showMessage("Network error while updating data.", "red");
    }
}

// Event Listeners
projectIdInput.addEventListener("change", checkProjectId);
projectIdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        checkProjectId();
    }
});

saveBtn.addEventListener("click", saveProject);
updateBtn.addEventListener("click", updateProject);

// [Reset] button: Click [Reset] to reset the form as per step-2.
resetBtn.addEventListener("click", () => {
    initForm();
    showMessage("Form reset. Enter Project ID.", "#64748b");
});

// Prevent form submission on enter
projectForm.addEventListener("submit", (e) => e.preventDefault());

// Page load: initialize as per step-2
initForm();
showMessage("Ready. Enter Project ID to start.", "#2563eb");
