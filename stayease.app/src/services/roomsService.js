import api from "../infra/api";
import {
    createRoomPayloadFromUi,
    normalizeRoomFromApi,
    updateRoomPayloadFromUi,
} from "./apiMappers";

export async function fetchRooms() {
    const response = await api.get("/rooms");
    const rooms = Array.isArray(response.data) ? response.data : [];

    return rooms.map((room) => normalizeRoomFromApi(room));
}

export async function createRoom(room) {
    const payload = createRoomPayloadFromUi(room);
    const response = await api.post("/rooms", payload);
    return normalizeRoomFromApi(response.data);
}

export async function updateRoom(roomId, room) {
    const payload = updateRoomPayloadFromUi(room);
    await api.put(`/rooms/${roomId}`, payload);

    // The API answers 204 No Content, so return the UI room with the saved values.
    return {
        ...room,
        id: roomId,
        roomId,
        diaria: payload.dailyRate,
    };
}

export async function deleteRoom(roomId) {
    await api.delete(`/rooms/${roomId}`);
}

export async function fetchRoomReservations(roomId) {
    const response = await api.get(`/reservations/room/${roomId}`);
    return Array.isArray(response.data) ? response.data : [];
}

export async function finishCleaning(roomId) {
    await api.patch(`/rooms/${roomId}/finish-cleaning`);
}

export async function fetchRoomById(roomId) {
    const rooms = await fetchRooms();

    return rooms.find(
        (room) => String(room.id) === String(roomId)
    ) ?? null;
}
