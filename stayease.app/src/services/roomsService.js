import api from "../infra/api";
import {
    createRoomPayloadFromUi,
    normalizeRoomFromApi,
    updateRoomPayloadFromUi,
} from "./apiMappers";
import { getRoomDailyRate } from "./roomDailyRatesStorage";

export async function fetchRooms() {
    const response = await api.get("/rooms");
    const rooms = Array.isArray(response.data) ? response.data : [];

    return rooms.map((room) =>
        normalizeRoomFromApi(room, getRoomDailyRate(room.roomId))
    );
}

export async function createRoom(room) {
    const payload = createRoomPayloadFromUi(room);
    const response = await api.post("/rooms", payload);
    return normalizeRoomFromApi(response.data, getRoomDailyRate(response.data.roomId));
}

export async function updateRoom(roomId, room) {
    const payload = updateRoomPayloadFromUi(room);
    const response = await api.put(`/rooms/${roomId}`, payload);
    return normalizeRoomFromApi(
        response.data ?? { ...room, roomId },
        getRoomDailyRate(roomId)
    );
}

export async function deleteRoom(roomId) {
    await api.delete(`/rooms/${roomId}`);
}

export async function fetchRoomReservations(roomId) {
    const response = await api.get(`/reservations/room/${roomId}`);
    return Array.isArray(response.data) ? response.data : [];
}

export async function finishCleaning(roomId, room) {
    const payload = {
        number: String(room.numero ?? "").trim(),
        type: String(room.tipo ?? "").trim(),
        capacity: Number(room.capacidade ?? 0),
        status: 0,
    };

    await api.put(`/rooms/${roomId}`, payload);
}

export async function fetchRoomById(roomId) {
    const rooms = await fetchRooms();

    return rooms.find(
        (room) => String(room.id) === String(roomId)
    ) ?? null;
}