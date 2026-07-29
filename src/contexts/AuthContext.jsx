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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = JSON.parse(localStorage.getItem('tripPlannerUsersDb') || '[]');
      const userRecord = users.find(u => u.username === username && u.password === password);
      
      if (userRecord) {
        const userData = { username: userRecord.username, token: 'mock-jwt-token-' + Date.now() };
        setUser(userData);
        localStorage.setItem('tripPlannerUser', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (username, email, password) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = JSON.parse(localStorage.getItem('tripPlannerUsersDb') || '[]');
      if (users.find(u => u.username === username)) {
        return { success: false, error: 'Username already exists' };
      }
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'Email already exists' };
      }
      
      users.push({ username, email, password });
      localStorage.setItem('tripPlannerUsersDb', JSON.stringify(users));
      
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tripPlannerUser');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
