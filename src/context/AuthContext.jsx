import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [loading, setLoading] = useState(true);

  // You can also store some extra info here if needed
  const [creationTempData, setCreationTempData] = useState(null); // stores { token, email } during creation

  useEffect(() => {
    // If we wanted to validate token on load, we could do it here
    setLoading(false);
  }, []);

  const login = (newToken, newUserId) => {
    setToken(newToken);
    setUserId(newUserId);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  const authenticatedFetch = async (url, options = {}) => {
    if (!token) throw new Error('No token found');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ token, userId, login, logout, authenticatedFetch, loading, creationTempData, setCreationTempData }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
