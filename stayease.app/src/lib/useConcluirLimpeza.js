import { useState } from "react";
import { toast } from "sonner";

import { finishCleaning } from "../services/roomsService";

// Ação "Limpeza concluída", usada no painel (dashboardADM) e na tela de quartos (RoomsPage).
// Antes cada tela tinha a sua cópia, com mensagens e tratamento de erro diferentes.

export const idDoQuarto = (quarto) => quarto.roomId ?? quarto.id;

// Parte sem React, para poder ser testada sem renderizar a tela.
// Retorna true quando a API confirmou a limpeza.
export async function concluirLimpezaDoQuarto(quarto, aoConcluir) {
  const roomId = idDoQuarto(quarto);

  try {
    await finishCleaning(roomId);
  } catch (error) {
    toast.error(error.message || "Não foi possível concluir a limpeza.");
    return false;
  }

  toast.success(`Limpeza do quarto ${quarto.numero} concluída.`);
  await aoConcluir?.(roomId);
  return true;
}

// aoConcluir(roomId) é chamado depois que a API confirma,
// para a tela atualizar a lista do jeito dela.
export function useConcluirLimpeza(aoConcluir) {
  // Id do quarto em andamento, para desabilitar o botão e evitar clique duplo.
  const [limpandoId, setLimpandoId] = useState(null);

  const concluirLimpeza = async (quarto) => {
    if (limpandoId !== null) return false;

    setLimpandoId(idDoQuarto(quarto));

    try {
      return await concluirLimpezaDoQuarto(quarto, aoConcluir);
    } finally {
      setLimpandoId(null);
    }
  };

  return { concluirLimpeza, limpandoId };
}
