import { useMemo, useState } from "react";
import { BedDouble, Search, Sparkles } from "lucide-react";

import { Button } from "../../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { Input } from "../../components/ui/input";

function DashboardADM() {
  // Mock dos quartos
  const [quartos, setQuartos] = useState([
    {
      id: 1,
      numero: "101",
      tipo: "Standard",
      capacidade: 2,
      diaria: 180,
      status: "Livre",
      hospede: null,
    },
    {
      id: 2,
      numero: "102",
      tipo: "Standard",
      capacidade: 2,
      diaria: 180,
      status: "Ocupado",
      hospede: "João da Silva",
    },
    {
      id: 3,
      numero: "201",
      tipo: "Luxo",
      capacidade: 4,
      diaria: 320,
      status: "Limpeza Pendente",
      hospede: null,
    },
  ]);

  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");

  const filtros = [
    "Todos",
    "Livre",
    "Ocupado",
    "Limpeza Pendente",
  ];

  // Filtra os quartos pelo status e pela busca
  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return quartos.filter((quarto) => {
      const correspondeFiltro =
        filtro === "Todos" || quarto.status === filtro;

      const correspondeBusca =
        !termo ||
        quarto.numero.toLowerCase().includes(termo) ||
        quarto.tipo.toLowerCase().includes(termo);

      return correspondeFiltro && correspondeBusca;
    });
  }, [quartos, filtro, busca]);

  // Conta quantos quartos existem em cada status
  const contagem = (status) => {
    return quartos.filter((quarto) => quarto.status === status).length;
  };

  // Formata valores para moeda brasileira
  const moeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Altera o status do quarto para Livre
  const concluirLimpeza = (id) => {
    setQuartos((quartosAtuais) =>
      quartosAtuais.map((quarto) =>
        quarto.id === id
          ? {
              ...quarto,
              status: "Livre",
            }
          : quarto
      )
    );
  };

  // Realiza o check-in
  const realizarCheckin = (id) => {
    setQuartos((quartosAtuais) =>
      quartosAtuais.map((quarto) =>
        quarto.id === id
          ? {
              ...quarto,
              status: "Ocupado",
              hospede: "Novo hóspede",
            }
          : quarto
      )
    );
  };

  // Realiza o check-out
  const realizarCheckout = (id) => {
    setQuartos((quartosAtuais) =>
      quartosAtuais.map((quarto) =>
        quarto.id === id
          ? {
              ...quarto,
              status: "Limpeza Pendente",
              hospede: null,
            }
          : quarto
      )
    );
  };

  // Retorna as classes visuais do status
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

      {/* Título */}
      <section>
        <p className="text-sm font-medium uppercase tracking-widest text-oceano">
          Administração
        </p>

        <h1 className="mt-1 text-3xl font-semibold text-foreground sm:text-4xl">
          Painel de quartos
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Acompanhe a situação dos quartos e gerencie check-ins,
          check-outs e limpeza.
        </p>
      </section>

      {/* Resumo dos quartos */}
      <section className="grid gap-4 sm:grid-cols-3">

        {/* Livres */}
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Livre
            </CardTitle>
          </CardHeader>

          <CardContent className="flex items-end justify-between">
            <span className="font-display text-4xl font-semibold text-foreground">
              {contagem("Livre")}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Livre
            </span>
          </CardContent>
        </Card>

        {/* Ocupados */}
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ocupado
            </CardTitle>
          </CardHeader>

          <CardContent className="flex items-end justify-between">
            <span className="font-display text-4xl font-semibold text-foreground">
              {contagem("Ocupado")}
            </span>

            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              Ocupado
            </span>
          </CardContent>
        </Card>

        {/* Limpeza pendente */}
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Limpeza Pendente
            </CardTitle>
          </CardHeader>

          <CardContent className="flex items-end justify-between">
            <span className="font-display text-4xl font-semibold text-foreground">
              {contagem("Limpeza Pendente")}
            </span>

            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
              Limpeza Pendente
            </span>
          </CardContent>
        </Card>

      </section>

      {/* Filtros e busca */}
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

      {/* Lista de quartos */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {lista.map((quarto) => (
          <Card
            key={quarto.id}
            className="flex flex-col border-border/70"
          >
            <CardHeader className="pb-3">

              <div className="flex items-start justify-between gap-2">

                <div>
                  <CardTitle className="font-display text-2xl">
                    Quarto {quarto.numero}
                  </CardTitle>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {quarto.tipo}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses(
                    quarto.status
                  )}`}
                >
                  {quarto.status}
                </span>

              </div>

            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3">

              {/* Informações do quarto */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">

                <span className="inline-flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4" />
                  {quarto.capacidade} hóspedes
                </span>

                <span>
                  {moeda(quarto.diaria)} / noite
                </span>

              </div>

              {/* Hóspede */}
              {quarto.status === "Ocupado" && quarto.hospede && (
                <p className="rounded-lg bg-oceano/10 px-3 py-2 text-sm text-foreground">
                  Hospedado: {quarto.hospede}
                </p>
              )}

              {/* Mensagem de limpeza */}
              {quarto.status === "Limpeza Pendente" && (
                <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">
                  Check-in bloqueado até a limpeza ser concluída.
                </p>
              )}

              {/* Ações */}
              <div className="mt-auto flex flex-wrap gap-2 pt-1">

                {quarto.status === "Limpeza Pendente" ? (
                  <Button
                    size="sm"
                    onClick={() => concluirLimpeza(quarto.id)}
                  >
                    <Sparkles className="h-4 w-4" />
                    Limpeza concluída
                  </Button>
                ) : quarto.status === "Ocupado" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => realizarCheckout(quarto.id)}
                  >
                    Realizar check-out
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => realizarCheckin(quarto.id)}
                  >
                    Realizar check-in
                  </Button>
                )}

              </div>

            </CardContent>
          </Card>
        ))}

        {/* Nenhum resultado */}
        {lista.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum quarto encontrado.
          </p>
        )}

      </section>

    </div>
  );
}

export default DashboardADM;