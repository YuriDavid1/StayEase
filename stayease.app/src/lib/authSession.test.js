import { afterEach, describe, expect, it } from "vitest";

import { ROLES, clearSession, homePathFor, loadSession, roleFromApi, saveSession } from "./authSession";
import { SESSION_KEY, storeSession } from "../test/mockApi";

// Sessão no navegador (cenário T14 do relatório da Etapa 3): F5, expiração e logout.

afterEach(() => localStorage.clear());

describe("roleFromApi", () => {
  it.each([
    [0, ROLES.ADMIN],
    [1, ROLES.RECEPTION],
    [2, ROLES.HOUSEKEEPING],
    [3, ROLES.GUEST],
  ])("converte o índice %i do enum da API em %s", (value, expected) => {
    expect(roleFromApi(value)).toBe(expected);
  });

  it("aceita o nome do perfil", () => {
    expect(roleFromApi("Receptionist")).toBe(ROLES.RECEPTION);
  });

  it.each([4, -1, "Root", "", null, undefined])("rejeita valor desconhecido %s", (value) => {
    expect(roleFromApi(value)).toBeNull();
  });
});

describe("homePathFor", () => {
  it("leva o hóspede para a área do usuário", () => {
    expect(homePathFor(ROLES.GUEST)).toBe("/user");
  });

  it.each([ROLES.ADMIN, ROLES.RECEPTION, ROLES.HOUSEKEEPING])("leva %s para a área administrativa", (role) => {
    expect(homePathFor(role)).toBe("/homeAdm");
  });
});

describe("loadSession", () => {
  it("restaura a sessão salva (F5 mantém o usuário logado)", () => {
    const saved = storeSession({ role: ROLES.RECEPTION });

    expect(loadSession()).toEqual(saved);
  });

  it("retorna null quando não há sessão", () => {
    expect(loadSession()).toBeNull();
  });

  it("descarta e apaga sessão expirada", () => {
    storeSession({ expiresInMs: -1_000 });

    expect(loadSession()).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it.each([
    ["sem token", { expiresAt: "2999-01-01T00:00:00Z", user: { role: "Guest" } }],
    ["sem perfil", { token: "t", expiresAt: "2999-01-01T00:00:00Z", user: {} }],
    ["sem expiração", { token: "t", user: { role: "Guest" } }],
  ])("descarta e apaga sessão %s", (_, session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    expect(loadSession()).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("retorna null para conteúdo corrompido sem lançar erro", () => {
    localStorage.setItem(SESSION_KEY, "{não é json");

    expect(loadSession()).toBeNull();
  });
});

describe("saveSession e clearSession", () => {
  it("logout apaga a sessão salva", () => {
    saveSession({ token: "t", expiresAt: "2999-01-01T00:00:00Z", user: { role: "Guest" } });

    clearSession();

    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(loadSession()).toBeNull();
  });
});
