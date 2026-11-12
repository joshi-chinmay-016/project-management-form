# Project Management Form using JsonPowerDB

> A lightweight, responsive web application designed for seamless project record tracking and assignment management, powered by **JsonPowerDB (JPDB)** as a serverless REST API database.

---

## 📋 Table of Contents
- [Title of the Project](#title-of-the-project)
- [Description](#description)
- [Benefits of using JsonPowerDB](#benefits-of-using-jsonpowerdb)
- [Scope of Functionalities](#scope-of-functionalities)
- [Illustrations](#illustrations)
  - [Workflow Diagram](#workflow-diagram)
  - [UI Preview](#ui-preview)
- [Examples of Use](#examples-of-use)
- [Database Configuration & Schema](#database-configuration--schema)
- [Installation & Setup](#installation--setup)
- [Release History](#release-history)
- [Project Status](#project-status)
- [Sources](#sources)
- [Other Information](#other-information)

---

## 📖 Description
The **Project Management Form** is a full-featured micro-project developed to manage and persist project records in real time. It enables users to register new projects, search for existing projects using a unique primary key (**Project-ID**), update existing project information, and reset the form to its clean initial state.

The application communicates directly with **JsonPowerDB (JPDB)** via standard HTTP/REST API calls (`fetch`), demonstrating a 100% serverless frontend architecture without requiring custom backend servers (Node.js/PHP/Java), third-party database drivers, or connection pools.

---

## 🚀 Benefits of using JsonPowerDB
**JsonPowerDB (JPDB)** is a Next-Generation, Real-Time, High-Performance, Lightweight, and Simple-to-use REST API-based Multi-mode DBMS developed by **Login2Xplore**. It is built on top of **PowerIndeX**, one of the fastest indexing engines in the world.

Key benefits of utilizing JsonPowerDB include:
1. **Serverless & 100% REST API Driven:** Eliminates the need for traditional server-side code or database drivers. Any client technology capable of sending standard HTTP requests can interact with it directly.
2. **Ultra-Fast Performance:** Powered by the proprietary **PowerIndeX** indexing engine, delivering sub-millisecond query responses.
3. **Multi-Mode Engine:** Seamlessly supports Key-Value pair storage, Document Store, and Relational (RDBMS) patterns within a unified system.
4. **Schema-Free Flexibility:** Natively stores data in JSON format, making data model evolution and agile updates frictionless.
5. **Low-Code Simplicity:** Drastically reduces project development lifecycle, boilerplate code, and infrastructure overhead.
6. **In-Built Indexing & Query Layer:** Features rich Index Manipulation Language (**IML**) and Index Retrieval Language (**IRL**) commands (e.g., `PUT`, `UPDATE`, `GET_BY_KEY`).

---

## 🎯 Scope of Functionalities
* **Primary Key Lookup (`GET_BY_KEY` via `/api/irl`):**
  * Automatically detects whether a entered `Project-ID` already exists or is new.
  * Dynamically controls the enabled/disabled state of input fields and control buttons.
* **New Project Insertion (`PUT` via `/api/iml`):**
  * When a new `Project-ID` is entered, allows input of all project attributes and persists the record into the database.
* **Existing Project Update (`UPDATE` via `/api/iml`):**
  * When an existing `Project-ID` is entered, auto-populates all saved details, keeps the primary key locked, and updates record details using its internal record index (`rec_no`).
* **Form Reset (Step-2 Reset):**
  * Clears all fields, restores buttons to disabled state, enables the primary key field, and returns cursor focus to `Project-ID`.
* **Client-Side Validation:**
  * Checks that no required fields are submitted empty.
  * Validates that the `Deadline` date cannot be set earlier than the `Assignment Date`.

---

## 🖼️ Illustrations

### Workflow Diagram

```
+--------------------------------------------------------------+
|                        Page Loaded                           |
|       (Empty form, only Project-ID enabled, cursor focused)  |
+--------------------------------------------------------------+
                               |
                               v
                     User enters Project-ID
                               |
                               v
                     Query JsonPowerDB via
                     GET_BY_KEY on /api/irl
                               |
              +----------------+----------------+
              |                                 |
              v                                 v
     [ Record Found (200) ]           [ Record Not Found (400) ]
              |                                 |
              v                                 v
  - Auto-populate fields             - Keep Project-ID disabled
  - Keep Project-ID disabled         - Enable all other fields
  - Enable other fields for edit     - Enable [Save] & [Reset]
  - Enable [Update] & [Reset]        - Disable [Update]
  - Disable [Save]                   - Focus on Project Name
  - Focus on Project Name                       |
              |                                 |
              v                                 v
       User edits fields              User fills new details
              |                                 |
              v                                 v
        Click [Update]                     Click [Save]
              |                                 |
              v                                 v
   UPDATE record in JPDB              PUT new record in JPDB
              |                                 |
              +----------------+----------------+
                               |
                               v
                     Success Alert Displayed
                               |
                               v
                   Return to Step-2 Initial State
```

### UI Preview
* **Initial State:** Clean form card, only `Project-ID` editable with cursor active.
* **New Entry State:** `Project-ID` disabled, `Project Name`, `Assigned To`, `Assignment Date`, and `Deadline` editable, `[Save]` (Blue) and `[Reset]` (Gray) active.
* **Existing Entry State:** Saved values populated into inputs, `[Update]` (Teal) and `[Reset]` (Gray) active, `[Save]` locked.

---

## 💡 Examples of Use

### Example 1: Creating a New Project Record
1. Open the form in browser.
2. Enter `PRJ-101` in the **Project ID** field and press <kbd>Enter</kbd> (or <kbd>Tab</kbd>).
3. The database confirms `PRJ-101` does not exist:
   * Status message: *"New Project ID. Complete the form and click Save."*
   * Form fields unlock and cursor moves to **Project Name**.
4. Enter the details:
   * **Project Name:** `E-Commerce Portal`
   * **Assigned To:** `Rahul Sharma`
   * **Assignment Date:** `2026-11-12`
   * **Deadline:** `2026-12-30`
5. Click **[Save]**.
6. Alert pop-up: *"Data saved successfully in COLLEGE-DB -> PROJECT-TABLE"*.
7. Form resets back to the initial state, ready for the next entry.

### Example 2: Updating an Existing Project Record
1. Enter `PRJ-101` in the **Project ID** field and press <kbd>Enter</kbd>.
2. The database locates the record:
   * Existing details are automatically fetched and populated into the fields.
   * `[Update]` and `[Reset]` buttons are enabled; `[Save]` remains disabled.
3. Change the **Deadline** to `2027-01-15`.
4. Click **[Update]**.
5. Alert pop-up: *"Data updated successfully!"*.
6. Form resets back to the initial state.

---

## 🗄️ Database Configuration & Schema

* **API Base URL:** `https://api.jsonpowerdb.com:5567`
* **Database Name:** `COLLEGE-DB`
* **Relation Name:** `PROJECT-TABLE`
* **Primary Key Column:** `projectId`

### Record Data Structure:
```json
{
  "projectId": "PRJ-101",
  "projectName": "E-Commerce Portal",
  "assignedTo": "Rahul Sharma",
  "assignmentDate": "2026-11-12",
  "deadline": "2026-12-30"
}
```

---

## 💻 Installation & Setup

1. **Clone this repository:**
   ```bash
   git clone https://github.com/your-username/project-management-form.git
   cd project-management-form
   ```

2. **Verify Configuration:**
   * Open `config.js` and verify your JPDB connection details:
     ```javascript
     const JPDB_CONFIG = {
         baseUrl: "https://api.jsonpowerdb.com:5567",
         token: "YOUR_CONNECTION_TOKEN_HERE",
         dbName: "COLLEGE-DB",
         relation: "PROJECT-TABLE"
     };
     ```

3. **Run Locally:**
   * Using **VS Code / Antigravity IDE**: Right-click `index.html` and click **"Open with Live Server"**.
   * Or using Node.js:
     ```bash
     npx live-server
     ```
   * Or using Python:
     ```bash
     python -m http.server 5500
     ```

---

## 📜 Release History

* **v1.0.0 (2026-11-12):**
  * Initial Release on GitHub.
  * Implemented responsive user interface (`index.html`, `style.css`).
  * Configured connection to JsonPowerDB (`https://api.jsonpowerdb.com:5567`).
  * Integrated `GET_BY_KEY` lookup to dynamically determine form state (`Save` vs `Update`).
  * Built `PUT` (Insert) and `UPDATE` (Modify) handlers interfacing with `/api/iml`.
  * Implemented Step-2 form reset behavior and input validation.

---

## 🚦 Project Status
* **Status:** Completed & Ready for Submission.
* All requirements defined in the **Micro Project Work** guidelines have been implemented, tested, and verified against live JsonPowerDB endpoints.

---

## 📚 Sources
* [Login2Xplore Official Portal](https://login2explore.com/)
* [JsonPowerDB Documentation & Developer Portal](https://login2explore.com/jpdb/)
* [JsonPowerDB API Reference & Dashboard](https://api.jsonpowerdb.com:5567)

---

## ℹ️ Other Information
* **Technology Stack:** HTML5, CSS3, JavaScript (ES6 Fetch API), JsonPowerDB.
* **Author:** Project Management Form Micro-Project Work.
* **License:** Licensed under the MIT License - feel free to use and adapt this project for educational and demonstration purposes.
