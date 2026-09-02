import api from "../infra/api";
import {
    createGuestPayloadFromUi,
    normalizeGuestFromApi,
    updateGuestPayloadFromUi,
} from "./apiMappers";

export async function fetchGuests() {
    const response = await api.get("/guests");
    const guests = Array.isArray(response.data) ? response.data : [];
    return guests.map((guest) => normalizeGuestFromApi(guest));
}

export async function createGuest(guest) {
    const payload = createGuestPayloadFromUi(guest);
    const response = await api.post("/guests", payload);
    return normalizeGuestFromApi(response.data);
}

export async function updateGuest(guestId, guest) {
    const payload = updateGuestPayloadFromUi(guest);
    const response = await api.put(`/guests/${guestId}`, payload);
    return normalizeGuestFromApi(response.data ?? { ...guest, guestId });
}

export async function deleteGuest(guestId) {
    await api.delete(`/guests/${guestId}`);
}

export async function fetchGuestReservations(guestId) {
    const response = await api.get(`/reservations/guest/${guestId}`);
    return Array.isArray(response.data) ? response.data : [];
}
