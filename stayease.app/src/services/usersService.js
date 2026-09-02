import api from "../infra/api";
import {
    createUserPayloadFromUi,
    normalizeUserFromApi,
    updateUserPayloadFromUi,
} from "./apiMappers";

export async function fetchUsers() {
    const response = await api.get("/users");
    const users = Array.isArray(response.data) ? response.data : [];
    return users.map((user) => normalizeUserFromApi(user));
}

export async function createUser(user) {
    const payload = createUserPayloadFromUi(user);
    const response = await api.post("/users", payload);
    return normalizeUserFromApi(response.data);
}

export async function updateUser(userId, user) {
    const payload = updateUserPayloadFromUi(user);
    const response = await api.put(`/users/${userId}`, payload);
    return normalizeUserFromApi(response.data ?? { ...user, userId });
}

export async function deleteUser(userId) {
    await api.delete(`/users/${userId}`);
}
