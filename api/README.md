# API (Express + SQLite)

Run the API (port 8000):

1. npm install
2. npm run seed
3. npm start

Seed creates a user: test@example.com / password123

POST /api/login { email, password } -> { token, user }
