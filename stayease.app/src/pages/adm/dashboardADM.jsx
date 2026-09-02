import { useEffect, useMemo, useState } from "react";
import { BedDouble, Search, Sparkles } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

import {
  checkInReservation,
  checkOutReservation,
  fetchReservations,
} from "../../services/reservationsService";
import { fetchRooms, finishCleaning, updateRoom } from "../../services/roomsService";
import { getRoomDailyRate } from "../../services/roomDailyRatesStorage";

function DashboardADM() {
  const [quartos, setQuartos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");

  const filtros = ["Todos", "Livre", "Ocupado", "Limpeza Pendente"];

  const moeda = (valor) => {
    if (valor === null || valor === undefined || valor === "") {
      return "Não informada";
    }

    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const carregarDados = async () => {
    try {
      const [rooms, bookings] = await Promise.all([fetchRooms(), fetchReservations()]);
      const roomsWithRates = rooms.map((room) => ({
        ...room,
        diaria: getRoomDailyRate(room.roomId ?? room.id),
      }));

      setQuartos(roomsWithRates);
      setReservas(bookings);
    } catch {
      setQuartos([]);
      setReservas([]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return quartos.filter((quarto) => {
      const correspondeFiltro = filtro === "Todos" || quarto.status === filtro;
      const correspondeBusca =
        !termo ||
        String(quarto.numero).toLowerCase().includes(termo) ||
        String(quarto.tipo).toLowerCase().includes(termo);

      return correspondeFiltro && correspondeBusca;
    });
  }, [quartos, filtro, busca]);

  const contagem = (status) => quartos.filter((quarto) => quarto.status === status).length;

  const getHospedeAtual = (quarto) => {
    const linha = reservas.find(
      (reserva) =>
        String(reserva.roomId) === String(quarto.roomId ?? quarto.id) &&
        reserva.status === "Hospedado"
    );

    return linha?.guestName || null;
  };

  const concluirLimpeza = async (quarto) => {
    try {
      await finishCleaning(quarto.roomId ?? quarto.id, quarto);
      await carregarDados();
    } catch {
      // noop
    }
  };

  const realizarCheckin = async (quarto) => {
    const reserva = reservas.find(
      (item) =>
        String(item.roomId) === String(quarto.roomId ?? quarto.id) &&
        item.status === "Confirmada"
    );

    if (!reserva) return;

    try {
      await checkInReservation(reserva.id);
      await updateRoom(reserva.roomId, {
        numero: quarto.numero,
        tipo: quarto.tipo,
        capacidade: quarto.capacidade,
        status: "Ocupado",
      });
      await carregarDados();
    } catch {
      // noop
    }
  };

  const realizarCheckout = async (quarto) => {
    const reserva = reservas.find(
      (item) =>
        String(item.roomId) === String(quarto.roomId ?? quarto.id) &&
        item.status === "Hospedado"
    );

    if (!reserva) return;

    try {
      await checkOutReservation(reserva.id);
      await updateRoom(reserva.roomId, {
        numero: quarto.numero,
        tipo: quarto.tipo,
        capacidade: quarto.capacidade,
        status: "Limpeza Pendente",
      });
      await carregarDados();
    } catch {
      // noop
    }
  };

  const statusClasses = (status) => {
    switch (status) {
      case "Livre":
        return "bg-green-100 text-green-700";
      case "Ocupado":
        return "bg-red-100 text-red-700";
      case "Limpeza Pendente":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-widest text-oceano">Administração</p>
        <h1 className="mt-1 text-3xl font-semibold text-foreground sm:text-4xl">Painel de quartos</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Acompanhe a situação dos quartos e gerencie check-ins, check-outs e limpeza.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Livre</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="font-display text-4xl font-semibold text-foreground">{contagem("Livre")}</span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Livre</span>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ocupado</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="font-display text-4xl font-semibold text-foreground">{contagem("Ocupado")}</span>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Ocupado</span>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Limpeza Pendente</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <span className="font-display text-4xl font-semibold text-foreground">{contagem("Limpeza Pendente")}</span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">Limpeza Pendente</span>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filtros.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={filtro === item ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFiltro(item)}
            >
              {item}
            </Button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número ou tipo"
            className="pl-9"
            aria-label="Buscar quarto"
          />
        </div>
      </section>

      <section className="space-y-4">
        {lista.map((quarto) => {
          const hospedeAtual = getHospedeAtual(quarto);
          const roomId = quarto.roomId ?? quarto.id;

          return (
            <Card key={roomId} className="border-border/70">
              <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-oceano/10 text-oceano">
                    <BedDouble className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-foreground">Quarto {quarto.numero}</h2>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses(quarto.status)}`}>
                        {quarto.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {quarto.tipo} · {quarto.capacidade} pessoa(s)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Diária: {moeda(quarto.diaria)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hóspede: {hospedeAtual || "Nenhum"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quarto.status === "Limpeza Pendente" && (
                    <Button onClick={() => concluirLimpeza(quarto)} size="sm">
                      <Sparkles className="mr-1 h-4 w-4" />
                      Limpeza concluída
                    </Button>
                  )}

                  {quarto.status === "Livre" && (
                    <Button onClick={() => realizarCheckin(quarto)} variant="outline" size="sm">
                      Check-in
                    </Button>
                  )}

                  {quarto.status === "Ocupado" && (
                    <Button onClick={() => realizarCheckout(quarto)} variant="outline" size="sm">
                      Check-out
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

export default DashboardADM;
