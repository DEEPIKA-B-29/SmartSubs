import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios"; // ✅ replaced api import

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const [loading, setLoading] = useState(false);

  // ✅ Update axios headers when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = (tokenValue, userObj) => {
    console.log("Login called with token:", tokenValue); // <- add this line
    setToken(tokenValue);
    setUser(userObj);
  };

  // context/authContext.js
  const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  setToken(null);
  setUser(null);
};

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
