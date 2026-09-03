import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, LogIn } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";

// Dados mockados
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

const hospedes = [
  {
    id: "h1",
    nome: "Lucas",
  },
];

// Reservas mockadas
const reservasIniciais = [
  {
    id: "r1",
    hospedeIds: ["h1"],
    quartoId: "q2",
    entrada: "2026-09-01",
    saida: "2026-09-05",
    status: "Confirmada",
  },
  {
    id: "r2",
    hospedeIds: ["h1"],
    quartoId: "q4",
    entrada: "2026-09-10",
    saida: "2026-09-13",
    status: "Confirmada",
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

  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

function noites(entrada, saida) {
  if (!entrada || !saida) return 0;

  const inicio = new Date(`${entrada}T00:00:00`);
  const fim = new Date(`${saida}T00:00:00`);

  return Math.max(
    0,
    Math.round((fim - inicio) / (1000 * 60 * 60 * 24))
  );
}

function quartoPorId(id) {
  return quartos.find((quarto) => quarto.id === id);
}

function hospedePorId(id) {
  return hospedes.find((hospede) => hospede.id === id);
}

function CheckinCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservas, setReservas] = useState(reservasIniciais);
  const [aceite, setAceite] = useState(false);

  const reserva = reservas.find((r) => r.id === id);

  if (!reserva) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold">
          Reserva não encontrada
        </h1>

        <Button
          variant="outline"
          onClick={() => navigate("/user/reservas")}
        >
          Voltar às minhas reservas
        </Button>
      </div>
    );
  }

  const quarto = quartoPorId(reserva.quartoId);

  const jaFeito = reserva.status !== "Confirmada";

  const confirmar = () => {
    if (jaFeito) return;

    setReservas((atual) =>
      atual.map((item) =>
        item.id === reserva.id
          ? {
              ...item,
              status: "Hospedado",
              checkinEm: new Date().toISOString(),
            }
          : item
      )
    );

    toast.success(
      `Check-in realizado no quarto ${quarto?.numero}. Boa estadia!`
    );

    navigate(`/user/bookinDetail/${reserva.id}`);
  };

  const totalNoites = noites(reserva.entrada, reserva.saida);

  const valorTotal = (quarto?.diaria ?? 0) * totalNoites;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => navigate(`/user/bookinDetail/${reserva.id}`)}
      >
        <ArrowLeft className="h-4 w-4" />
        Detalhes da reserva
      </Button>

      <section>
        <p className="text-sm font-medium uppercase tracking-widest text-oceano">
          Área do hóspede
        </p>

        <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
          Check-in online
        </h1>
      </section>

      <Card className="border-border/70">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">
              Quarto {quarto?.numero} — {quarto?.tipo}
            </CardTitle>

            {quarto && (
              <Badge variant="outline">
                {quarto.status}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            {dataBR(reserva.entrada)} — {dataBR(reserva.saida)} ·{" "}
            {totalNoites} noite(s) · {moeda(valorTotal)}
          </p>

          <div>
            <span className="block text-muted-foreground">
              Hóspedes
            </span>

            <span className="text-foreground">
              {reserva.hospedeIds
                .map(
                  (hospedeId) =>
                    hospedePorId(hospedeId)?.nome ?? "—"
                )
                .join(", ")}
            </span>
          </div>

          {jaFeito ? (
            <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
              Esta reserva já está com status {reserva.status}.
            </p>
          ) : (
            <div className="flex items-start gap-2 rounded-lg bg-mare/10 px-3 py-3">
              <Checkbox
                id="aceite"
                checked={aceite}
                onCheckedChange={(valor) =>
                  setAceite(valor === true)
                }
              />

              <Label
                htmlFor="aceite"
                className="text-sm font-normal leading-snug"
              >
                Confirmo que os dados acima estão corretos e aceito
                as regras da pousada (silêncio após 22h, check-out
                até as 12h).
              </Label>
            </div>
          )}

          <Button
            className="w-full"
            disabled={jaFeito || !aceite}
            onClick={confirmar}
          >
            <LogIn className="h-4 w-4" />
            Confirmar check-in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default CheckinCliente;