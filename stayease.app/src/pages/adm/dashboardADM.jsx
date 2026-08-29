import { BedDouble, Search, Sparkles } from "lucide-react";

import { Button } from "../../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { Input } from "../../components/ui/input";

function dashboardADM() {
  const quartos = [ //retirar mocks para integração com back
    {
      id: 1,
      numero: "101",
      tipo: "Standard",
      capacidade: 2,
      diaria: 180,
      status: "Livre",
    },
    {
      id: 2,
      numero: "102",
      tipo: "Standard",
      capacidade: 2,
      diaria: 180,
      status: "Ocupado",
    },
    {
      id: 3,
      numero: "201",
      tipo: "Luxo",
      capacidade: 4,
      diaria: 320,
      status: "Limpeza Pendente",
    },
  ];

  const filtros = [
    "Todos",
    "Livre",
    "Ocupado",
    "Limpeza Pendente",
  ];

  return (
    <div className="space-y-8">

      {/* Título */}
      <section>
        <h1 className="mt-1 text-3xl font-semibold text-foreground sm:text-4xl">
          Painel de quartos
        </h1>

      </section>

      {/* Resumo dos quartos */}
      <section className="grid gap-4 sm:grid-cols-3">

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Livre
            </CardTitle>
          </CardHeader>

          <CardContent className="flex items-end justify-between">
            <span className="font-display text-4xl font-semibold text-foreground">
              1
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Livre
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ocupado
            </CardTitle>
          </CardHeader>

          <CardContent className="flex items-end justify-between">
            <span className="font-display text-4xl font-semibold text-foreground">
              1
            </span>

            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              Ocupado
            </span>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Limpeza Pendente
            </CardTitle>
          </CardHeader>

          <CardContent className="flex items-end justify-between">
            <span className="font-display text-4xl font-semibold text-foreground">
              1
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
          {filtros.map((filtro) => (
            <Button
              key={filtro}
              size="sm"
              variant={filtro === "Todos" ? "default" : "outline"}
              className="rounded-full"
            >
              {filtro}
            </Button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Buscar por número ou tipo"
            className="pl-9"
            aria-label="Buscar quarto"
          />
        </div>

      </section>

      {/* Lista de quartos */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {quartos.map((quarto) => (
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
                  className={`
                    rounded-full px-3 py-1 text-xs font-medium
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

              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3">

              <div className="flex items-center justify-between text-sm text-muted-foreground">

                <span className="inline-flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4" />
                  {quarto.capacidade} hóspedes
                </span>

                <span>
                  R$ {quarto.diaria},00 / noite
                </span>

              </div>

              {quarto.status === "Ocupado" && (
                <p className="rounded-lg bg-oceano/10 px-3 py-2 text-sm text-foreground">
                  Hospedado: João da Silva
                </p>
              )}

              {quarto.status === "Limpeza Pendente" && (
                <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">
                  Check-in bloqueado.
                </p>
              )}

              <div className="mt-auto flex flex-wrap gap-2 pt-1">

                {quarto.status === "Limpeza Pendente" ? (
                  <Button size="sm">
                    <Sparkles className="h-4 w-4" />
                    Limpeza concluída
                  </Button>
                ) : quarto.status === "Ocupado" ? (
                  <Button size="sm" variant="outline">
                    Realizar check-out
                  </Button>
                ) : (
                  <Button size="sm">
                    Realizar check-in
                  </Button>
                )}

              </div>

            </CardContent>
          </Card>
        ))}

      </section>

    </div>
  );
}

export default dashboardADM;