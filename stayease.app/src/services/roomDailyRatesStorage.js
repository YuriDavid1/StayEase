const STORAGE_KEY = "stayease.roomDailyRates";

export function getRoomDailyRatesStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return {};
        }

        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function getRoomDailyRate(roomId) {
    if (roomId === null || roomId === undefined || roomId === "") {
        return null;
    }

    const rates = getRoomDailyRatesStorage();
    const value = Number(rates[String(roomId)]);

    if (!Number.isFinite(value) || value < 0) {
        return null;
    }

    return value;
}

export function setRoomDailyRate(roomId, value) {
    if (roomId === null || roomId === undefined || roomId === "") {
        return;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
        return;
    }

    const rates = getRoomDailyRatesStorage();
    rates[String(roomId)] = numericValue;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
}

export function deleteRoomDailyRate(roomId) {
    const rates = getRoomDailyRatesStorage();
    delete rates[String(roomId)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
}
