import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, LogIn, LogOut, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

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


const reservasIniciais = [
  {
    id: "r1",
    hospedeIds: ["h1"],
    quartoId: "q2",
    entrada: "2026-09-01",
    saida: "2026-09-05",
    status: "Hospedado",
    checkinEm: "2026-09-01T14:32:00",
    checkoutEm: null,
  },
  {
    id: "r2",
    hospedeIds: ["h1"],
    quartoId: "q4",
    entrada: "2026-09-10",
    saida: "2026-09-13",
    status: "Confirmada",
    checkinEm: null,
    checkoutEm: null,
  },
];


const hospedes = [
  {
    id: "h1",
    nome: "Lucas",
  },
];


function moeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataBR(data) {
  if (!data) return "—";

  return new Date(`${data}T00:00:00`).toLocaleDateString(
    "pt-BR"
  );
}

function dataHoraBR(data) {
  if (!data) return "—";

  return new Date(data).toLocaleString("pt-BR");
}

function noites(entrada, saida) {
  if (!entrada || !saida) return 0;

  const inicio = new Date(`${entrada}T00:00:00`);
  const fim = new Date(`${saida}T00:00:00`);

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

function hospedePorId(id) {
  return hospedes.find(
    (hospede) => hospede.id === id
  );
}


function DetalhesReserva() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservas, setReservas] = useState(
    reservasIniciais
  );

  const reserva = reservas.find(
    (r) => r.id === id
  );


  if (!reserva) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold">
          Reserva não encontrada
        </h1>

        <Button
          variant="outline"
          onClick={() =>
            navigate("/myBookin")
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

  const bloqueio = null;


  function cancelarReserva() {
    setReservas((reservasAtuais) =>
      reservasAtuais.map((r) =>
        r.id === reserva.id
          ? {
              ...r,
              status: "Cancelada",
            }
          : r
      )
    );

    toast.success("Reserva cancelada.");
  }


  return (
    <div className="space-y-8">

      {/* VOLTAR */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() =>
          navigate("/myBookin")
        }
      >
        <ArrowLeft className="h-4 w-4" />
        Minhas reservas
      </Button>

      {/* CABEÇALHO */}
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-oceano">
            Reserva #{reserva.id}
          </p>

          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
            Quarto {quarto?.numero ?? "—"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {quarto?.tipo}
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* STATUS DA RESERVA */}
          <Badge variant="secondary">
            {reserva.status}
          </Badge>

          {/* STATUS DO QUARTO */}
          {quarto && (
            <Badge>
              {quarto.status}
            </Badge>
          )}

        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="grid gap-4 md:grid-cols-[1fr_320px]">

        {/* INFORMAÇÕES DA ESTADIA */}
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Informações da estadia
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">

            <Info
              rotulo="Entrada"
              valor={dataBR(reserva.entrada)}
            />

            <Info
              rotulo="Saída"
              valor={dataBR(reserva.saida)}
            />

            <Info
              rotulo="Noites"
              valor={String(n)}
            />

            <Info
              rotulo="Diária"
              valor={moeda(
                quarto?.diaria ?? 0
              )}
            />

            <Info
              rotulo="Check-in feito em"
              valor={dataHoraBR(
                reserva.checkinEm
              )}
            />

            <Info
              rotulo="Check-out feito em"
              valor={dataHoraBR(
                reserva.checkoutEm
              )}
            />

            <div className="sm:col-span-2">
              <span className="block text-muted-foreground">
                Hóspedes
              </span>

              <span className="text-foreground">
                {reserva.hospedeIds
                  .map(
                    (hospedeId) =>
                      hospedePorId(
                        hospedeId
                      )?.nome ?? "—"
                  )
                  .join(", ")}
              </span>
            </div>

          </CardContent>
        </Card>

        {/* AÇÕES */}
        <Card className="h-fit border-mare/40 bg-mare/5">

          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Ações
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">

            {/* VALOR TOTAL */}
            <p className="font-display text-2xl font-semibold text-foreground">
              {moeda(
                (quarto?.diaria ?? 0) * n
              )}
            </p>

            {/* RESERVA CONFIRMADA */}
            {reserva.status === "Confirmada" && (
              <>
                {bloqueio && (
                  <p className="rounded-lg bg-coral/10 px-3 py-2 text-coral">
                    {bloqueio}
                  </p>
                )}

                <Button
                  className="w-full"
                  disabled={!!bloqueio}
                  onClick={() =>
                    navigate(
                      `/user/checkin/${reserva.id}`
                    )
                  }
                >
                  <LogIn className="h-4 w-4" />

                  {bloqueio
                    ? "Check-in indisponível"
                    : "Fazer check-in"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={cancelarReserva}
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar reserva
                </Button>
              </>
            )}

            {/* HOSPEDADO */}
            {reserva.status === "Hospedado" && (
              <Button
                className="w-full"
                onClick={() =>
                  navigate(
                    `/user/checkout/${reserva.id}`
                  )
                }
              >
                <LogOut className="h-4 w-4" />
                Fazer check-out
              </Button>
            )}

            {/* FINALIZADA OU CANCELADA */}
            {(reserva.status === "Finalizada" ||
              reserva.status === "Cancelada") && (
              <p className="text-muted-foreground">
                Esta reserva está encerrada.
                Nenhuma ação disponível.
              </p>
            )}

          </CardContent>
        </Card>

      </section>
    </div>
  );
}



function Info({ rotulo, valor }) {
  return (
    <div>
      <span className="block text-muted-foreground">
        {rotulo}
      </span>

      <span className="text-foreground">
        {valor}
      </span>
    </div>
  );
}

export default DetalhesReserva;