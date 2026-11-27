import { afterEach, describe, expect, it, vi } from "vitest";

import api, { UNAUTHORIZED_EVENT } from "./api";
import { SESSION_KEY, mockApi, storeSession } from "../test/mockApi";

// Interceptadores da API (cenário T14 do relatório da Etapa 3): token, 401, 403 e mensagens.

let mock;

afterEach(() => {
  mock?.restore();
  localStorage.clear();
});

describe("requisição", () => {
  it("envia o token da sessão no cabeçalho Authorization", async () => {
    storeSession({ token: "abc.def.ghi" });
    mock = mockApi(() => ({ status: 200, data: [] }));

    await api.get("/rooms");

    expect(mock.requests[0].headers.Authorization).toBe("Bearer abc.def.ghi");
  });

  it("não envia Authorization sem sessão", async () => {
    mock = mockApi(() => ({ status: 200, data: [] }));

    await api.get("/rooms");

    expect(mock.requests[0].headers.Authorization).toBeUndefined();
  });

  it("não envia token de sessão expirada", async () => {
    storeSession({ expiresInMs: -1_000 });
    mock = mockApi(() => ({ status: 200, data: [] }));

    await api.get("/rooms");

    expect(mock.requests[0].headers.Authorization).toBeUndefined();
  });
});

describe("resposta 401", () => {
  it("encerra a sessão e avisa o UserProvider quando o token é rejeitado", async () => {
    storeSession();
    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);
    mock = mockApi(() => ({ status: 401 }));

    await expect(api.get("/reservations")).rejects.toThrow("Sua sessão expirou. Entre novamente.");

    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });

  it("no login com senha errada não encerra sessão nem dispara evento", async () => {
    storeSession();
    const listener = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, listener);
    mock = mockApi(() => ({ status: 401, data: { message: "E-mail ou senha inválidos." } }));

    await expect(api.post("/auth/login", {})).rejects.toThrow("E-mail ou senha inválidos.");

    expect(localStorage.getItem(SESSION_KEY)).not.toBeNull();
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener(UNAUTHORIZED_EVENT, listener);
  });
});

describe("mensagens de erro", () => {
  it.each([
    [403, null, "Você não tem permissão para realizar esta ação."],
    [429, null, "Muitas tentativas. Aguarde um minuto e tente novamente."],
    [409, { title: "Conflict", detail: "O quarto 101 não está livre para check-in." }, "O quarto 101 não está livre para check-in."],
    [404, { message: "Reservation not found" }, "Reservation not found"],
    [500, { title: "An unexpected error occurred." }, "An unexpected error occurred."],
  ])("status %i mostra mensagem adequada", async (status, data, expected) => {
    storeSession();
    mock = mockApi(() => ({ status, data }));

    await expect(api.get("/qualquer")).rejects.toThrow(expected);
  });

  it("403 não encerra a sessão", async () => {
    storeSession();
    mock = mockApi(() => ({ status: 403 }));

    await expect(api.get("/users")).rejects.toThrow();

    expect(localStorage.getItem(SESSION_KEY)).not.toBeNull();
  });
});
