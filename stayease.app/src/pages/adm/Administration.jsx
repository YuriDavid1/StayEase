import { useState } from "react";
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

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

const perfis = [
  {
    value: "admin",
    label: "Administrador",
  },
  {
    value: "recepcao",
    label: "Recepção",
  },
  {
    value: "governanca",
    label: "Governança",
  },
];

const statusOpcoes = [
  "Livre",
  "Ocupado",
  "Limpeza Pendente",
];

const usuariosIniciais = [
  {
    id: 1,
    nome: "Administrador",
    email: "admin@maremansa.com",
    senha: "123456",
    perfil: "admin",
  },
  {
    id: 2,
    nome: "João Silva",
    email: "joao@maremansa.com",
    senha: "123456",
    perfil: "recepcao",
  },
  {
    id: 3,
    nome: "Maria Santos",
    email: "maria@maremansa.com",
    senha: "123456",
    perfil: "governanca",
  },
];

const quartosIniciais = [
  {
    id: 1,
    numero: "101",
    tipo: "Standard",
    status: "Livre",
  },
  {
    id: 2,
    numero: "102",
    tipo: "Standard",
    status: "Ocupado",
  },
  {
    id: 3,
    numero: "201",
    tipo: "Luxo",
    status: "Limpeza Pendente",
  },
];

const usuarioVazio = {
  id: null,
  nome: "",
  email: "",
  senha: "",
  perfil: "recepcao",
};

function AdminPage() {
  const [usuarios, setUsuarios] = useState(usuariosIniciais);
  const [quartos, setQuartos] = useState(quartosIniciais);

  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(usuarioVazio);

  // Abre formulário para add usuário
  const handleNovoUsuario = () => {
    setForm({
      ...usuarioVazio,
      id: Date.now(),
    });

    setAberto(true);
  };

  // Abre o formulário de usuário
  const handleEditarUsuario = (usuario) => {
    setForm({ ...usuario });
    setAberto(true);
  };

  // Exclui usuário
  const handleExcluirUsuario = (id) => {
    setUsuarios(
      usuarios.filter((usuario) => usuario.id !== id)
    );
  };

  // Salva ou atualiza usuário
  const handleSalvarUsuario = () => {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      return;
    }

    const usuarioExistente = usuarios.some(
      (usuario) => usuario.id === form.id
    );

    if (usuarioExistente) {
      setUsuarios(
        usuarios.map((usuario) =>
          usuario.id === form.id
            ? { ...form }
            : usuario
        )
      );
    } else {
      setUsuarios([
        ...usuarios,
        {
          ...form,
          id: Date.now(),
        },
      ]);
    }

    setAberto(false);
    setForm(usuarioVazio);
  };

  // Atualiza status do quarto
  const handleStatusChange = (id, status) => {
    setQuartos(
      quartos.map((quarto) =>
        quarto.id === id
          ? { ...quarto, status }
          : quarto
      )
    );
  };

  const getPerfilLabel = (perfil) => {
    const encontrado = perfis.find(
      (item) => item.value === perfil
    );

    return encontrado?.label || perfil;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="mt-1 text-3xl font-semibold text-foreground">
          Administração
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Gestão de usuários do sistema e atualização manual
          do status dos quartos.
        </p>
      </header>

      <Tabs defaultValue="usuarios">

        <TabsList>
          <TabsTrigger value="usuarios">
            Usuários
          </TabsTrigger>

          <TabsTrigger value="status">
            Status dos quartos
          </TabsTrigger>
        </TabsList>

        {/* Usuários */}

        <TabsContent
          value="usuarios"
          className="space-y-4"
        >

          {/* novo usuário */}
          <div className="flex justify-end">

            <Button onClick={handleNovoUsuario}>
              <Plus className="h-4 w-4" />
              Novo usuário
            </Button>

          </div>

          {/* Tabela */}
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">

            <Table>

              <TableHeader>
                <TableRow>

                  <TableHead>
                    Nome
                  </TableHead>

                  <TableHead>
                    E-mail
                  </TableHead>

                  <TableHead>
                    Perfil
                  </TableHead>

                  <TableHead className="text-right">
                    Ações
                  </TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>

                {usuarios.map((usuario) => (

                  <TableRow key={usuario.id}>

                    <TableCell className="font-medium">
                      {usuario.nome}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {usuario.email}
                    </TableCell>

                    <TableCell>
                      {getPerfilLabel(usuario.perfil)}
                    </TableCell>

                    <TableCell className="text-right">

                      {/* Editar */}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Editar ${usuario.nome}`}
                        onClick={() =>
                          handleEditarUsuario(usuario)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      {/* Excluir */}
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Excluir ${usuario.nome}`}
                        onClick={() =>
                          handleExcluirUsuario(usuario.id)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </div>

        </TabsContent>

        {/* Quartos*/}

        <TabsContent value="status">

          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">

            <Table>

              <TableHeader>
                <TableRow>

                  <TableHead>
                    Quarto
                  </TableHead>

                  <TableHead>
                    Tipo
                  </TableHead>

                  <TableHead>
                    Status atual
                  </TableHead>

                  <TableHead className="w-56">
                    Atualizar status
                  </TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>

                {quartos.map((quarto) => (

                  <TableRow key={quarto.id}>

                    <TableCell className="font-medium">
                      {quarto.numero}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {quarto.tipo}
                    </TableCell>

                    <TableCell>

                      <span
                        className={`
                          inline-flex rounded-full px-3 py-1 text-xs font-medium
                          ${
                            quarto.status === "Livre"
                              ? "bg-green-100 text-green-700"
                              : quarto.status === "Ocupado"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        `}
                      >
                        {quarto.status}
                      </span>

                    </TableCell>

                    <TableCell>

                      <Select
                        value={quarto.status}
                        onValueChange={(status) =>
                          handleStatusChange(
                            quarto.id,
                            status
                          )
                        }
                      >

                        <SelectTrigger
                          aria-label={`Status do quarto ${quarto.numero}`}
                        >
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>

                          {statusOpcoes.map((status) => (

                            <SelectItem
                              key={status}
                              value={status}
                            >
                              {status}
                            </SelectItem>

                          ))}

                        </SelectContent>

                      </Select>

                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </div>

        </TabsContent>

      </Tabs>

      {/* Modal de usuários */}

      <Dialog
        open={aberto}
        onOpenChange={setAberto}
      >

        <DialogContent>

          <DialogHeader>

            <DialogTitle>
              {form.id
                ? "Editar usuário"
                : "Novo usuário"}
            </DialogTitle>

          </DialogHeader>

          <div className="grid gap-4">

            {/* Nome */}
            <div className="space-y-2">

              <Label htmlFor="nome">
                Nome
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

            {/* E-mail */}
            <div className="space-y-2">

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

            {/* Senha */}
            <div className="space-y-2">

              <Label htmlFor="senha">
                Senha
              </Label>

              <Input
                id="senha"
                type="password"
                value={form.senha}
                onChange={(e) =>
                  setForm({
                    ...form,
                    senha: e.target.value,
                  })
                }
              />

            </div>

            {/* Perfil */}
            <div className="space-y-2">

              <Label>
                Perfil de acesso
              </Label>

              <Select
                value={form.perfil}
                onValueChange={(perfil) =>
                  setForm({
                    ...form,
                    perfil,
                  })
                }
              >

                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>

                  {perfis.map((perfil) => (

                    <SelectItem
                      key={perfil.value}
                      value={perfil.value}
                    >
                      {perfil.label}
                    </SelectItem>

                  ))}

                </SelectContent>

              </Select>

            </div>

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => {
                setAberto(false);
                setForm(usuarioVazio);
              }}
            >
              Cancelar
            </Button>

            <Button onClick={handleSalvarUsuario}>
              Salvar
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
}

export default AdminPage;