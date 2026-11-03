const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const assignmentRoutes = require("../routes/assignmentRoutes");

const app = express();
const PORT = 3000;

const databasePath = path.join(
  __dirname,
  "..",
  "database",
  "study_planner.db"
);

const db = new sqlite3.Database(databasePath, (error) => {
  if (error) {
    console.error("Database connection failed:", error.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    assignment TEXT NOT NULL,
    deadline TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending'
  )
`);

app.use(cors());
app.use(express.json());

app.use("/api/assignments", assignmentRoutes(db));

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
