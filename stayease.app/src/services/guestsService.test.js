import { afterEach, describe, expect, it } from "vitest";

import { fetchCurrentGuest, fetchGuestById, fetchGuests } from "./guestsService";
import { mockApi, storeSession } from "../test/mockApi";

// "Minhas reservas" (cenário T05 / risco R03 do relatório da Etapa 3).
//
// fetchCurrentGuest é usado por myBookin, bookinForm e userPage para descobrir o hóspede
// logado. Hoje ele devolve o primeiro hóspede da lista, sem considerar o usuário da sessão.

const GUESTS_FROM_API = [
  { guestId: 1, name: "Ana", document: "111", contact: "47911111111" },
  { guestId: 2, name: "Bruno", document: "222", contact: "47922222222" },
];

let mock;

afterEach(() => {
  mock?.restore();
  localStorage.clear();
});

describe("fetchCurrentGuest", () => {
  // R03: bloqueado até M07 (vínculo User ↔ Guest na API, por exemplo GET /api/guests/me).
  // Ao corrigir, troque it.skip por it e ajuste o mock para a nova rota.
  it.skip("dois usuários diferentes não devem receber o mesmo hóspede", async () => {
    mock = mockApi(() => ({ status: 200, data: GUESTS_FROM_API }));

    storeSession({ email: "ana@stayease.com" });
    const first = await fetchCurrentGuest();

    storeSession({ email: "bruno@stayease.com" });
    const second = await fetchCurrentGuest();

    expect(first?.id).not.toBe(second?.id);
  });

  it("retorna null quando a API não devolve hóspedes", async () => {
    storeSession();
    mock = mockApi(() => ({ status: 200, data: [] }));

    expect(await fetchCurrentGuest()).toBeNull();
  });
});

describe("fetchGuests e fetchGuestById", () => {
  it("converte os campos da API para os nomes usados nas telas", async () => {
    mock = mockApi(() => ({ status: 200, data: GUESTS_FROM_API }));

    const guests = await fetchGuests();

    expect(guests[0]).toEqual({ id: 1, guestId: 1, nome: "Ana", documento: "111", contato: "47911111111" });
  });

  it("trata resposta que não é lista como lista vazia", async () => {
    mock = mockApi(() => ({ status: 200, data: { inesperado: true } }));

    expect(await fetchGuests()).toEqual([]);
  });

  it("encontra hóspede pelo id, aceitando id em texto da rota", async () => {
    mock = mockApi(() => ({ status: 200, data: GUESTS_FROM_API }));

    expect((await fetchGuestById("2"))?.nome).toBe("Bruno");
    expect(await fetchGuestById(99)).toBeNull();
  });
});
