import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('tripPlannerUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('tripPlannerUser', JSON.stringify(data.user));
        localStorage.setItem('tripPlannerToken', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid username or password' };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to create account' };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tripPlannerUser');
    localStorage.removeItem('tripPlannerToken');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
