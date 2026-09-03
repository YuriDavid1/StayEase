import { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

import {
  fetchReservationsByGuest,
} from "../../services/reservationsService";

import { fetchRoomById } from "../../services/roomsService";

import { fetchCurrentGuest } from "../../services/guestsService";

import { getRoomDailyRate } from "../../services/roomDailyRatesStorage";

function moeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataBR(data) {
  if (!data) return "—";

  const dataNormalizada = String(data).slice(0, 10);

  return new Date(
    `${dataNormalizada}T00:00:00`
  ).toLocaleDateString("pt-BR");
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

const filtros = [
  "Todas",
  "Confirmada",
  "Hospedado",
  "Finalizada",
  "Cancelada",
];

function MinhasReservas() {
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState("Todas");
  const [reservas, setReservas] = useState([]);
  const [quartos, setQuartos] = useState({});
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);

        const hospede = await fetchCurrentGuest();

        if (!hospede) {
          setReservas([]);
          return;
        }

        const reservasApi =
          await fetchReservationsByGuest(hospede.id);

        setReservas(reservasApi);

        const quartosCarregados = {};

        await Promise.all(
          reservasApi.map(async (reserva) => {
            if (!reserva.roomId) return;

            const quarto = await fetchRoomById(
              reserva.roomId
            );

            if (quarto) {
              quartosCarregados[
                reserva.roomId
              ] = quarto;
            }
          })
        );

        setQuartos(quartosCarregados);
      } catch (error) {
        console.error(
          "Erro ao carregar reservas:",
          error
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const lista = reservas
    .filter((reserva) => {
      if (filtro === "Todas") {
        return true;
      }

      return reserva.status === filtro;
    })
    .sort(
      (a, b) =>
        new Date(a.entrada) -
        new Date(b.entrada)
    );

  if (carregando) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold">
          Carregando reservas...
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Cabeçalho */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-oceano">
            Minha estadia
          </p>

          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
            Minhas reservas
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Consulte suas reservas e acompanhe
            os detalhes da sua estadia.
          </p>
        </div>

        <Button
          onClick={() =>
            navigate("/roomList")
          }
        >
          <CalendarPlus className="h-4 w-4" />
          Nova reserva
        </Button>
      </section>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {filtros.map((item) => (
          <Button
            key={item}
            variant={
              filtro === item
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() =>
              setFiltro(item)
            }
          >
            {item}
          </Button>
        ))}
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma reserva encontrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {lista.map((reserva) => {
            const quarto =
              quartos[reserva.roomId];

const entrada =
  reserva.entrada ||
  reserva.scheduledCheckIn ||
  "";

const saida =
  reserva.saida ||
  reserva.scheduledCheckOut ||
  "";

const quantidadeNoites =
  noites(entrada, saida);

const diariaSalva = getRoomDailyRate(reserva.roomId);

const diaria = Number.isFinite(Number(quarto?.diaria))
  ? Number(quarto.diaria)
  : Number.isFinite(Number(diariaSalva))
    ? Number(diariaSalva)
    : 0;


const valorTotal =
  diaria * quantidadeNoites;

console.log("DEBUG MYBOOKIN:", {
  reserva,
  quarto,
  entrada,
  saida,
  quantidadeNoites,
  diaria,
  valorTotal: diaria * quantidadeNoites,
});

            return (
              <Card
                key={reserva.id}
                className="border-border/70"
              >
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">

                    <div>
                      <CardTitle>
                        Quarto{" "}
                        {quarto?.numero ?? "—"}
                      </CardTitle>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {quarto?.tipo}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      {reserva.status}
                    </Badge>

                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">

                    <div>
                      <span className="block text-sm text-muted-foreground">
                        Entrada
                      </span>

                      <span className="text-sm font-medium">
                        {dataBR(
                          entrada
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="block text-sm text-muted-foreground">
                        Saída
                      </span>

                      <span className="text-sm font-medium">
                        {dataBR(
                          saida
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="block text-sm text-muted-foreground">
                        Valor total
                      </span>

                      <span className="text-sm font-medium">
                        {moeda(valorTotal)}
                      </span>
                    </div>

                  </div>

                  {/* Detalhes */}
                  <Button
                    variant="outline"
                    className="mt-5 w-full"
                    onClick={() =>
                      navigate(
                        `/user/bookinDetail/${reserva.id}`
                      )
                    }
                  >
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default MinhasReservas;