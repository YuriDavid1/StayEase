import { useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import {
  AlertTriangle,
  CalendarSearch,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import { Button } from "../../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import { Input } from "../../components/ui/input";

import { Label } from "../../components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import { fetchGuests } from "../../services/guestsService";
import { fetchRooms } from "../../services/roomsService";
import {
  cancelReservation,
  checkInReservation,
  checkOutReservation,
  createReservation,
  fetchReservations,
} from "../../services/reservationsService";

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function amanhaISO() {
  const data = new Date();
  data.setDate(data.getDate() + 1);
  return data.toISOString().slice(0, 10);
}

function dataBR(data) {
  if (!data) return "—";
  const [ano, mes, dia] = String(data).split("-");
  return `${dia}/${mes}/${ano}`;
}

function StatusQuartoBadge({ status }) {
  const estilos = {
    Livre: "bg-green-100 text-green-700",
    Ocupado: "bg-red-100 text-red-700",
    "Limpeza Pendente": "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${estilos[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function Reservas() {
  const [hospedes, setHospedes] = useState([]);
  const [quartos, setQuartos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [consulta, setConsulta] = useState({ entrada: hojeISO(), saida: amanhaISO() });
  const [form, setForm] = useState({
    id: "",
    guestId: "",
    roomId: "",
    entrada: hojeISO(),
    saida: amanhaISO(),
  });
  const [buscaHospede, setBuscaHospede] = useState("");
  const [buscaHospedeLista, setBuscaHospedeLista] = useState("");
  const [filtroData, setFiltroData] = useState("");

  const carregarDados = async () => {
    try {
      const [guests, rooms, bookings] = await Promise.all([
        fetchGuests(),
        fetchRooms(),
        fetchReservations(),
      ]);

      setHospedes(guests);
      setQuartos(rooms);
      setReservas(bookings);
    } catch {
      setHospedes([]);
      setQuartos([]);
      setReservas([]);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const hospedePorId = (id) =>
    hospedes.find((hospede) => String(hospede.guestId ?? hospede.id) === String(id));
  const quartoPorId = (id) =>
    quartos.find((quarto) => String(quarto.roomId ?? quarto.id) === String(id));

  const conflitoDeDatas = (quartoId, entrada, saida, reservaId) => {
    return reservas.some((reserva) => {
      const itemId = reserva.reservationId ?? reserva.id;
      if (itemId === reservaId) return false;
      if (String(reserva.roomId) !== String(quartoId)) return false;
      if (reserva.status === "Cancelada") return false;
      return entrada < reserva.saida && saida > reserva.entrada;
    });
  };

  const quartosDisponiveis = (entrada, saida) => {
    return quartos.filter((quarto) => {
      if (quarto.status !== "Livre") return false;
      return !conflitoDeDatas(quarto.roomId ?? quarto.id, entrada, saida, null);
    });
  };

  const hospedesFiltrados = useMemo(() => {
    const termo = buscaHospede.trim().toLowerCase();
    if (!termo) return hospedes;
    return hospedes.filter((hospede) => String(hospede.nome).toLowerCase().includes(termo));
  }, [hospedes, buscaHospede]);

  const reservasFiltradas = useMemo(() => {
    const termo = buscaHospedeLista.trim().toLowerCase();

    return reservas.filter((reserva) => {
      const nomeHospede = (hospedePorId(reserva.guestId)?.nome || "").toLowerCase();
      const correspondeAoNome = !termo || nomeHospede.includes(termo);
      const correspondeAData = !filtroData || reserva.entrada === filtroData;
      return correspondeAoNome && correspondeAData;
    });
  }, [reservas, buscaHospedeLista, filtroData, hospedes]);

  const disponiveis = useMemo(
    () => quartosDisponiveis(form.entrada, form.saida),
    [form.entrada, form.saida, quartos, reservas]
  );

  const disponiveisConsulta = useMemo(
    () => quartosDisponiveis(consulta.entrada, consulta.saida),
    [consulta.entrada, consulta.saida, quartos, reservas]
  );

  const salvar = async () => {
    const guestId = Number(form.guestId);
    const roomId = Number(form.roomId);

    if (!guestId || !roomId) {
      toast.error("Selecione um hóspede e um quarto.");
      return;
    }

    if (form.saida <= form.entrada) {
      toast.error("A data de saída deve ser posterior à entrada.");
      return;
    }

    const quarto = quartoPorId(roomId);
    if (!quarto || quarto.status !== "Livre") {
      toast.error("Só é possível reservar quartos com status Livre.");
      return;
    }

    if (conflitoDeDatas(roomId, form.entrada, form.saida, form.id)) {
      toast.error("Já existe reserva para este quarto no período informado.");
      return;
    }

    try {
      const novaReserva = await createReservation({
        guestId,
        roomId,
        entrada: form.entrada,
        saida: form.saida,
      });

      setReservas((atual) => [...atual, novaReserva]);
      toast.success("Reserva registrada.");
      setAberto(false);
      setBuscaHospede("");
      setForm({ id: "", guestId: "", roomId: "", entrada: hojeISO(), saida: amanhaISO() });
    } catch (error) {
      toast.error(error.message || "Não foi possível registrar a reserva.");
    }
  };

  const realizarCheckin = async (reserva) => {
    const quarto = quartoPorId(reserva.roomId);
    if (quarto?.status !== "Livre") {
      toast.error(`Quarto está com status "${quarto?.status || "indefinido"}".`);
      return;
    }

    try {
      await checkInReservation(reserva.id ?? reserva.reservationId);
      setReservas((atual) =>
        atual.map((item) =>
          (item.id ?? item.reservationId) === (reserva.id ?? reserva.reservationId)
            ? { ...item, status: "Hospedado" }
            : item
        )
      );
      toast.success("Check-in realizado.");
    } catch (error) {
      toast.error(error.message || "Não foi possível realizar o check-in.");
    }
  };

  const realizarCheckout = async (reserva) => {
    try {
      await checkOutReservation(reserva.id ?? reserva.reservationId);
      setReservas((atual) =>
        atual.map((item) =>
          (item.id ?? item.reservationId) === (reserva.id ?? reserva.reservationId)
            ? { ...item, status: "Finalizada" }
            : item
        )
      );
      toast.success("Check-out concluído.");
    } catch (error) {
      toast.error(error.message || "Não foi possível realizar o check-out.");
    }
  };

  const cancelarReserva = async (id) => {
    try {
      await cancelReservation(id);
      setReservas((atual) =>
        atual.map((reserva) =>
          (reserva.id ?? reserva.reservationId) === id ? { ...reserva, status: "Cancelada" } : reserva
        )
      );
      toast.success("Reserva cancelada.");
    } catch (error) {
      toast.error(error.message || "Não foi possível cancelar a reserva.");
    }
  };

  const limparFiltros = () => {
    setBuscaHospedeLista("");
    setFiltroData("");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Reservas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Estadias de hóspedes e histórico.</p>
        </div>

        <Button
          onClick={() => {
            setForm({ id: "", guestId: "", roomId: "", entrada: hojeISO(), saida: amanhaISO() });
            setBuscaHospede("");
            setAberto(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Nova reserva
        </Button>
      </header>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova reserva</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entrada">Entrada</Label>
              <Input
                id="entrada"
                type="date"
                value={form.entrada}
                onChange={(e) => setForm({ ...form, entrada: e.target.value, roomId: "" })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="saida">Saída</Label>
              <Input
                id="saida"
                type="date"
                value={form.saida}
                onChange={(e) => setForm({ ...form, saida: e.target.value, roomId: "" })}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Hóspede da reserva</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={buscaHospede}
                  onChange={(e) => setBuscaHospede(e.target.value)}
                  placeholder="Buscar hóspede por nome"
                  className="pl-9"
                  aria-label="Buscar hóspede"
                />
              </div>

              <div className="max-h-40 space-y-2 overflow-auto rounded-lg border border-border/70 p-3">
                {hospedesFiltrados.length > 0 ? (
                  hospedesFiltrados.map((hospede) => (
                    <button
                      type="button"
                      key={hospede.id}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${form.guestId === (hospede.guestId ?? hospede.id) ? "bg-muted" : ""}`}
                      onClick={() => setForm({ ...form, guestId: hospede.guestId ?? hospede.id })}
                    >
                      <span>{hospede.nome}</span>
                      <span className="text-xs text-muted-foreground">{hospede.documento}</span>
                    </button>
                  ))
                ) : (
                  <p className="py-2 text-center text-sm text-muted-foreground">Nenhum hóspede encontrado.</p>
                )}
              </div>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Quarto disponível no período</Label>
              <Select value={form.roomId} onValueChange={(valor) => setForm({ ...form, roomId: valor })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o quarto" />
                </SelectTrigger>
                <SelectContent>
                  {disponiveis.map((quarto) => (
                    <SelectItem key={quarto.roomId ?? quarto.id} value={String(quarto.roomId ?? quarto.id)}>
                      {quarto.numero} — {quarto.tipo} (até {quarto.capacidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {disponiveis.length === 0 && (
                <p className="text-xs text-coral">Nenhum quarto Livre e sem conflito neste período.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>Fechar</Button>
            <Button onClick={salvar}>Salvar reserva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarSearch className="h-4 w-4 text-oceano" />
            Consulta de disponibilidade
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="c-entrada">Entrada</Label>
              <Input
                id="c-entrada"
                type="date"
                value={consulta.entrada}
                onChange={(e) => setConsulta({ ...consulta, entrada: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="c-saida">Saída</Label>
              <Input
                id="c-saida"
                type="date"
                value={consulta.saida}
                onChange={(e) => setConsulta({ ...consulta, saida: e.target.value })}
              />
            </div>
          </div>

          {disponiveisConsulta.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-coral" />
              Nenhum quarto disponível para esse intervalo.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {disponiveisConsulta.map((quarto) => (
                <span key={quarto.roomId ?? quarto.id} className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {quarto.numero}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lista de reservas</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={buscaHospedeLista}
                onChange={(e) => setBuscaHospedeLista(e.target.value)}
                placeholder="Buscar por hóspede"
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                aria-label="Filtrar por data"
              />
              <Button variant="outline" onClick={limparFiltros}>Limpar</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hóspede</TableHead>
                  <TableHead>Quarto</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {reservasFiltradas.map((reserva) => {
                  const quarto = quartoPorId(reserva.roomId);
                  const hospede = hospedePorId(reserva.guestId);
                  const id = reserva.id ?? reserva.reservationId;

                  return (
                    <TableRow key={id}>
                      <TableCell>{hospede?.nome || reserva.guestName || "—"}</TableCell>
                      <TableCell>
                        {quarto ? `${quarto.numero} — ${quarto.tipo}` : reserva.roomNumber || "—"}
                      </TableCell>
                      <TableCell>{dataBR(reserva.entrada)}</TableCell>
                      <TableCell>{dataBR(reserva.saida)}</TableCell>
                      <TableCell>
                        <StatusQuartoBadge status={reserva.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {reserva.status === "Confirmada" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => realizarCheckin(reserva)}>Check-in</Button>
                            <Button size="icon" variant="ghost" onClick={() => cancelarReserva(id)} aria-label="Cancelar reserva">
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </>
                        )}

                        {reserva.status === "Hospedado" && (
                          <Button size="sm" variant="outline" onClick={() => realizarCheckout(reserva)}>Check-out</Button>
                        )}

                        {reserva.status !== "Confirmada" && reserva.status !== "Hospedado" && (
                          <Button size="icon" variant="ghost" aria-label="Excluir reserva">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {reservasFiltradas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhuma reserva encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Reservas;
