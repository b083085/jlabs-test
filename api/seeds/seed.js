const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data.sqlite');
const db = new sqlite3.Database(DB_PATH);

const email = 'test@example.com';
const password = 'password123';
const name = 'Test User';

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  const hashed = bcrypt.hashSync(password, 8);
  db.run('INSERT OR IGNORE INTO users (name, email, password) VALUES (?,?,?)', [name, email, hashed], function(err) {
    if (err) console.error('Seed error', err);
    else console.log('Seeded user:', email, 'password:', password);
    db.close();
  });
});
