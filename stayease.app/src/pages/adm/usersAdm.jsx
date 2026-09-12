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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { createUser, deleteUser, fetchUsers, updateUser } from "../../services/usersService";

const perfis = [
  { value: "Administrador", label: "Administrador" },
  { value: "Recepção", label: "Recepção" },
  { value: "Governança", label: "Governança" },
];

const usuarioVazio = {
  id: "",
  email: "",
  perfil: "Administrador",
};

function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(usuarioVazio);
  const [busca, setBusca] = useState("");

  const carregarUsuarios = async () => {
    try {
      const dados = await fetchUsers();
      setUsuarios(dados);
    } catch {
      setUsuarios([]);
      toast.error("Não foi possível carregar os usuários.");
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return usuarios;
    return usuarios.filter((usuario) =>
      String(usuario.email).toLowerCase().includes(termo)
    );
  }, [usuarios, busca]);

  const salvarUsuario = async () => {
    if (!form.email.trim()) {
      toast.error("Informe o e-mail do usuário.");
      return;
    }

    try {
      if (form.id) {
        const atualizado = await updateUser(form.id, form);
        setUsuarios((atual) =>
          atual.map((usuario) =>
            usuario.id === atualizado.id ? atualizado : usuario
          )
        );
        toast.success("Perfil do usuário atualizado.");
      } else {
        const criado = await createUser(form);
        setUsuarios((atual) => [...atual, criado]);
        toast.success("Usuário criado.");
      }

      fecharModal();
    } catch (error) {
      toast.error(error.message || "Não foi possível salvar o usuário.");
    }
  };

  const novoUsuario = () => {
    setForm({ ...usuarioVazio, id: "" });
    setAberto(true);
  };

  const editarUsuario = (usuario) => {
    setForm({
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
    });
    setAberto(true);
  };

  const fecharModal = () => {
    setAberto(false);
    setForm(usuarioVazio);
  };

  const removerUsuario = async (id) => {
    try {
      await deleteUser(id);
      setUsuarios((atual) => atual.filter((usuario) => usuario.id !== id));
      toast.success("Usuário removido.");
    } catch (error) {
      toast.error(error.message || "Não foi possível remover o usuário.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">Usuários</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie os usuários e seus perfis de acesso.
          </p>
        </div>

        <Button onClick={novoUsuario}>
          <Plus className="h-4 w-4" />
          Novo usuário
        </Button>
      </header>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por e-mail"
            className="pl-9"
            aria-label="Buscar usuário por e-mail"
          />
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">E-mail</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Perfil</th>
                <th className="h-10 px-4 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>

            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="border-b transition-colors hover:bg-muted/50 last:border-0">
                  <td className="p-4 font-medium">{usuario.email}</td>
                  <td className="p-4">{usuario.perfil}</td>
                  <td className="p-4 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Editar ${usuario.email}`}
                      onClick={() => editarUsuario(usuario)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Excluir ${usuario.email}`}
                      onClick={() => removerUsuario(usuario.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={3} className="h-24 text-center text-muted-foreground">
                    {busca ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Editar usuário" : "Novo usuário"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                disabled={Boolean(form.id)}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Perfil de acesso</Label>
              <Select value={form.perfil} onValueChange={(valor) => setForm({ ...form, perfil: valor })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  {perfis.map((perfil) => (
                    <SelectItem key={perfil.value} value={perfil.value}>
                      {perfil.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={fecharModal}>Cancelar</Button>
            <Button onClick={salvarUsuario}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Users;
