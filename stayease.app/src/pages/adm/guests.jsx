import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

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

const hospedeVazio = {
  id: "",
  nome: "",
  documento: "",
  telefone: "",
  email: "",
};

function Guests() {
  // Dados mockados enquanto não existe banco
  const [hospedes, setHospedes] = useState([
    {
      id: 1,
      nome: "João da Silva",
      documento: "123.456.789-00",
      telefone: "(47) 99999-1111",
      email: "joao@email.com",
    },
    {
      id: 2,
      nome: "Maria Oliveira",
      documento: "987.654.321-00",
      telefone: "(47) 98888-2222",
      email: "maria@email.com",
    },
    {
      id: 3,
      nome: "Carlos Souza",
      documento: "456.789.123-00",
      telefone: "(47) 97777-3333",
      email: "carlos@email.com",
    },
  ]);

  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(hospedeVazio);

  // Salvar ou editar hóspede
  const salvar = () => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do hóspede.");
      return;
    }

    const existe = hospedes.some(
      (hospede) => hospede.id === form.id
    );

    if (existe) {
      // Editar
      setHospedes((hospedesAtuais) =>
        hospedesAtuais.map((hospede) =>
          hospede.id === form.id
            ? form
            : hospede
        )
      );

      toast.success(`Hóspede ${form.nome} atualizado.`);
    } else {
      // Criar
      const novoHospede = {
        ...form,
        id: Date.now(),
      };

      setHospedes((hospedesAtuais) => [
        ...hospedesAtuais,
        novoHospede,
      ]);

      toast.success(`Hóspede ${form.nome} cadastrado.`);
    }

    setAberto(false);
    setForm(hospedeVazio);
  };

  // Abrir formulário para novo hóspede
  const novoHospede = () => {
    setForm({
      ...hospedeVazio,
      id: "",
    });

    setAberto(true);
  };

  // Abrir formulário para edição
  const editarHospede = (hospede) => {
    setForm({ ...hospede });
    setAberto(true);
  };

  // Excluir hóspede
  const removerHospede = (id) => {
    setHospedes((hospedesAtuais) =>
      hospedesAtuais.filter(
        (hospede) => hospede.id !== id
      )
    );

    toast.success("Hóspede removido.");
  };

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">
            Hóspedes
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os hóspedes cadastrados no sistema.
          </p>
        </div>

        <Button onClick={novoHospede}>
          <Plus className="h-4 w-4" />
          Novo hóspede
        </Button>
      </header>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="text-right">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {hospedes.map((hospede) => (
              <TableRow key={hospede.id}>
                <TableCell className="font-medium">
                  {hospede.nome}
                </TableCell>

                <TableCell>
                  {hospede.documento}
                </TableCell>

                <TableCell>
                  {hospede.telefone}
                </TableCell>

                <TableCell>
                  {hospede.email}
                </TableCell>

                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar ${hospede.nome}`}
                    onClick={() =>
                      editarHospede(hospede)
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remover ${hospede.nome}`}
                    onClick={() =>
                      removerHospede(hospede.id)
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {hospedes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum hóspede cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <Dialog
        open={aberto}
        onOpenChange={setAberto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hospedes.some(
                (hospede) => hospede.id === form.id
              )
                ? "Editar hóspede"
                : "Novo hóspede"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* Nome */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nome">
                Nome completo
              </Label>

              <Input
                id="nome"
                value={form.nome}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nome: e.target.value,
                  })
                }
              />
            </div>

            {/* Documento */}
            <div className="space-y-2">
              <Label htmlFor="documento">
                Documento
              </Label>

              <Input
                id="documento"
                value={form.documento}
                onChange={(e) =>
                  setForm({
                    ...form,
                    documento: e.target.value,
                  })
                }
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">
                Telefone
              </Label>

              <Input
                id="telefone"
                value={form.telefone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    telefone: e.target.value,
                  })
                }
              />
            </div>

            {/* E-mail */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">
                E-mail
              </Label>

              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
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

            <Button onClick={salvar}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default Guests;