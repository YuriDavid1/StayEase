import { useState } from "react";

import {
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

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
    value: "cliente",
    label: "Usuário comum",
  },
];

const usuarioVazio = {
  id: "",
  nome: "",
  email: "",
  senha: "",
  perfil: "cliente",
  ativo: true,
};

function Users() {
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nome: "Administrador",
      email: "admin@stayease.com",
      senha: "123456",
      perfil: "admin",
      ativo: true,
    },
    {
      id: 2,
      nome: "Recepção",
      email: "recepcao@stayease.com",
      senha: "123456",
      perfil: "recepcao",
      ativo: true,
    },
    {
      id: 3,
      nome: "Cliente",
      email: "cliente@stayease.com",
      senha: "123456",
      perfil: "cliente",
      ativo: true,
    },
  ]);

  // Usuário atualmente logado - mock
  const [usuarioAtual] = useState({
    id: 1,
  });

  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(usuarioVazio);

  // Busca por nome
  const [busca, setBusca] = useState("");

  // Filtra os usuários pelo nome
  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // Salvar ou atualizar usuário
  const salvarUsuario = () => {
    if (
      !form.nome.trim() ||
      !form.email.trim() ||
      !form.senha.trim()
    ) {
      alert("Preencha nome, e-mail e senha.");
      return;
    }

    // Verifica se o e-mail já está sendo utilizado
    const emailExiste = usuarios.some(
      (usuario) =>
        usuario.email.toLowerCase() ===
          form.email.toLowerCase() &&
        usuario.id !== form.id
    );

    if (emailExiste) {
      alert("Já existe uma conta utilizando este e-mail.");
      return;
    }

    // Verifica se é uma edição
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

      alert(`Conta de ${form.nome} atualizada.`);
    } else {
      // Cria novo usuário
      const novoUsuario = {
        ...form,
        id: usuarios.length + 1,
      };

      setUsuarios([...usuarios, novoUsuario]);

      alert(`Conta de ${form.nome} criada.`);
    }

    fecharModal();
  };

  // Abrir modal para novo usuário
  const novoUsuario = () => {
    setForm({
      ...usuarioVazio,
      id: "",
      ativo: true,
    });

    setAberto(true);
  };

  // Abrir modal para edição
  const editarUsuario = (usuario) => {
    setForm({
      ...usuario,
    });

    setAberto(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setAberto(false);
    setForm(usuarioVazio);
  };

  // Excluir usuário
  const removerUsuario = (id) => {
    if (id === usuarioAtual.id) {
      alert(
        "Você não pode excluir a conta atualmente logada."
      );
      return;
    }

    const usuario = usuarios.find(
      (usuario) => usuario.id === id
    );

    if (!usuario) {
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente excluir a conta de ${usuario.nome}?`
    );

    if (!confirmar) {
      return;
    }

    setUsuarios(
      usuarios.filter((usuario) => usuario.id !== id)
    );

    alert("Conta excluída.");
  };

  // Ativar / desativar usuário
  const alternarStatus = (id) => {
    if (id === usuarioAtual.id) {
      alert(
        "Você não pode desativar a conta atualmente logada."
      );
      return;
    }

    setUsuarios(
      usuarios.map((usuario) =>
        usuario.id === id
          ? {
              ...usuario,
              ativo: !usuario.ativo,
            }
          : usuario
      )
    );
  };

  // Retorna o nome amigável do perfil
  const nomePerfil = (perfil) => {
    const encontrado = perfis.find(
      (item) => item.value === perfil
    );

    return encontrado
      ? encontrado.label
      : perfil;
  };

  const editando = usuarios.some(
    (usuario) => usuario.id === form.id
  );

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">
            Contas de usuários
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as contas de acesso ao sistema e seus
            respectivos perfis.
          </p>
        </div>

        <Button onClick={novoUsuario}>
          <Plus className="h-4 w-4" />
          Nova conta
        </Button>
      </header>

      {/* Busca */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome"
            className="pl-9"
            aria-label="Buscar usuário por nome"
          />
        </div>
      </section>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead>
              <tr className="border-b">

                <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                  Nome
                </th>

                <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                  E-mail
                </th>

                <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                  Perfil
                </th>

                <th className="h-10 px-4 text-left font-medium text-muted-foreground">
                  Status
                </th>

                <th className="h-10 px-4 text-right font-medium text-muted-foreground">
                  Ações
                </th>

              </tr>
            </thead>

            <tbody>

              {usuariosFiltrados.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="border-b transition-colors hover:bg-muted/50 last:border-0"
                >

                  <td className="p-4 font-medium">
                    {usuario.nome}
                  </td>

                  <td className="p-4 text-muted-foreground">
                    {usuario.email}
                  </td>

                  <td className="p-4">
                    {nomePerfil(usuario.perfil)}
                  </td>

                  <td className="p-4">
                    <span
                      className={
                        usuario.ativo
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
                      }
                    >
                      {usuario.ativo
                        ? "Ativa"
                        : "Inativa"}
                    </span>
                  </td>

                  <td className="p-4 text-right">

                    {/* Editar */}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Editar ${usuario.nome}`}
                      onClick={() =>
                        editarUsuario(usuario)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* Ativar / desativar */}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={
                        usuario.ativo
                          ? `Desativar ${usuario.nome}`
                          : `Ativar ${usuario.nome}`
                      }
                      disabled={
                        usuario.id === usuarioAtual.id
                      }
                      onClick={() =>
                        alternarStatus(usuario.id)
                      }
                    >
                      {usuario.ativo ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Excluir */}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Excluir ${usuario.nome}`}
                      disabled={
                        usuario.id === usuarioAtual.id
                      }
                      onClick={() =>
                        removerUsuario(usuario.id)
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>

                  </td>
                </tr>
              ))}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {busca
                      ? "Nenhum usuário encontrado."
                      : "Nenhuma conta cadastrada."}
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de criação/edição */}
      <Dialog
        open={aberto}
        onOpenChange={setAberto}
      >
        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              {editando
                ? "Editar conta"
                : "Nova conta de usuário"}
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
                placeholder="Nome do usuário"
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
                placeholder="usuario@stayease.com"
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
                placeholder="Senha da conta"
              />
            </div>

            {/* Perfil */}
            <div className="space-y-2">
              <Label>
                Perfil de acesso
              </Label>

              <Select
                value={form.perfil}
                onValueChange={(valor) =>
                  setForm({
                    ...form,
                    perfil: valor,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
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

            {/* Status */}
            <div className="space-y-2">
              <Label>
                Status da conta
              </Label>

              <Select
                value={
                  form.ativo
                    ? "ativa"
                    : "inativa"
                }
                onValueChange={(valor) =>
                  setForm({
                    ...form,
                    ativo: valor === "ativa",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ativa">
                    Ativa
                  </SelectItem>

                  <SelectItem value="inativa">
                    Inativa
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <DialogFooter>

            <Button
              variant="outline"
              onClick={fecharModal}
            >
              Cancelar
            </Button>

            <Button onClick={salvarUsuario}>
              {editando
                ? "Salvar alterações"
                : "Criar conta"}
            </Button>

          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  );
}

export default Users;