import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Check, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "../../components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

import { Badge } from "../../components/ui/badge";

import {
  createRoom,
  deleteRoom,
  fetchRooms,
  updateRoom,
} from "../../services/roomsService";
import {
  deleteRoomDailyRate,
  getRoomDailyRate,
  setRoomDailyRate,
} from "../../services/roomDailyRatesStorage";

const quartoVazio = {
  id: "",
  numero: "",
  tipo: "",
  capacidade: 2,
  diaria: 300,
  status: "Livre",
};

const moeda = (valor) => {
  if (valor === null || valor === undefined || valor === "") {
    return "R$ 0,00";
  }

  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const getStatusClass = (status) => {
  switch (status) {
    case "Livre":
      return "border-green-200 bg-green-100 text-green-700";
    case "Ocupado":
      return "border-red-200 bg-red-100 text-red-700";
    case "Limpeza Pendente":
      return "border-yellow-200 bg-yellow-100 text-yellow-700";
    default:
      return "border-gray-200 bg-gray-100 text-gray-700";
  }
};

function Quartos() {
  const [quartos, setQuartos] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(quartoVazio);

  const carregarQuartos = async () => {
    try {
      const dados = await fetchRooms();
      setQuartos(dados);
    } catch {
      setQuartos([]);
      toast.error("Não foi possível carregar os quartos.");
    }
  };

  useEffect(() => {
    carregarQuartos();
  }, []);

  const abrirNovo = () => {
    setForm({ ...quartoVazio, id: "" });
    setAberto(true);
  };

  const abrirEdicao = (quarto) => {
    const roomId = quarto.roomId ?? quarto.id;
    setForm({
      id: roomId,
      numero: quarto.numero,
      tipo: quarto.tipo,
      capacidade: quarto.capacidade,
      diaria: getRoomDailyRate(roomId) ?? quarto.diaria ?? 0,
      status: quarto.status,
    });
    setAberto(true);
  };

  const cancelar = () => {
    setAberto(false);
    setForm(quartoVazio);
  };

  const salvar = async () => {
    if (!form.numero.trim() || !form.tipo.trim()) {
      toast.error("Informe número e tipo do quarto.");
      return;
    }

    const payload = {
      numero: form.numero.trim(),
      tipo: form.tipo.trim(),
      capacidade: Number(form.capacidade),
      status: form.status,
    };

    try {
      if (form.id) {
        const atualizado = await updateRoom(form.id, payload);
        const roomId = atualizado.roomId ?? atualizado.id;
        const diaria = Number(form.diaria || 0);
        setRoomDailyRate(roomId, diaria);
        setQuartos((atual) =>
          atual.map((quarto) =>
            (quarto.roomId ?? quarto.id) === roomId
              ? { ...atualizado, diaria }
              : quarto
          )
        );
        toast.success(`Quarto ${form.numero} atualizado.`);
      } else {
        const criado = await createRoom(payload);
        const roomId = criado.roomId ?? criado.id;
        const diaria = Number(form.diaria || 0);
        setRoomDailyRate(roomId, diaria);
        setQuartos((atual) => [...atual, { ...criado, diaria }]);
        toast.success(`Quarto ${form.numero} cadastrado.`);
      }

      setAberto(false);
      setForm(quartoVazio);
    } catch (error) {
      toast.error(error.message || "Não foi possível salvar o quarto.");
    }
  };

  const removerQuarto = async (quarto) => {
    const roomId = quarto.roomId ?? quarto.id;
    const confirmar = window.confirm(`Deseja realmente remover o quarto ${quarto.numero}?`);

    if (!confirmar) return;

    try {
      await deleteRoom(roomId);
      deleteRoomDailyRate(roomId);
      setQuartos((atual) =>
        atual.filter((item) => (item.roomId ?? item.id) !== roomId)
      );
      toast.success(`Quarto ${quarto.numero} removido.`);
    } catch (error) {
      toast.error(error.message || "Não foi possível remover o quarto.");
    }
  };

  const concluirLimpeza = async (quarto) => {
    const roomId = quarto.roomId ?? quarto.id;

    try {
      await updateRoom(roomId, {
        numero: quarto.numero,
        tipo: quarto.tipo,
        capacidade: quarto.capacidade,
        status: "Livre",
      });

      setQuartos((atual) =>
        atual.map((item) =>
          (item.roomId ?? item.id) === roomId
            ? { ...item, status: "Livre" }
            : item
        )
      );
      toast.success(`Limpeza do quarto ${quarto.numero} concluída.`);
    } catch (error) {
      toast.error(error.message || "Não foi possível concluir a limpeza.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Quartos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inventário das acomodações da pousada.
          </p>
        </div>

        <Dialog open={aberto} onOpenChange={setAberto}>
          <DialogTrigger asChild>
            <Button onClick={abrirNovo}>
              <Plus className="h-4 w-4" />
              Novo quarto
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {quartos.some((quarto) => (quarto.roomId ?? quarto.id) === form.id)
                  ? "Editar quarto"
                  : "Novo quarto"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Input
                  id="tipo"
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade</Label>
                <Input
                  id="capacidade"
                  type="number"
                  min={1}
                  value={form.capacidade}
                  onChange={(e) => setForm({ ...form, capacidade: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diaria">Diária (R$)</Label>
                <Input
                  id="diaria"
                  type="number"
                  min={0}
                  value={form.diaria}
                  onChange={(e) => setForm({ ...form, diaria: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(valor) => setForm({ ...form, status: valor })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Livre">Livre</SelectItem>
                    <SelectItem value="Ocupado">Ocupado</SelectItem>
                    <SelectItem value="Limpeza Pendente">Limpeza Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={cancelar}>Cancelar</Button>
              <Button onClick={salvar}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Diária</TableHead>
              <TableHead className="min-w-[280px]">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {quartos.map((quarto) => {
              const roomId = quarto.roomId ?? quarto.id;
              const diaria = getRoomDailyRate(roomId) ?? quarto.diaria ?? 0;

              return (
                <TableRow key={roomId}>
                  <TableCell className="font-medium">{quarto.numero}</TableCell>
                  <TableCell>{quarto.tipo}</TableCell>
                  <TableCell>{quarto.capacidade}</TableCell>
                  <TableCell>{moeda(diaria)}</TableCell>

                  <TableCell className="min-w-[280px]">
                    <div className="flex items-center gap-10 whitespace-nowrap">
                      <Badge variant="outline" className={getStatusClass(quarto.status)}>
                        {quarto.status}
                      </Badge>

                      {quarto.status === "Limpeza Pendente" && (
                        <Button size="sm" variant="outline" className="h-8" onClick={() => concluirLimpeza(quarto)}>
                          <Check className="mr-1.5 h-4 w-4" />
                          Limpeza concluída
                        </Button>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" aria-label={`Editar quarto ${quarto.numero}`} onClick={() => abrirEdicao(quarto)}>
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button size="icon" variant="ghost" aria-label={`Remover quarto ${quarto.numero}`} onClick={() => removerQuarto(quarto)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}

            {quartos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum quarto cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Quartos;