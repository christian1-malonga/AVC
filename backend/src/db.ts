import Database, { type Database as DatabaseType } from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "app.db");

const db: DatabaseType = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      whatsapp TEXT DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member' REFERENCES roles(name),
      section TEXT,
      approved INTEGER NOT NULL DEFAULT 0,
      date_joined TEXT NOT NULL DEFAULT (datetime('now')),
      birthday TEXT DEFAULT NULL,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS debts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total_absence_debt REAL NOT NULL DEFAULT 0,
      total_late_debt REAL NOT NULL DEFAULT 0,
      total_paid REAL NOT NULL DEFAULT 0,
      total_debt REAL NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS debt_details (
      id TEXT PRIMARY KEY,
      debt_id TEXT NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      reason TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('PRESENT','ABSENT','LATE','EXCUSED')),
      late_fee REAL DEFAULT 0,
      marked_by TEXT REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_by TEXT REFERENCES users(id),
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      size INTEGER
    );

    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      composer TEXT DEFAULT '',
      category TEXT NOT NULL DEFAULT 'general',
      pdf_file TEXT,
      docx_file TEXT,
      audio_file TEXT,
      upload_date TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS voice_notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      uploaded_by TEXT REFERENCES users(id),
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      size INTEGER
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      file_path TEXT,
      amount REAL NOT NULL DEFAULT 0,
      uploaded_by TEXT REFERENCES users(id),
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'announcement',
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      user_id TEXT REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      performed_by TEXT REFERENCES users(id),
      target_user TEXT REFERENCES users(id),
      details TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Safe migrations
    CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY);
  `);

  const migrations: [string, string][] = [
    ['add_whatsapp', "ALTER TABLE users ADD COLUMN whatsapp TEXT DEFAULT ''"],
    ['add_birthday', "ALTER TABLE users ADD COLUMN birthday TEXT DEFAULT NULL"],
    ['add_late_fee', "ALTER TABLE attendance ADD COLUMN late_fee REAL DEFAULT 0"],
  ];
  for (const [name, sql] of migrations) {
    try {
      db.exec(sql);
      db.prepare("INSERT OR IGNORE INTO _migrations (name) VALUES (?)").run(name);
    } catch { /* column already exists */ }
  }
}

export default db;
