import api from "../infra/api";
import { roleFromApi } from "../lib/authSession";

export async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    const { token, expiresAt, user } = response.data;

    return {
        token,
        expiresAt,
        user: {
            id: user.userId,
            email: user.email,
            role: roleFromApi(user.role),
        },
    };
}
