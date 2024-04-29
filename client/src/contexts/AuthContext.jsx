import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext({});

export default function AuthProvider({ children }) {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (token) {
      const { exp } = jwtDecode(token);
      setIsLoggedIn(exp * 1000 > Date.now() && !!userId && !!username);
    } else {
      setIsLoggedIn(false);
    }
  }, [token, userId, username]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userId, username, token }}>
      {children}
    </AuthContext.Provider>
  );
}
