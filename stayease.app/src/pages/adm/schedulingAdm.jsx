import { useMemo, useState } from "react";

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

import { Checkbox } from "../../components/ui/checkBox";

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


// --------------------------------------------------
// FUNÇÕES AUXILIARES
// --------------------------------------------------

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

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function dataHoraBR(data) {
  if (!data) return "—";

  const dataObj = new Date(data);

  return dataObj.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function novoId(prefixo) {
  return `${prefixo}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;
}


// --------------------------------------------------
// BADGE DE STATUS
// --------------------------------------------------

function StatusQuartoBadge({ status }) {
  const estilos = {
    Livre: "bg-green-100 text-green-700",
    Ocupado: "bg-red-100 text-red-700",
    "Limpeza Pendente": "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        estilos[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}


// --------------------------------------------------
// COMPONENTE
// --------------------------------------------------

function Reservas() {

  // --------------------------------------------------
  // MOCKS
  // --------------------------------------------------

  const [hospedes] = useState([
    {
      id: "h1",
      nome: "João da Silva",
      documento: "123.456.789-00",
      telefone: "(47) 99999-9999",
      email: "joao@email.com",
    },
    {
      id: "h2",
      nome: "Maria Oliveira",
      documento: "987.654.321-00",
      telefone: "(47) 98888-8888",
      email: "maria@email.com",
    },
    {
      id: "h3",
      nome: "Carlos Santos",
      documento: "111.222.333-44",
      telefone: "(47) 97777-7777",
      email: "carlos@email.com",
    },
  ]);

  const [quartos] = useState([
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
  ]);

  const [usuarios] = useState([
    {
      id: "u1",
      nome: "Administrador",
      perfil: "admin",
    },
    {
      id: "u2",
      nome: "Recepção",
      perfil: "recepcao",
    },
  ]);

  const [usuarioAtual] = useState(usuarios[0]);

  const [reservas, setReservas] = useState([
    {
      id: "r1",
      hospedeIds: ["h1"],
      quartoId: "q2",
      responsavelId: "u2",
      entrada: hojeISO(),
      saida: amanhaISO(),
      status: "Hospedado",
      checkinEm: new Date().toISOString(),
      checkoutEm: null,
    },
    {
      id: "r2",
      hospedeIds: ["h2", "h3"],
      quartoId: "q1",
      responsavelId: "u2",
      entrada: amanhaISO(),
      saida: "2026-09-02",
      status: "Confirmada",
      checkinEm: null,
      checkoutEm: null,
    },
  ]);


  // --------------------------------------------------
  // ESTADOS
  // --------------------------------------------------

  const [aberto, setAberto] = useState(false);

  const [consulta, setConsulta] = useState({
    entrada: hojeISO(),
    saida: amanhaISO(),
  });

  const [form, setForm] = useState({
    id: "",
    hospedeIds: [],
    quartoId: "",
    responsavelId: usuarioAtual?.id || "",
    entrada: hojeISO(),
    saida: amanhaISO(),
    status: "Confirmada",
  });

  // NOVO:
  // termo usado para buscar hóspedes dentro do modal
  const [buscaHospede, setBuscaHospede] = useState("");


  // --------------------------------------------------
  // FUNÇÕES
  // --------------------------------------------------

  const hospedePorId = (id) => {
    return hospedes.find((hospede) => hospede.id === id);
  };

  const quartoPorId = (id) => {
    return quartos.find((quarto) => quarto.id === id);
  };

  const usuarioPorId = (id) => {
    return usuarios.find((usuario) => usuario.id === id);
  };

  const conflitoDeDatas = (
    quartoId,
    entrada,
    saida,
    reservaId
  ) => {

    return reservas.some((reserva) => {

      if (reserva.id === reservaId) {
        return false;
      }

      if (reserva.quartoId !== quartoId) {
        return false;
      }

      if (reserva.status === "Cancelada") {
        return false;
      }

      return (
        entrada < reserva.saida &&
        saida > reserva.entrada
      );
    });
  };


  const quartosDisponiveis = (entrada, saida) => {

    return quartos.filter((quarto) => {

      if (quarto.status !== "Livre") {
        return false;
      }

      return !conflitoDeDatas(
        quarto.id,
        entrada,
        saida,
        null
      );
    });
  };


  const motivoBloqueioCheckin = (reserva) => {

    if (!reserva) {
      return null;
    }

    const quarto = quartoPorId(reserva.quartoId);

    if (!quarto) {
      return "Quarto não encontrado.";
    }

    if (quarto.status !== "Livre") {
      return `Quarto está com status "${quarto.status}".`;
    }

    if (reserva.entrada !== hojeISO()) {
      return "O check-in só pode ser realizado na data de entrada.";
    }

    return null;
  };


  // --------------------------------------------------
  // BUSCA DE HÓSPEDES
  // --------------------------------------------------

  const hospedesFiltrados = useMemo(() => {

    const termo = buscaHospede
      .trim()
      .toLowerCase();

    if (!termo) {
      return hospedes;
    }

    return hospedes.filter((hospede) =>
      hospede.nome.toLowerCase().includes(termo)
    );

  }, [hospedes, buscaHospede]);


  // --------------------------------------------------
  // QUARTOS DISPONÍVEIS
  // --------------------------------------------------

  const disponiveis = useMemo(() => {

    return quartosDisponiveis(
      form.entrada,
      form.saida
    );

  }, [
    form.entrada,
    form.saida,
    reservas,
  ]);


  const disponiveisConsulta = useMemo(() => {

    return quartosDisponiveis(
      consulta.entrada,
      consulta.saida
    );

  }, [
    consulta.entrada,
    consulta.saida,
    reservas,
  ]);


  // --------------------------------------------------
  // SALVAR RESERVA
  // --------------------------------------------------

  const salvar = () => {

    if (
      form.hospedeIds.length === 0 ||
      !form.quartoId
    ) {
      alert(
        "Selecione ao menos um hóspede e um quarto."
      );

      return;
    }

    if (form.saida <= form.entrada) {

      alert(
        "A data de saída deve ser posterior à entrada."
      );

      return;
    }

    const quarto = quartoPorId(form.quartoId);

    if (quarto?.status !== "Livre") {

      alert(
        "Só é possível reservar quartos com status Livre."
      );

      return;
    }

    if (
      conflitoDeDatas(
        form.quartoId,
        form.entrada,
        form.saida,
        form.id
      )
    ) {

      alert(
        "Já existe reserva para este quarto no período informado."
      );

      return;
    }

    const novaReserva = {
      ...form,

      id: form.id || novoId("r"),

      responsavelId:
        form.responsavelId ||
        usuarioAtual?.id ||
        "",

      checkinEm: null,
      checkoutEm: null,
    };

    setReservas((atual) => [
      ...atual,
      novaReserva,
    ]);

    alert("Reserva registrada.");

    setAberto(false);

    // Limpa a busca ao fechar/salvar
    setBuscaHospede("");
  };


  // --------------------------------------------------
  // HÓSPEDES
  // --------------------------------------------------

  const alternarHospede = (id) => {

    setForm((atual) => ({

      ...atual,

      hospedeIds:
        atual.hospedeIds.includes(id)

          ? atual.hospedeIds.filter(
              (hospedeId) =>
                hospedeId !== id
            )

          : [
              ...atual.hospedeIds,
              id,
            ],
    }));
  };


  // --------------------------------------------------
  // CHECK-IN
  // --------------------------------------------------

  const realizarCheckin = (reserva) => {

    const bloqueio =
      motivoBloqueioCheckin(reserva);

    if (bloqueio) {

      alert(bloqueio);

      return;
    }

    setReservas((atual) =>
      atual.map((item) =>
        item.id === reserva.id
          ? {
              ...item,
              status: "Hospedado",
              checkinEm:
                new Date().toISOString(),
            }
          : item
      )
    );

    alert("Check-in realizado.");
  };


  // --------------------------------------------------
  // CHECK-OUT
  // --------------------------------------------------

  const realizarCheckout = (reserva) => {

    setReservas((atual) =>
      atual.map((item) =>
        item.id === reserva.id
          ? {
              ...item,
              status: "Finalizada",
              checkoutEm:
                new Date().toISOString(),
            }
          : item
      )
    );

    alert(
      "Check-out concluído. Governança notificada."
    );
  };


  // --------------------------------------------------
  // CANCELAR
  // --------------------------------------------------

  const cancelarReserva = (id) => {

    setReservas((atual) =>
      atual.map((reserva) =>
        reserva.id === id
          ? {
              ...reserva,
              status: "Cancelada",
            }
          : reserva
      )
    );

    alert("Reserva cancelada.");
  };


  // --------------------------------------------------
  // REMOVER
  // --------------------------------------------------

  const removerReserva = (id) => {

    const confirmar = window.confirm(
      "Deseja realmente remover esta reserva?"
    );

    if (!confirmar) {
      return;
    }

    setReservas((atual) =>
      atual.filter(
        (reserva) =>
          reserva.id !== id
      )
    );
  };


  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (

    <div className="space-y-6">

      {/* Cabeçalho */}

      <header className="flex flex-wrap items-end justify-between gap-3">

        <div>

          <h1 className="text-3xl font-semibold text-foreground">
            Reservas
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Estadias de hóspedes e histórico.
          </p>

        </div>


        <Button
          onClick={() => {

            setForm({
              id: novoId("r"),
              hospedeIds: [],
              quartoId: "",
              responsavelId:
                usuarioAtual?.id || "",
              entrada: hojeISO(),
              saida: amanhaISO(),
              status: "Confirmada",
            });

            // Limpa a busca ao abrir
            setBuscaHospede("");

            setAberto(true);
          }}
        >

          <Plus className="h-4 w-4" />

          Nova reserva

        </Button>

      </header>


      {/* Modal */}

      <Dialog
        open={aberto}
        onOpenChange={(valor) => {

          setAberto(valor);

          if (!valor) {
            setBuscaHospede("");
          }

        }}
      >

        <DialogContent>

          <DialogHeader>

            <DialogTitle>
              Nova reserva
            </DialogTitle>

          </DialogHeader>


          <div className="grid gap-4 sm:grid-cols-2">


            {/* Entrada */}

            <div className="space-y-2">

              <Label htmlFor="entrada">
                Entrada
              </Label>

              <Input
                id="entrada"
                type="date"
                value={form.entrada}
                onChange={(e) =>
                  setForm({
                    ...form,
                    entrada:
                      e.target.value,
                    quartoId: "",
                  })
                }
              />

            </div>


            {/* Saída */}

            <div className="space-y-2">

              <Label htmlFor="saida">
                Saída
              </Label>

              <Input
                id="saida"
                type="date"
                value={form.saida}
                onChange={(e) =>
                  setForm({
                    ...form,
                    saida:
                      e.target.value,
                    quartoId: "",
                  })
                }
              />

            </div>


            {/* Hóspedes */}

            <div className="space-y-2 sm:col-span-2">

              <Label>
                Hóspedes da reserva
              </Label>


              {/* BUSCA DE HÓSPEDE */}

              <div className="relative">

                <Search
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-muted-foreground
                  "
                />

                <Input
                  value={buscaHospede}
                  onChange={(e) =>
                    setBuscaHospede(
                      e.target.value
                    )
                  }
                  placeholder="Buscar hóspede por nome"
                  className="pl-9"
                  aria-label="Buscar hóspede"
                />

              </div>


              {/* LISTA DE HÓSPEDES */}

              <div className="max-h-40 space-y-2 overflow-auto rounded-lg border border-border/70 p-3">

                {hospedesFiltrados.length > 0 ? (

                  hospedesFiltrados.map(
                    (hospede) => (

                      <label
                        key={hospede.id}
                        className="
                          flex
                          cursor-pointer
                          items-center
                          gap-2
                          rounded-md
                          px-2
                          py-1.5
                          text-sm
                          hover:bg-muted
                        "
                      >

                        <Checkbox
                          checked={form.hospedeIds.includes(
                            hospede.id
                          )}
                          onCheckedChange={() =>
                            alternarHospede(
                              hospede.id
                            )
                          }
                        />

                        <span>
                          {hospede.nome}
                        </span>

                      </label>

                    )
                  )

                ) : (

                  <p className="py-2 text-center text-sm text-muted-foreground">
                    Nenhum hóspede encontrado.
                  </p>

                )}

              </div>


              {/* CONTADOR */}

              {form.hospedeIds.length > 0 && (

                <p className="text-xs text-muted-foreground">

                  {form.hospedeIds.length}{" "}

                  {form.hospedeIds.length === 1
                    ? "hóspede selecionado"
                    : "hóspedes selecionados"}

                </p>

              )}

            </div>


            {/* Quarto */}

            <div className="space-y-2 sm:col-span-2">

              <Label>
                Quarto disponível no período
              </Label>

              <Select
                value={form.quartoId}
                onValueChange={(valor) =>
                  setForm({
                    ...form,
                    quartoId: valor,
                  })
                }
              >

                <SelectTrigger>

                  <SelectValue placeholder="Selecione o quarto" />

                </SelectTrigger>

                <SelectContent>

                  {disponiveis.map(
                    (quarto) => (

                      <SelectItem
                        key={quarto.id}
                        value={quarto.id}
                      >

                        {quarto.numero} —{" "}
                        {quarto.tipo}{" "}
                        (até{" "}
                        {quarto.capacidade})

                      </SelectItem>

                    )
                  )}

                </SelectContent>

              </Select>


              {disponiveis.length === 0 && (

                <p className="text-xs text-coral">

                  Nenhum quarto Livre e sem
                  conflito neste período.

                </p>

              )}

            </div>

          </div>


          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setAberto(false)
              }
            >
              Fechar
            </Button>

            <Button onClick={salvar}>
              Salvar reserva
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>


      {/* Consulta de disponibilidade */}

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

              <Label htmlFor="c-entrada">
                Entrada
              </Label>

              <Input
                id="c-entrada"
                type="date"
                value={consulta.entrada}
                onChange={(e) =>
                  setConsulta({
                    ...consulta,
                    entrada:
                      e.target.value,
                  })
                }
              />

            </div>


            <div className="space-y-1">

              <Label htmlFor="c-saida">
                Saída
              </Label>

              <Input
                id="c-saida"
                type="date"
                value={consulta.saida}
                onChange={(e) =>
                  setConsulta({
                    ...consulta,
                    saida:
                      e.target.value,
                  })
                }
              />

            </div>

          </div>


          <p className="text-sm text-muted-foreground">

            {disponiveisConsulta.length === 0

              ? "Nenhum quarto disponível no período."

              : `Disponíveis: ${disponiveisConsulta
                  .map(
                    (quarto) =>
                      quarto.numero
                  )
                  .join(", ")}`}

          </p>

        </CardContent>

      </Card>


      {/* Tabela */}

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>
                Hóspedes
              </TableHead>

              <TableHead>
                Quarto
              </TableHead>

              <TableHead>
                Período
              </TableHead>

              <TableHead>
                Status do quarto
              </TableHead>

              <TableHead>
                Reserva
              </TableHead>

              <TableHead>
                Check-in / Check-out
              </TableHead>

              <TableHead>
                Responsável
              </TableHead>

              <TableHead className="text-right">
                Ações
              </TableHead>

            </TableRow>

          </TableHeader>


          <TableBody>

            {reservas.map((reserva) => {

              const quarto =
                quartoPorId(
                  reserva.quartoId
                );

              const bloqueio =
                motivoBloqueioCheckin(
                  reserva
                );


              return (

                <TableRow
                  key={reserva.id}
                >

                  <TableCell className="font-medium">

                    {reserva.hospedeIds
                      .map(
                        (id) =>
                          hospedePorId(id)
                            ?.nome || "—"
                      )
                      .join(", ") || "—"}

                  </TableCell>


                  <TableCell>

                    {quarto
                      ? `${quarto.numero} — ${quarto.tipo}`
                      : "—"}

                  </TableCell>


                  <TableCell>

                    {dataBR(
                      reserva.entrada
                    )}

                    {" → "}

                    {dataBR(
                      reserva.saida
                    )}

                  </TableCell>


                  <TableCell>

                    {quarto ? (

                      <StatusQuartoBadge
                        status={quarto.status}
                      />

                    ) : (

                      "—"

                    )}

                  </TableCell>


                  <TableCell>
                    {reserva.status}
                  </TableCell>


                  <TableCell className="text-xs text-muted-foreground">

                    {dataHoraBR(
                      reserva.checkinEm
                    )}

                    {" / "}

                    {dataHoraBR(
                      reserva.checkoutEm
                    )}

                  </TableCell>


                  <TableCell className="text-sm text-muted-foreground">

                    {usuarioPorId(
                      reserva.responsavelId
                    )?.nome || "—"}

                  </TableCell>


                  <TableCell className="text-right">

                    <div className="flex items-center justify-end gap-2">

                      {reserva.status ===
                        "Confirmada" && (

                        <>

                          <Button
                            size="sm"
                            disabled={!!bloqueio}
                            onClick={() =>
                              realizarCheckin(
                                reserva
                              )
                            }
                          >
                            Check-in
                          </Button>


                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              cancelarReserva(
                                reserva.id
                              )
                            }
                          >

                            <XCircle className="h-4 w-4" />

                            Cancelar

                          </Button>

                        </>

                      )}


                      {reserva.status ===
                        "Hospedado" && (

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            realizarCheckout(
                              reserva
                            )
                          }
                        >
                          Check-out
                        </Button>

                      )}


                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Remover reserva"
                        onClick={() =>
                          removerReserva(
                            reserva.id
                          )
                        }
                      >

                        <Trash2 className="h-4 w-4 text-destructive" />

                      </Button>

                    </div>


                    {reserva.status ===
                      "Confirmada" &&
                      bloqueio && (

                        <p className="mt-1 flex items-center justify-end gap-1 text-xs text-coral">

                          <AlertTriangle className="h-3.5 w-3.5" />

                          {bloqueio}

                        </p>

                      )}

                  </TableCell>

                </TableRow>

              );

            })}


            {reservas.length === 0 && (

              <TableRow>

                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >

                  Nenhuma reserva cadastrada.

                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </div>

    </div>
  );
}

export default Reservas;