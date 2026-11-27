// Funções de apresentação compartilhadas pelas telas.
// Antes cada página tinha a sua cópia de "moeda", "dataBR" e "noites".

const MS_POR_DIA = 1000 * 60 * 60 * 24;

// Datas "AAAA-MM-DD" (ou ISO com horário) viram meia-noite no fuso local,
// para que o dia exibido não mude por causa do fuso horário.
function paraDataLocal(data) {
  return new Date(`${String(data).slice(0, 10)}T00:00:00`);
}

export function formatarMoeda(valor) {
  const numero = Number(valor);

  return (Number.isFinite(numero) ? numero : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(data, vazio = "—") {
  if (!data) return vazio;

  return paraDataLocal(data).toLocaleDateString("pt-BR");
}

export function formatarDataHora(data) {
  if (!data) return "—";

  return new Date(data).toLocaleString("pt-BR");
}

// Quantidade de noites entre a entrada e a saída. Nunca é negativa.
// Math.round evita erro de um dia quando o período cruza horário de verão.
export function calcularNoites(entrada, saida) {
  if (!entrada || !saida) return 0;

  const dias = Math.round(
    (paraDataLocal(saida) - paraDataLocal(entrada)) / MS_POR_DIA
  );

  return Math.max(0, dias);
}
