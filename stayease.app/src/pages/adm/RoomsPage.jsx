import { useState } from "react";

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

// --------------------------------------------------
// DADOS MOCKADOS
// --------------------------------------------------

const quartosIniciais = [
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
];

// --------------------------------------------------
// QUARTO VAZIO
// --------------------------------------------------

const quartoVazio = {
  id: "",
  numero: "",
  tipo: "",
  capacidade: 2,
  diaria: 300,
  status: "Livre",
};

// --------------------------------------------------
// FUNÇÕES AUXILIARES
// --------------------------------------------------

const moeda = (valor) => {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const novoId = () => {
  return `q-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;
};

// Define as classes do Badge de acordo com o status

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

// --------------------------------------------------
// COMPONENTE
// --------------------------------------------------

function Quartos() {
  const [quartos, setQuartos] = useState(quartosIniciais);

  const [aberto, setAberto] = useState(false);

  const [form, setForm] = useState(quartoVazio);

  // --------------------------------------------------
  // ABRIR NOVO QUARTO
  // --------------------------------------------------

  const abrirNovo = () => {
    setForm({
      ...quartoVazio,
      id: novoId(),
    });

    setAberto(true);
  };

  // --------------------------------------------------
  // ABRIR EDIÇÃO
  // --------------------------------------------------

  const abrirEdicao = (quarto) => {
    setForm({
      ...quarto,
    });

    setAberto(true);
  };

  // --------------------------------------------------
  // SALVAR QUARTO
  // --------------------------------------------------

  const salvar = () => {
    if (!form.numero.trim() || !form.tipo.trim()) {
      toast.error("Informe número e tipo do quarto.");
      return;
    }

    const existe = quartos.some(
      (quarto) => quarto.id === form.id
    );

    if (existe) {
      // Editar quarto

      setQuartos((quartosAtuais) =>
        quartosAtuais.map((quarto) =>
          quarto.id === form.id
            ? {
                ...form,
                capacidade: Number(form.capacidade),
                diaria: Number(form.diaria),
              }
            : quarto
        )
      );

      toast.success(
        `Quarto ${form.numero} atualizado.`
      );
    } else {
      // Criar quarto

      setQuartos((quartosAtuais) => [
        ...quartosAtuais,
        {
          ...form,
          capacidade: Number(form.capacidade),
          diaria: Number(form.diaria),
        },
      ]);

      toast.success(
        `Quarto ${form.numero} cadastrado.`
      );
    }

    setAberto(false);
    setForm(quartoVazio);
  };

  // --------------------------------------------------
  // CANCELAR
  // --------------------------------------------------

  const cancelar = () => {
    setAberto(false);
    setForm(quartoVazio);
  };

  // --------------------------------------------------
  // REMOVER QUARTO
  // --------------------------------------------------

  const removerQuarto = (quarto) => {
    const confirmar = window.confirm(
      `Deseja realmente remover o quarto ${quarto.numero}?`
    );

    if (!confirmar) {
      return;
    }

    setQuartos((quartosAtuais) =>
      quartosAtuais.filter(
        (item) => item.id !== quarto.id
      )
    );

    toast.success(
      `Quarto ${quarto.numero} removido.`
    );
  };

  // --------------------------------------------------
  // CONCLUIR LIMPEZA
  // --------------------------------------------------

  const concluirLimpeza = (quarto) => {
    setQuartos((quartosAtuais) =>
      quartosAtuais.map((item) =>
        item.id === quarto.id
          ? {
              ...item,
              status: "Livre",
            }
          : item
      )
    );

    toast.success(
      `Limpeza do quarto ${quarto.numero} concluída. Quarto liberado.`
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
            Quartos
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Inventário das acomodações da pousada.
          </p>

        </div>

        {/* Botão novo quarto */}

        <Dialog
          open={aberto}
          onOpenChange={setAberto}
        >

          <DialogTrigger asChild>

            <Button onClick={abrirNovo}>

              <Plus className="h-4 w-4" />

              Novo quarto

            </Button>

          </DialogTrigger>

          {/* Modal */}

          <DialogContent>

            <DialogHeader>

              <DialogTitle>

                {quartos.some(
                  (quarto) =>
                    quarto.id === form.id
                )
                  ? "Editar quarto"
                  : "Novo quarto"}

              </DialogTitle>

            </DialogHeader>

            {/* Formulário */}

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Número */}

              <div className="space-y-2">

                <Label htmlFor="numero">
                  Número
                </Label>

                <Input
                  id="numero"
                  value={form.numero}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      numero: e.target.value,
                    })
                  }
                />

              </div>

              {/* Tipo */}

              <div className="space-y-2">

                <Label htmlFor="tipo">
                  Tipo
                </Label>

                <Input
                  id="tipo"
                  value={form.tipo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo: e.target.value,
                    })
                  }
                />

              </div>

              {/* Capacidade */}

              <div className="space-y-2">

                <Label htmlFor="capacidade">
                  Capacidade
                </Label>

                <Input
                  id="capacidade"
                  type="number"
                  min={1}
                  value={form.capacidade}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      capacidade: Number(
                        e.target.value
                      ),
                    })
                  }
                />

              </div>

              {/* Diária */}

              <div className="space-y-2">

                <Label htmlFor="diaria">
                  Diária (R$)
                </Label>

                <Input
                  id="diaria"
                  type="number"
                  min={0}
                  value={form.diaria}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      diaria: Number(
                        e.target.value
                      ),
                    })
                  }
                />

              </div>

              {/* Status */}

              <div className="space-y-2 sm:col-span-2">

                <Label>
                  Status
                </Label>

                <Select
                  value={form.status}
                  onValueChange={(valor) =>
                    setForm({
                      ...form,
                      status: valor,
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="Livre">
                      Livre
                    </SelectItem>

                    <SelectItem value="Ocupado">
                      Ocupado
                    </SelectItem>

                    <SelectItem value="Limpeza Pendente">
                      Limpeza Pendente
                    </SelectItem>

                  </SelectContent>

                </Select>

              </div>

            </div>

            {/* Rodapé */}

            <DialogFooter>

              <Button
                variant="outline"
                onClick={cancelar}
              >
                Cancelar
              </Button>

              <Button onClick={salvar}>
                Salvar
              </Button>

            </DialogFooter>

          </DialogContent>

        </Dialog>

      </header>

      {/* Tabela */}

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>
                Número
              </TableHead>

              <TableHead>
                Tipo
              </TableHead>

              <TableHead>
                Capacidade
              </TableHead>

              <TableHead>
                Diária
              </TableHead>

              <TableHead className="min-w-[280px]">
                Status
              </TableHead>

              <TableHead className="text-right">
                Ações
              </TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>

            {quartos.map((quarto) => (

              <TableRow key={quarto.id}>

                {/* Número */}

                <TableCell className="font-medium">
                  {quarto.numero}
                </TableCell>

                {/* Tipo */}

                <TableCell>
                  {quarto.tipo}
                </TableCell>

                {/* Capacidade */}

                <TableCell>
                  {quarto.capacidade}
                </TableCell>

                {/* Diária */}

                <TableCell>
                  {moeda(quarto.diaria)}
                </TableCell>

                {/* Status */}

                <TableCell className="min-w-[280px]">

                  <div className="flex items-center gap-10 whitespace-nowrap">

                    {/* Badge */}

                    <Badge
                      variant="outline"
                      className={getStatusClass(
                        quarto.status
                      )}
                    >
                      {quarto.status}
                    </Badge>

                    {/* Botão de concluir limpeza */}

                    {quarto.status ===
                      "Limpeza Pendente" && (

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() =>
                          concluirLimpeza(quarto)
                        }
                      >

                        <Check className="mr-1.5 h-4 w-4" />

                        Limpeza concluída

                      </Button>

                    )}

                  </div>

                </TableCell>

                {/* Ações */}

                <TableCell className="text-right">

                  {/* Editar */}

                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Editar quarto ${quarto.numero}`}
                    onClick={() =>
                      abrirEdicao(quarto)
                    }
                  >

                    <Pencil className="h-4 w-4" />

                  </Button>

                  {/* Remover */}

                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remover quarto ${quarto.numero}`}
                    onClick={() =>
                      removerQuarto(quarto)
                    }
                  >

                    <Trash2 className="h-4 w-4 text-destructive" />

                  </Button>

                </TableCell>

              </TableRow>

            ))}

            {/* Nenhum quarto */}

            {quartos.length === 0 && (

              <TableRow>

                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
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