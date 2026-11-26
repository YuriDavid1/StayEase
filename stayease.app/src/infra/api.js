import axios from "axios";

import { clearSession, loadSession } from "../lib/authSession";

// Fired when the API rejects the token, so the UserProvider can log the user out.
export const UNAUTHORIZED_EVENT = "stayease:unauthorized";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const session = loadSession();

    if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const isLoginRequest = String(error?.config?.url ?? "").endsWith("/auth/login");

        if (status === 401 && !isLoginRequest) {
            clearSession();
            window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
        }

        const data = error?.response?.data;
        const message =
            data?.detail ||
            data?.message ||
            (status === 401 && !isLoginRequest ? "Sua sessão expirou. Entre novamente." : null) ||
            (status === 403 ? "Você não tem permissão para realizar esta ação." : null) ||
            (status === 429 ? "Muitas tentativas. Aguarde um minuto e tente novamente." : null) ||
            data?.title ||
            error?.message ||
            "Erro ao comunicar com a API.";

        return Promise.reject(new Error(message));
    }
);

export default api;
