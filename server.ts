import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("objections.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS custom_scripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    objection_type TEXT NOT NULL,
    script_content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/scripts", (req, res) => {
    const scripts = db.prepare("SELECT * FROM custom_scripts ORDER BY created_at DESC").all();
    res.json(scripts);
  });

  app.post("/api/scripts", (req, res) => {
    const { objection_type, script_content } = req.body;
    const info = db.prepare("INSERT INTO custom_scripts (objection_type, script_content) VALUES (?, ?)").run(objection_type, script_content);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/scripts/:id", (req, res) => {
    db.prepare("DELETE FROM custom_scripts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
