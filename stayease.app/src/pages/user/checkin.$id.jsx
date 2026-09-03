import { useEffect, useState } from "react";
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
import {
  fetchReservationById,
  checkInReservation,
} from "../../services/reservationsService";
import { fetchRoomById } from "../../services/roomsService";

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

function CheckinCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reserva, setReserva] = useState(null);
  const [quarto, setQuarto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [aceite, setAceite] = useState(false);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    async function carregarReserva() {
      try {
        const reservaApi = await fetchReservationById(id);
        setReserva(reservaApi);

        if (reservaApi?.roomId) {
          const quartoApi = await fetchRoomById(reservaApi.roomId);
          setQuarto(quartoApi);
        }
      } catch (error) {
        console.error("Erro ao carregar reserva:", error);
        setReserva(null);
      } finally {
        setCarregando(false);
      }
    }

    carregarReserva();
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
          onClick={() => navigate("/myBookin")}
        >
          Voltar às minhas reservas
        </Button>
      </div>
    );
  }

  const jaFeito = reserva.status !== "Confirmada";
  const totalNoites = noites(reserva.entrada, reserva.saida);
  const valorTotal = (quarto?.diaria ?? 0) * totalNoites;

  async function confirmar() {
    if (jaFeito || processando) return;

    try {
      setProcessando(true);

      await checkInReservation(reserva.id);

      toast.success(
        `Check-in realizado no quarto ${quarto?.numero ?? ""}. Boa estadia!`
      );

      navigate(`/user/bookinDetail/${reserva.id}`);
    } catch (error) {
      console.error("Erro ao realizar check-in:", error);
      toast.error("Não foi possível realizar o check-in.");
    } finally {
      setProcessando(false);
    }
  }

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
              Quarto {quarto?.numero ?? "—"} — {quarto?.tipo ?? "—"}
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
              {reserva.guestName || "—"}
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
            disabled={jaFeito || !aceite || processando}
            onClick={confirmar}
          >
            <LogIn className="h-4 w-4" />
            {processando ? "Realizando check-in..." : "Confirmar check-in"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default CheckinCliente;