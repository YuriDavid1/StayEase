import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

// ==============================
// MOCK DOS QUARTOS
// ==============================

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

// ==============================
// MOCK DAS RESERVAS
// ==============================

const minhasReservas = [
  {
    id: "r1",
    quartoId: "q2",
    entrada: "2026-09-01",
    saida: "2026-09-05",
    status: "Hospedado",
  },
  {
    id: "r2",
    quartoId: "q4",
    entrada: "2026-09-10",
    saida: "2026-09-13",
    status: "Confirmada",
  },
];

// ==============================
// FUNÇÕES AUXILIARES
// ==============================

function moeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataBR(data) {
  if (!data) return "—";

  return new Date(
    `${data}T00:00:00`
  ).toLocaleDateString("pt-BR");
}

function noites(entrada, saida) {
  if (!entrada || !saida) return 0;

  const inicio = new Date(
    `${entrada}T00:00:00`
  );

  const fim = new Date(
    `${saida}T00:00:00`
  );

  const diferenca = fim - inicio;

  return Math.max(
    0,
    Math.ceil(
      diferenca / (1000 * 60 * 60 * 24)
    )
  );
}

function quartoPorId(id) {
  return quartos.find(
    (quarto) => quarto.id === id
  );
}

// ==============================
// FILTROS
// ==============================

const filtros = [
  "Todas",
  "Confirmada",
  "Hospedado",
  "Finalizada",
  "Cancelada",
];

// ==============================
// COMPONENTE
// ==============================

function MinhasReservas() {
  const navigate = useNavigate();

  const [filtro, setFiltro] = useState("Todas");

  const lista = minhasReservas
    .filter((reserva) => {
      if (filtro === "Todas") {
        return true;
      }

      return reserva.status === filtro;
    })
    .sort(
      (a, b) =>
        new Date(a.entrada) -
        new Date(b.entrada)
    );

  return (
    <div className="space-y-8">

      {/* CABEÇALHO */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-oceano">
            Minha estadia
          </p>

          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
            Minhas reservas
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Consulte suas reservas e acompanhe
            os detalhes da sua estadia.
          </p>
        </div>

        <Button
          onClick={() =>
            navigate("/cliente/buscar")
          }
        >
          <CalendarPlus className="h-4 w-4" />
          Nova reserva
        </Button>
      </section>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-2">
        {filtros.map((item) => (
          <Button
            key={item}
            variant={
              filtro === item
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() =>
              setFiltro(item)
            }
          >
            {item}
          </Button>
        ))}
      </div>

      {/* LISTA */}
      {lista.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma reserva encontrada.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {lista.map((reserva) => {
            const quarto = quartoPorId(
              reserva.quartoId
            );

            const quantidadeNoites =
              noites(
                reserva.entrada,
                reserva.saida
              );

            const valorTotal =
              (quarto?.diaria ?? 0) *
              quantidadeNoites;

            return (
              <Card
                key={reserva.id}
                className="border-border/70"
              >
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">

                    <div>
                      <CardTitle>
                        Quarto{" "}
                        {quarto?.numero ?? "—"}
                      </CardTitle>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {quarto?.tipo}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      {reserva.status}
                    </Badge>

                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">

                    <div>
                      <span className="block text-sm text-muted-foreground">
                        Entrada
                      </span>

                      <span className="text-sm font-medium">
                        {dataBR(
                          reserva.entrada
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="block text-sm text-muted-foreground">
                        Saída
                      </span>

                      <span className="text-sm font-medium">
                        {dataBR(
                          reserva.saida
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="block text-sm text-muted-foreground">
                        Valor total
                      </span>

                      <span className="text-sm font-medium">
                        {moeda(valorTotal)}
                      </span>
                    </div>

                  </div>

                  {/* BOTÃO DE DETALHES */}
                  <Button
                    variant="outline"
                    className="mt-5 w-full"
                    onClick={() =>
                      navigate(
                        `/user/bookinDetail/${reserva.id}`
                      )
                    }
                  >
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default MinhasReservas;