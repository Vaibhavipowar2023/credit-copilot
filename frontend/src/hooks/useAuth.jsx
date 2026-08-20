import { createContext, useContext, useState } from "react";
import { getToken, clearTokens } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  const onLogin = () => setIsLoggedIn(true);
  const onLogout = () => { clearTokens(); setIsLoggedIn(false); };

  return (
    <AuthContext.Provider value={{ isLoggedIn, onLogin, onLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
