import api from "../infra/api";
import { createReservationPayloadFromUi, normalizeReservationFromApi } from "./apiMappers";

export async function fetchReservations() {
    const response = await api.get("/reservations/all");
    const reservations = Array.isArray(response.data) ? response.data : [];
    return reservations.map((reservation) => normalizeReservationFromApi(reservation));
}

export async function fetchActiveReservations() {
    const response = await api.get("/reservations");
    const reservations = Array.isArray(response.data) ? response.data : [];
    return reservations.map((reservation) => normalizeReservationFromApi(reservation));
}

export async function createReservation(data) {
    const payload = createReservationPayloadFromUi(data);
    const response = await api.post("/reservations", payload);
    return normalizeReservationFromApi(response.data);
}

export async function checkInReservation(reservationId) {
    await api.patch(`/reservations/${reservationId}/check-in`);
}

export async function checkOutReservation(reservationId) {
    await api.patch(`/reservations/${reservationId}/check-out`);
}

export async function cancelReservation(reservationId) {
    await api.patch(`/reservations/${reservationId}/cancel`);
}

export async function fetchReservationsByRoom(roomId) {
    const response = await api.get(`/reservations/room/${roomId}`);
    return Array.isArray(response.data) ? response.data : [];
}

export async function fetchReservationsByGuest(guestId) {
    const response = await api.get(`/reservations/guest/${guestId}`);
    return Array.isArray(response.data) ? response.data : [];
}
