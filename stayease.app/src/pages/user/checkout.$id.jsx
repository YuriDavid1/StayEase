import { useEffect, useState } from "react";
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

import {
  fetchReservationById,
  checkOutReservation,
} from "../../services/reservationsService";

import { fetchRoomById } from "../../services/roomsService";

import { getRoomDailyRate } from "../../services/roomDailyRatesStorage";

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

function CheckoutCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reserva, setReserva] = useState(null);
  const [quarto, setQuarto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);

        const reservaApi = await fetchReservationById(id);

        if (!reservaApi) {
          setReserva(null);
          return;
        }

        setReserva(reservaApi);

        const quartoApi = await fetchRoomById(
          reservaApi.roomId
        );

        setQuarto(quartoApi);
      } catch (error) {
        console.error(
          "Erro ao carregar reserva:",
          error
        );

        toast.error(
          "Não foi possível carregar a reserva."
        );

        setReserva(null);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id]);

  if (carregando) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold">
          Carregando reserva...
        </h1>
      </div>
    );
  }

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

  const n = noites(
    reserva.entrada,
    reserva.saida
  );

  const diaria =
    quarto?.diaria ??
    getRoomDailyRate(reserva.roomId) ??
    0;

  // Taxa de serviço de 5%
  const taxa = Math.round(
    diaria * n * 0.05
  );

  const total = diaria * n + taxa;

  // Check-out somente pode ser feito
  // quando a reserva estiver hospedada
  const disponivel =
    reserva.status === "Hospedado";

  async function finalizarCheckout() {
    if (!disponivel || processando) {
      return;
    }

    try {
      setProcessando(true);

      await checkOutReservation(reserva.id);

      toast.success(
        "Check-out concluído. Obrigado pela visita!"
      );

      navigate(
        `/user/bookinDetail/${reserva.id}`
      );
    } catch (error) {
      console.error(
        "Erro ao realizar check-out:",
        error
      );

      toast.error(
        "Não foi possível realizar o check-out."
      );
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      {/* Retorna para detalhes */}
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

      {/* Cabeçalho */}
      <section>
        <p className="text-sm font-medium uppercase tracking-widest text-oceano">
          Área do hóspede
        </p>

        <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
          Check-out
        </h1>
      </section>

      {/* Extrato */}
      <Card className="border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Extrato — Quarto{" "}
            {quarto?.numero}{" "}
            ({quarto?.tipo})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">

          {/* Diárias */}
          <Linha
            rotulo={`Diárias (${n} x ${moeda(
              diaria
            )})`}
            valor={moeda(diaria * n)}
          />

          {/* Taxa */}
          <Linha
            rotulo="Taxa de serviço (5%)"
            valor={moeda(taxa)}
          />

          {/* Total */}
          <div className="flex items-center justify-between border-t border-border/70 pt-3">
            <span className="font-medium text-foreground">
              Total
            </span>

            <span className="font-display text-2xl font-semibold text-foreground">
              {moeda(total)}
            </span>
          </div>

          {/* Período */}
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

          {/* Checkout */}
          <Button
            className="w-full"
            disabled={!disponivel || processando}
            onClick={finalizarCheckout}
          >
            <LogOut className="h-4 w-4" />
            {processando
              ? "Realizando check-out..."
              : "Finalizar check-out"}
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