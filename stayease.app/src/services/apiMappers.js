export function normalizeRoomStatus(status) {
    if (status === null || status === undefined || status === "") {
        return "Livre";
    }

    const value = String(status).trim();

    if (value === "0" || value.toLowerCase() === "available" || value === "Livre") {
        return "Livre";
    }

    if (value === "1" || value.toLowerCase() === "occupied" || value === "Ocupado") {
        return "Ocupado";
    }

    if (
        value === "2" ||
        value.toLowerCase() === "pendingcleaning" ||
        value === "Limpeza Pendente"
    ) {
        return "Limpeza Pendente";
    }

    return "Livre";
}

export function mapRoomStatusToApi(status) {
    const normalized = normalizeRoomStatus(status);

    if (normalized === "Livre") return 0;
    if (normalized === "Ocupado") return 1;
    return 2;
}

export function normalizeUserRole(role) {
    if (role === null || role === undefined || role === "") {
        return "Administrador";
    }

    const value = String(role).trim();

    if (value === "0" || value.toLowerCase() === "administrator" || value === "Administrador") {
        return "Administrador";
    }

    if (value === "1" || value.toLowerCase() === "receptionist" || value === "Recepção") {
        return "Recepção";
    }

    if (
        value === "2" ||
        value.toLowerCase() === "housekeeping" ||
        value === "Governança"
    ) {
        return "Governança";
    }

    return "Administrador";
}

export function mapUserRoleToApi(role) {
    const normalized = normalizeUserRole(role);

    if (normalized === "Recepção") return 1;
    if (normalized === "Governança") return 2;
    return 0;
}

export function normalizeRoomFromApi(room, dailyRate = null) {
    return {
        id: room?.roomId ?? room?.id ?? "",
        roomId: room?.roomId ?? room?.id ?? "",
        numero: room?.number ?? "",
        tipo: room?.type ?? "",
        capacidade: Number(room?.capacity ?? 0),
        status: normalizeRoomStatus(room?.status),
        diaria: dailyRate ?? null,
    };
}

export function createRoomPayloadFromUi(room) {
    return {
        number: String(room.numero ?? "").trim(),
        type: String(room.tipo ?? "").trim(),
        capacity: Number(room.capacidade ?? 0),
    };
}

export function updateRoomPayloadFromUi(room) {
    return {
        number: String(room.numero ?? "").trim(),
        type: String(room.tipo ?? "").trim(),
        capacity: Number(room.capacidade ?? 0),
        status: mapRoomStatusToApi(room.status),
    };
}

export function normalizeGuestFromApi(guest) {
    return {
        id: guest?.guestId ?? guest?.id ?? "",
        guestId: guest?.guestId ?? guest?.id ?? "",
        nome: guest?.name ?? "",
        documento: guest?.document ?? "",
        contato: guest?.contact ?? "",
    };
}

export function createGuestPayloadFromUi(guest) {
    return {
        name: String(guest.nome ?? "").trim(),
        document: String(guest.documento ?? "").trim(),
        contact: String(guest.contato ?? "").trim(),
    };
}

export function updateGuestPayloadFromUi(guest) {
    return createGuestPayloadFromUi(guest);
}

export function normalizeUserFromApi(user) {
    return {
        id: user?.userId ?? user?.id ?? "",
        userId: user?.userId ?? user?.id ?? "",
        email: user?.email ?? "",
        perfil: normalizeUserRole(user?.role),
        role: user?.role,
    };
}

export function createUserPayloadFromUi(user) {
    return {
        email: String(user.email ?? "").trim(),
        role: mapUserRoleToApi(user.perfil),
    };
}

export function updateUserPayloadFromUi(user) {
    return {
        role: mapUserRoleToApi(user.perfil),
    };
}

export function normalizeReservationFromApi(reservation) {
    const status =
        reservation?.isCancelled === true
            ? "Cancelada"
            : reservation?.actualCheckOut
                ? "Finalizada"
                : reservation?.actualCheckIn && !reservation?.actualCheckOut
                    ? "Hospedado"
                    : "Confirmada";

    return {
        id: reservation?.reservationId ?? reservation?.id ?? "",
        reservationId: reservation?.reservationId ?? reservation?.id ?? "",
        guestId: reservation?.guestId ?? reservation?.guest?.guestId ?? "",
        roomId: reservation?.roomId ?? reservation?.room?.roomId ?? "",
        guestName: reservation?.guest?.name ?? "",
        roomNumber: reservation?.room?.number ?? "",
        entrada: reservation?.scheduledCheckIn
            ? new Date(reservation.scheduledCheckIn).toISOString().slice(0, 10)
            : "",
        saida: reservation?.scheduledCheckOut
            ? new Date(reservation.scheduledCheckOut).toISOString().slice(0, 10)
            : "",
        checkinEm: reservation?.actualCheckIn ?? null,
        checkoutEm: reservation?.actualCheckOut ?? null,
        status,
        isCancelled: Boolean(reservation?.isCancelled),
    };
}

export function createReservationPayloadFromUi(data) {
    return {
        roomId: Number(data.roomId),
        guestId: Number(data.guestId),
        scheduledCheckIn: new Date(`${data.entrada}T00:00:00`).toISOString(),
        scheduledCheckOut: new Date(`${data.saida}T00:00:00`).toISOString(),
    };
}
