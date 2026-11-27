const STORAGE_KEY = "stayease.session";

// VITE_AUTH_DISABLED=true (see .env.development) skips the login screen and opens every
// page as an administrator. It only works with an API running with Auth:Disabled=true.
export const AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === "true";

// Same names as the API's UserRole enum, which the API serializes as its index.
export const ROLES = {
  ADMIN: "Administrator",
  RECEPTION: "Receptionist",
  HOUSEKEEPING: "Housekeeping",
  GUEST: "Guest",
};

const ROLES_BY_API_VALUE = [ROLES.ADMIN, ROLES.RECEPTION, ROLES.HOUSEKEEPING, ROLES.GUEST];

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.RECEPTION, ROLES.HOUSEKEEPING];
export const FRONT_DESK_ROLES = [ROLES.ADMIN, ROLES.RECEPTION];
export const CLEANING_ROLES = [ROLES.ADMIN, ROLES.HOUSEKEEPING];

export function roleFromApi(role) {
  if (typeof role === "number") {
    return ROLES_BY_API_VALUE[role] ?? null;
  }
  return ROLES_BY_API_VALUE.includes(role) ? role : null;
}

export function homePathFor(role) {
  return role === ROLES.GUEST ? "/user" : "/homeAdm";
}

// Session used while the login is disabled.
export const NO_LOGIN_SESSION = {
  token: null,
  expiresAt: null,
  user: { id: 0, email: "sem-login@stayease.local", role: ROLES.ADMIN },
};

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    const expired = !session?.expiresAt || new Date(session.expiresAt) <= new Date();

    if (!session?.token || !session?.user?.role || expired) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable (private mode): the session lasts until the page is reloaded.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
