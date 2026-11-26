const STORAGE_KEY = "stayease.session";

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
