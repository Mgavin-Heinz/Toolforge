import { createContext, useContext, useState } from 'react'

// 1. Create the context — this is the "box" other components will reach into
const AuthContext = createContext(null)

// 2. This is the "provider" — it wraps your whole app and shares the data
export function AuthProvider({ children }) {
  // 3. This is the actual state — null means no one is logged in yet
  const [user, setUser] = useState(null)

  // 4. Called when user logs in — saves their info and token
  const login = (userData, token) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  // 5. Called when user logs out — clears everything
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  // 6. Share the user, login, and logout with the whole app
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 7. Custom hook — lets any page grab auth data with one line
export function useAuth() {
  return useContext(AuthContext)
}