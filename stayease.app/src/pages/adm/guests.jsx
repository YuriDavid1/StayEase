import { useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "../../components/ui/button";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import {
  createGuest,
  deleteGuest,
  fetchGuestReservations,
  fetchGuests,
  updateGuest,
} from "../../services/guestsService";

const hospedeVazio = {
  id: "",
  nome: "",
  documento: "",
  contato: "",
};

function Guests() {
  const [hospedes, setHospedes] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(hospedeVazio);
  const [buscaHospede, setBuscaHospede] = useState("");

  const carregarHospedes = async () => {
    try {
      const dados = await fetchGuests();
      setHospedes(dados);
    } catch {
      setHospedes([]);
      toast.error("Não foi possível carregar os hóspedes.");
    }
  };

  useEffect(() => {
    carregarHospedes();
  }, []);

  const hospedesFiltrados = useMemo(() => {
    const termo = buscaHospede.trim().toLowerCase();

    if (!termo) {
      return hospedes;
    }

    return hospedes.filter((hospede) =>
      String(hospede.nome).toLowerCase().includes(termo)
    );
  }, [hospedes, buscaHospede]);

  const salvar = async () => {
    if (!form.nome.trim() || !form.documento.trim() || !form.contato.trim()) {
      toast.error("Informe nome, documento e contato do hóspede.");
      return;
    }

    try {
      if (form.id) {
        const atualizado = await updateGuest(form.id, form);
        setHospedes((atual) =>
          atual.map((hospede) =>
            hospede.id === atualizado.id ? atualizado : hospede
          )
        );
        toast.success(`Hóspede ${form.nome} atualizado.`);
      } else {
        const criado = await createGuest(form);
        setHospedes((atual) => [...atual, criado]);
        toast.success(`Hóspede ${form.nome} cadastrado.`);
      }

      setAberto(false);
      setForm(hospedeVazio);
    } catch (error) {
      toast.error(error.message || "Não foi possível salvar o hóspede.");
    }
  };

  const novoHospede = () => {
    setForm({ ...hospedeVazio, id: "" });
    setAberto(true);
  };

  const editarHospede = (hospede) => {
    setForm({
      id: hospede.id,
      nome: hospede.nome,
      documento: hospede.documento,
      contato: hospede.contato,
    });
    setAberto(true);
  };

  const removerHospede = async (id) => {
    try {
      const reservas = await fetchGuestReservations(id);

      if (reservas.length > 0) {
        toast.error("Este hóspede possui histórico de reservas e não pode ser excluído.");
        return;
      }

      await deleteGuest(id);
      setHospedes((atual) => atual.filter((item) => item.id !== id));
      toast.success("Hóspede removido.");
    } catch (error) {
      toast.error(error.message || "Não foi possível remover o hóspede.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">Hóspedes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os hóspedes cadastrados no sistema.
          </p>
        </div>

        <Button onClick={novoHospede}>
          <Plus className="h-4 w-4" />
          Novo hóspede
        </Button>
      </header>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={buscaHospede}
          onChange={(e) => setBuscaHospede(e.target.value)}
          placeholder="Buscar hóspede por nome..."
          className="pl-9"
          aria-label="Buscar hóspede por nome"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {hospedesFiltrados.map((hospede) => (
              <TableRow key={hospede.id}>
                <TableCell className="font-medium">{hospede.nome}</TableCell>
                <TableCell>{hospede.documento}</TableCell>
                <TableCell>{hospede.contato}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar ${hospede.nome}`}
                    onClick={() => editarHospede(hospede)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remover ${hospede.nome}`}
                    onClick={() => removerHospede(hospede.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {hospedesFiltrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Nenhum hóspede encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar hóspede" : "Novo hóspede"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contato">Contato</Label>
              <Input
                id="contato"
                value={form.contato}
                onChange={(e) => setForm({ ...form, contato: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAberto(false);
                setForm(hospedeVazio);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={salvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Guests;
