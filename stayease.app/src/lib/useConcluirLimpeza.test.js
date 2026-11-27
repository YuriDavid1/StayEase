import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import { concluirLimpezaDoQuarto, idDoQuarto } from "./useConcluirLimpeza";
import { mockApi, storeSession } from "../test/mockApi";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

let mock;

beforeEach(() => {
  storeSession({ role: "Housekeeping" });
});

afterEach(() => {
  mock?.restore();
  localStorage.clear();
  vi.clearAllMocks();
});

describe("idDoQuarto", () => {
  it("prefere roomId e usa id quando não houver", () => {
    expect(idDoQuarto({ roomId: 7, id: 3 })).toBe(7);
    expect(idDoQuarto({ id: 3 })).toBe(3);
  });
});

describe("concluirLimpezaDoQuarto", () => {
  it("chama a rota de limpeza e avisa a tela", async () => {
    mock = mockApi(() => ({ status: 204 }));
    const aoConcluir = vi.fn();

    const ok = await concluirLimpezaDoQuarto({ roomId: 5, numero: "105" }, aoConcluir);

    expect(ok).toBe(true);
    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0].method).toBe("patch");
    expect(mock.requests[0].url).toBe("/rooms/5/finish-cleaning");
    expect(aoConcluir).toHaveBeenCalledWith(5);
    expect(toast.success).toHaveBeenCalledWith("Limpeza do quarto 105 concluída.");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("funciona sem callback", async () => {
    mock = mockApi(() => ({ status: 204 }));

    await expect(concluirLimpezaDoQuarto({ id: 2, numero: "102" })).resolves.toBe(true);
  });

  it("mostra erro e não atualiza a tela quando a API recusa", async () => {
    mock = mockApi(() => ({
      status: 409,
      data: { title: "Conflict", detail: "O quarto não está em limpeza." },
    }));
    const aoConcluir = vi.fn();

    const ok = await concluirLimpezaDoQuarto({ roomId: 5, numero: "105" }, aoConcluir);

    expect(ok).toBe(false);
    expect(aoConcluir).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
