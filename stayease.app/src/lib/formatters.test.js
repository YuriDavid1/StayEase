import { describe, expect, it } from "vitest";

import {
  calcularNoites,
  formatarData,
  formatarDataHora,
  formatarMoeda,
} from "./formatters";

// toLocaleString usa espaço não separável entre "R$" e o valor.
const semEspacoEspecial = (texto) => texto.replace(/\s/g, " ");

describe("formatarMoeda", () => {
  it("formata número em reais", () => {
    expect(semEspacoEspecial(formatarMoeda(1234.5))).toBe("R$ 1.234,50");
  });

  it("aceita valor em texto vindo da API", () => {
    expect(semEspacoEspecial(formatarMoeda("250"))).toBe("R$ 250,00");
  });

  it.each([null, undefined, "", "abc", NaN])(
    "mostra R$ 0,00 para valor inválido (%s)",
    (valor) => {
      expect(semEspacoEspecial(formatarMoeda(valor))).toBe("R$ 0,00");
    }
  );
});

describe("formatarData", () => {
  it("formata data AAAA-MM-DD sem mudar o dia por causa do fuso", () => {
    expect(formatarData("2026-11-26")).toBe("26/11/2026");
  });

  it("ignora o horário de datas ISO", () => {
    expect(formatarData("2026-11-26T23:30:00Z")).toBe("26/11/2026");
  });

  it("usa travessão quando não há data", () => {
    expect(formatarData(null)).toBe("—");
  });

  it("aceita outro texto para data vazia", () => {
    expect(formatarData("", "")).toBe("");
  });
});

describe("formatarDataHora", () => {
  it("usa travessão quando não há data", () => {
    expect(formatarDataHora(undefined)).toBe("—");
  });

  it("formata data e hora", () => {
    expect(formatarDataHora("2026-11-26T14:05:00")).toContain("26/11/2026");
  });
});

describe("calcularNoites", () => {
  it("conta as noites entre entrada e saída", () => {
    expect(calcularNoites("2026-11-26", "2026-11-29")).toBe(3);
  });

  it("aceita datas ISO com horário", () => {
    expect(calcularNoites("2026-11-26T00:00:00", "2026-11-27T00:00:00")).toBe(1);
  });

  it("retorna 0 para mesma data", () => {
    expect(calcularNoites("2026-11-26", "2026-11-26")).toBe(0);
  });

  it("nunca retorna valor negativo", () => {
    expect(calcularNoites("2026-11-29", "2026-11-26")).toBe(0);
  });

  it("retorna 0 sem uma das datas", () => {
    expect(calcularNoites("2026-11-26", "")).toBe(0);
    expect(calcularNoites(null, "2026-11-26")).toBe(0);
  });
});
