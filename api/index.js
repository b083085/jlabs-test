const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.sqlite');

const db = new sqlite3.Database(DB_PATH);

// init tables if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`);
});

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'dev-secret-please-change';

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!row) return res.status(401).json({ message: 'Invalid credentials' });

    const match = bcrypt.compareSync(password, row.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: row.id, email: row.email, name: row.name }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, user: { id: row.id, email: row.email, name: row.name } });
  });
});

app.get('/api/ping', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
