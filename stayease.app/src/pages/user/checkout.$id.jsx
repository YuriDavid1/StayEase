import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

//Mock de quartos
const quartos = [
  {
    id: "q1",
    numero: "101",
    tipo: "Standard",
    capacidade: 2,
    diaria: 180,
    status: "Livre",
  },
  {
    id: "q2",
    numero: "102",
    tipo: "Standard",
    capacidade: 2,
    diaria: 180,
    status: "Ocupado",
  },
  {
    id: "q3",
    numero: "201",
    tipo: "Luxo",
    capacidade: 4,
    diaria: 320,
    status: "Limpeza Pendente",
  },
  {
    id: "q4",
    numero: "202",
    tipo: "Luxo",
    capacidade: 4,
    diaria: 320,
    status: "Livre",
  },
  {
    id: "q5",
    numero: "301",
    tipo: "Suíte",
    capacidade: 3,
    diaria: 420,
    status: "Livre",
  },
  {
    id: "q6",
    numero: "302",
    tipo: "Suíte",
    capacidade: 4,
    diaria: 480,
    status: "Ocupado",
  },
];

// ==============================
// MOCK DAS RESERVAS
// ==============================

const reservasIniciais = [
  {
    id: "r1",
    quartoId: "q2",
    entrada: "2026-09-01",
    saida: "2026-09-05",
    status: "Hospedado",
    checkinEm: "2026-09-01T14:32:00",
    checkoutEm: null,
  },
  {
    id: "r2",
    quartoId: "q4",
    entrada: "2026-09-10",
    saida: "2026-09-13",
    status: "Confirmada",
    checkinEm: null,
    checkoutEm: null,
  },
];

// ==============================
// FUNÇÕES AUXILIARES
// ==============================

function moeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataBR(data) {
  if (!data) return "—";

  return new Date(
    `${data}T00:00:00`
  ).toLocaleDateString("pt-BR");
}

function dataHoraBR(data) {
  if (!data) return "—";

  return new Date(data).toLocaleString("pt-BR");
}

function noites(entrada, saida) {
  if (!entrada || !saida) return 0;

  const inicio = new Date(
    `${entrada}T00:00:00`
  );

  const fim = new Date(
    `${saida}T00:00:00`
  );

  const diferenca = fim - inicio;

  return Math.max(
    0,
    Math.ceil(
      diferenca / (1000 * 60 * 60 * 24)
    )
  );
}

function quartoPorId(id) {
  return quartos.find(
    (quarto) => quarto.id === id
  );
}

// ==============================
// COMPONENTE PRINCIPAL
// ==============================

function CheckoutCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservas, setReservas] = useState(
    reservasIniciais
  );

  const reserva = reservas.find(
    (r) => r.id === id
  );

  // ==============================
  // RESERVA NÃO ENCONTRADA
  // ==============================

  if (!reserva) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold">
          Reserva não encontrada
        </h1>

        <Button
          variant="outline"
          onClick={() =>
            navigate("/user/reservas")
          }
        >
          Voltar às minhas reservas
        </Button>
      </div>
    );
  }

  const quarto = quartoPorId(
    reserva.quartoId
  );

  const n = noites(
    reserva.entrada,
    reserva.saida
  );

  const diaria = quarto?.diaria ?? 0;

  // Taxa de serviço de 5%
  const taxa = Math.round(
    diaria * n * 0.05
  );

  const total = diaria * n + taxa;

  // Check-out somente pode ser feito
  // quando a reserva estiver hospedada
  const disponivel =
    reserva.status === "Hospedado";

  // ==============================
  // FINALIZAR CHECK-OUT
  // ==============================

  function finalizarCheckout() {
    if (!disponivel) {
      return;
    }

    setReservas((reservasAtuais) =>
      reservasAtuais.map((r) =>
        r.id === reserva.id
          ? {
              ...r,
              status: "Finalizada",
              checkoutEm:
                new Date().toISOString(),
            }
          : r
      )
    );

    toast.success(
      "Check-out concluído. Obrigado pela visita!"
    );

    navigate(
      `/user/bookinDetail/${reserva.id}`
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      {/* VOLTAR PARA DETALHES */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() =>
          navigate(
            `/user/bookinDetail/${reserva.id}`
          )
        }
      >
        <ArrowLeft className="h-4 w-4" />
        Detalhes da reserva
      </Button>

      {/* CABEÇALHO */}
      <section>
        <p className="text-sm font-medium uppercase tracking-widest text-oceano">
          Área do hóspede
        </p>

        <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
          Check-out
        </h1>
      </section>

      {/* EXTRATO */}
      <Card className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Extrato — Quarto{" "}
            {quarto?.numero}{" "}
            ({quarto?.tipo})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">

          {/* DIÁRIAS */}
          <Linha
            rotulo={`Diárias (${n} x ${moeda(
              diaria
            )})`}
            valor={moeda(diaria * n)}
          />

          {/* TAXA */}
          <Linha
            rotulo="Taxa de serviço (5%)"
            valor={moeda(taxa)}
          />

          {/* TOTAL */}
          <div className="flex items-center justify-between border-t border-border/70 pt-3">
            <span className="font-medium text-foreground">
              Total
            </span>

            <span className="font-display text-2xl font-semibold text-foreground">
              {moeda(total)}
            </span>
          </div>

          {/* PERÍODO */}
          <p className="text-muted-foreground">
            Período:{" "}
            {dataBR(reserva.entrada)}
            {" — "}
            {dataBR(reserva.saida)}
            {" · "}
            check-in em{" "}
            {dataHoraBR(
              reserva.checkinEm
            )}
          </p>

          {/* BOTÃO CHECK-OUT */}
          <Button
            className="w-full"
            disabled={!disponivel}
            onClick={finalizarCheckout}
          >
            <LogOut className="h-4 w-4" />
            Finalizar check-out
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}

function Linha({ rotulo, valor }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{rotulo}</span>

      <span className="text-foreground">
        {valor}
      </span>
    </div>
  );
}

export default CheckoutCliente;