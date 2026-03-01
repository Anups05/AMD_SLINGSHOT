const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'accessilearn.db')
const db = new Database(dbPath)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    disability TEXT NOT NULL DEFAULT 'vision',
    speechSpeed REAL NOT NULL DEFAULT 1.0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    text TEXT NOT NULL,
    alertTime TEXT,
    alertType TEXT DEFAULT 'reminder',
    date TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_user_date ON tasks(userId, date);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    date TEXT NOT NULL,
    answers TEXT NOT NULL,
    score INTEGER NOT NULL,
    suggestion TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );
  CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON checkins(userId, date);
`)

module.exports = db
