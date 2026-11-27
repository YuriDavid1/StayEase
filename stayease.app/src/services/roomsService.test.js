import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { fetchRoomById, fetchRoomsById } from "./roomsService";
import { mockApi, storeSession } from "../test/mockApi";

const ROOMS_FROM_API = [
  { roomId: 1, number: "101", type: "Casal", capacity: 2, status: "Available", dailyRate: 250 },
  { roomId: 2, number: "102", type: "Família", capacity: 4, status: "Occupied", dailyRate: 400 },
];

let mock;

beforeEach(() => {
  storeSession();
});

afterEach(() => {
  mock?.restore();
  localStorage.clear();
});

describe("fetchRoomsById", () => {
  it("busca todos os quartos com uma única requisição", async () => {
    mock = mockApi(() => ({ status: 200, data: ROOMS_FROM_API }));

    const quartos = await fetchRoomsById();

    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0].url).toBe("/rooms");
    expect(Object.keys(quartos)).toEqual(["1", "2"]);
    expect(quartos["2"].numero).toBe("102");
    expect(quartos["2"].diaria).toBe(400);
  });

  it("permite consultar pelo roomId numérico da reserva", async () => {
    mock = mockApi(() => ({ status: 200, data: ROOMS_FROM_API }));

    const quartos = await fetchRoomsById();

    expect(quartos[1].numero).toBe("101");
  });

  it("retorna objeto vazio quando a API não devolve lista", async () => {
    mock = mockApi(() => ({ status: 200, data: null }));

    await expect(fetchRoomsById()).resolves.toEqual({});
  });
});

describe("fetchRoomById", () => {
  it("encontra o quarto pelo id", async () => {
    mock = mockApi(() => ({ status: 200, data: ROOMS_FROM_API }));

    const quarto = await fetchRoomById("2");

    expect(quarto.numero).toBe("102");
  });

  it("retorna null quando o quarto não existe", async () => {
    mock = mockApi(() => ({ status: 200, data: ROOMS_FROM_API }));

    await expect(fetchRoomById(99)).resolves.toBeNull();
  });
});
