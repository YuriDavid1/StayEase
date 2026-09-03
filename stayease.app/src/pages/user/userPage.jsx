import { BedDouble } from "lucide-react";

import { Button } from "../../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const hospede = {
  id: "h1",
  nome: "Lucas",
};

const quartos = [
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
  {
    id: "q5",
    numero: "301",
    tipo: "Suíte",
    capacidade: 3,
    diaria: 420,
    status: "Livre",
  },
  {
    id: "q6",
    numero: "302",
    tipo: "Suíte",
    capacidade: 4,
    diaria: 480,
    status: "Ocupado",
  },
];

const minhasReservas = [
  {
    id: "r1",
    quartoId: "q2",
    status: "Hospedado",
    entrada: "2026-09-01",
    saida: "2026-09-05",
  },
];

const moeda = (valor) => {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const dataBR = (data) => {
  if (!data) return "";

  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
};

const quartoPorId = (id) => {
  return quartos.find((quarto) => quarto.id === id);
};

function ClienteDashboard() {
  const hospedado = minhasReservas.find(
    (reserva) => reserva.status === "Hospedado"
  );

  const proxima = minhasReservas
    .filter((reserva) => reserva.status === "Confirmada")
    .sort((a, b) => a.entrada.localeCompare(b.entrada))[0];

  const livres = quartos.filter(
    (quarto) => quarto.status === "Livre"
  );

  const quartosDisponiveisParaCliente = quartos.filter(
    (quarto) => quarto.status !== "Limpeza Pendente"
  );

  const navegar = (url) => {
    window.location.href = url;
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <section>
        <p className="text-sm font-medium uppercase tracking-widest text-oceano">
          Área do hóspede
        </p>

        <h1 className="mt-1 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          Olá, {hospede?.nome?.split(" ")[0] ?? "visitante"}
        </h1>
      </section>

      {/* Estadia e resumo */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Sua estadia */}
        <Card className="border-mare/40 bg-mare/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Sua estadia
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            {hospedado ? (
              <>
                <p className="text-foreground">
                  Você está hospedado no quarto{" "}
                  <strong>
                    {quartoPorId(hospedado.quartoId)?.numero}
                  </strong>{" "}
                  até {dataBR(hospedado.saida)}.
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navegar(`/cliente/reservas/${hospedado.id}`)
                  }
                >
                  Ver detalhes
                </Button>
              </>
            ) : proxima ? (
              <>
                <p className="text-foreground">
                  Reserva confirmada no quarto{" "}
                  <strong>
                    {quartoPorId(proxima.quartoId)?.numero}
                  </strong>{" "}
                  de {dataBR(proxima.entrada)} a{" "}
                  {dataBR(proxima.saida)}.
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navegar(`/cliente/reservas/${proxima.id}`)
                  }
                >
                  Ver detalhes
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">
                Você ainda não tem reservas ativas. Que tal buscar
                uma data?
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resumo */}
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Resumo
            </CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block font-display text-3xl font-semibold text-foreground">
                {minhasReservas.length}
              </span>

              <span className="text-muted-foreground">
                Suas reservas
              </span>
            </div>

            <div>
              <span className="block font-display text-3xl font-semibold text-foreground">
                {livres.length}
              </span>

              <span className="text-muted-foreground">
                Quartos livres agora
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quartos em destaque */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Quartos em destaque
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quartosDisponiveisParaCliente
            .slice(0, 6)
            .map((quarto) => (
              <Card
                key={quarto.id}
                className="flex flex-col border-border/70"
              >
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="font-display text-xl">
                      Quarto {quarto.numero}
                    </CardTitle>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {quarto.tipo}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="mt-auto space-y-3 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="h-4 w-4" />

                      {quarto.capacidade} hóspedes
                    </span>

                    <span>
                      {moeda(quarto.diaria)} / noite
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      navegar(`/user/roomDetail/${quarto.id}`)
                    }
                  >
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </section>
    </div>
  );
}

export default ClienteDashboard;