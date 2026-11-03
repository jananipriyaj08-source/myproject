const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    const { search = "", status = "All" } = req.query;
    let sql = "SELECT * FROM assignments WHERE 1=1";
    const params = [];

    if (search) {
      sql += " AND (subject LIKE ? OR assignment LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (status !== "All") {
      sql += " AND status = ?";
      params.push(status);
    }

    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.post("/", (req, res) => {
    const { subject, assignment, deadline, status } = req.body;

    if (!subject || !assignment || !deadline || !status) {
      return res.status(400).json({ error: "All fields required" });
    }

    db.run(
      "INSERT INTO assignments (subject, assignment, deadline, status) VALUES (?, ?, ?, ?)",
      [subject, assignment, deadline, status],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
      }
    );
  });

  router.put("/:id", (req, res) => {
    db.run(
      "UPDATE assignments SET status = ? WHERE id = ?",
      [req.body.status, req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (!this.changes) return res.status(404).json({ error: "Not found" });
        res.json({ message: "Updated successfully" });
      }
    );
  });

  router.delete("/:id", (req, res) => {
    db.run(
      "DELETE FROM assignments WHERE id = ?",
      [req.params.id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (!this.changes) return res.status(404).json({ error: "Not found" });
        res.json({ message: "Deleted successfully" });
      }
    );
  });

  return router;
};