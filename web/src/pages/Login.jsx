import React, { useState } from 'react'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post('http://localhost:8000/api/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="center">
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={submit}>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
          <label>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
          <button className="primary">Login</button>
        </form>
        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}
