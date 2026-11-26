import { useEffect, useState } from "react";

import UserContext from "./userContext";
import { ROLES, clearSession, loadSession, saveSession } from "./authSession";
import { UNAUTHORIZED_EVENT } from "../infra/api";
import { login as loginRequest } from "../services/authService";

function UserProvider({ children }) {
  // Restored from localStorage, so the session survives a page reload.
  const [session, setSession] = useState(() => loadSession());

  useEffect(() => {
    const onUnauthorized = () => setSession(null);

    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = async (email, password) => {
    const novaSessao = await loginRequest(email, password);
    saveSession(novaSessao);
    setSession(novaSessao);
    return novaSessao;
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  const role = session?.user?.role ?? null;

  // "perfil" kept for the screens that only distinguish the admin area from the guest area.
  const perfil = !role ? null : role === ROLES.GUEST ? "usuario" : "admin";

  return (
    <UserContext.Provider
      value={{
        user: session?.user ?? null,
        role,
        perfil,
        isAuthenticated: Boolean(session),
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
