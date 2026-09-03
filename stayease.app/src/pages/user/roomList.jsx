import { useState } from "react";
import { BedDouble, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

// Dados mockados
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

function hojeISO() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function somarDias(data, quantidade) {
  const resultado = new Date(`${data}T00:00:00`);
  resultado.setDate(resultado.getDate() + quantidade);

  const ano = resultado.getFullYear();
  const mes = String(resultado.getMonth() + 1).padStart(2, "0");
  const dia = String(resultado.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function noites(entrada, saida) {
  if (!entrada || !saida) return 0;

  const inicio = new Date(`${entrada}T00:00:00`);
  const fim = new Date(`${saida}T00:00:00`);

  return Math.max(
    0,
    Math.round((fim - inicio) / (1000 * 60 * 60 * 24))
  );
}

function dataBR(data) {
  if (!data) return "—";

  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

function moeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function BuscarDisponibilidade() {
  const navigate = useNavigate();

  const dataAtual = hojeISO();

  const [entrada, setEntrada] = useState(dataAtual);
  const [saida, setSaida] = useState(somarDias(dataAtual, 2));
  const [pessoas, setPessoas] = useState(2);
  const [buscou, setBuscou] = useState(false);

  const periodoValido = noites(entrada, saida) > 0;

  const resultados = periodoValido
    ? quartos.filter(
        (quarto) =>
          quarto.status === "Livre" &&
          quarto.capacidade >= pessoas
      )
    : [];

  const totalNoites = noites(entrada, saida);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-widest text-oceano">
          Área do hóspede
        </p>

        <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
          Buscar disponibilidade
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Informe o período e o número de pessoas.
        </p>
      </section>

      <Card className="border-border/70">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="entrada">Entrada</Label>

            <Input
              id="entrada"
              type="date"
              min={dataAtual}
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="saida">Saída</Label>

            <Input
              id="saida"
              type="date"
              min={entrada || dataAtual}
              value={saida}
              onChange={(e) => setSaida(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pessoas">Hóspedes</Label>

            <Input
              id="pessoas"
              type="number"
              min={1}
              value={pessoas}
              onChange={(e) =>
                setPessoas(Number(e.target.value) || 1)
              }
            />
          </div>

          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={() => setBuscou(true)}
            >
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {!periodoValido && (
        <p className="text-sm text-coral">
          A data de saída deve ser após a de entrada.
        </p>
      )}

      {buscou && periodoValido && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {resultados.length} quarto(s) disponíveis de{" "}
            {dataBR(entrada)} a {dataBR(saida)}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resultados.map((quarto) => (
              <Card
                key={quarto.id}
                className="flex flex-col border-border/70"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="font-display text-xl">
                    Quarto {quarto.numero}
                  </CardTitle>

                  <p className="text-sm text-muted-foreground">
                    {quarto.tipo}
                  </p>
                </CardHeader>

                <CardContent className="mt-auto space-y-3 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <BedDouble className="h-4 w-4" />
                      até {quarto.capacidade}
                    </span>

                    <span>
                      {moeda(quarto.diaria)} / noite
                    </span>
                  </div>

                  <p className="rounded-lg bg-mare/10 px-3 py-2 text-foreground">
                    Total {totalNoites} noite(s):{" "}
                    <strong>
                      {moeda(quarto.diaria * totalNoites)}
                    </strong>
                  </p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        navigate(
                          `/user/roomDetail/${quarto.id}?entrada=${entrada}&saida=${saida}`
                        )
                      }
                    >
                      Detalhes
                    </Button>

                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        navigate(
                          `/bookin?quarto=${quarto.id}&entrada=${entrada}&saida=${saida}`
                        )
                      }
                    >
                      Reservar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {resultados.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum quarto disponível para esse período e
                capacidade.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default BuscarDisponibilidade;