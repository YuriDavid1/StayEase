import {
  ArrowLeft,
  BedDouble,
  Waves,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { useParams } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { useState } from "react";

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

const comodidades = [
  "Ar-condicionado",
  "Wi-Fi de alta velocidade",
  "Café da manhã incluso",
  "Enxoval de praia",
  "Frigobar",
];

const moeda = (valor) => {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const quartoPorId = (id) => {
  return quartos.find((quarto) => quarto.id === id);
};

function DetalhesQuarto() {
  const { id } = useParams();

  const quarto = quartoPorId(id);

  const [diarias, setDiarias] = useState(1);

  const navegar = (url) => {
    window.location.href = url;
  };

  if (!quarto) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-semibold">
          Quarto não encontrado
        </h1>

        <p className="text-sm text-muted-foreground">
          O quarto selecionado não está disponível para visualização.
        </p>

        <Button
          variant="outline"
          onClick={() => navegar("/cliente/buscar")}
        >
          Voltar à busca
        </Button>
      </div>
    );
  }

  /*
   * O cliente só pode realizar uma reserva
   * quando o quarto estiver Livre.
   */
  const disponivel = quarto.status === "Livre";

  const valorEstimado = quarto.diaria * diarias;

  const diminuirDiarias = () => {
    setDiarias((valorAtual) => Math.max(1, valorAtual - 1));
  };

  const aumentarDiarias = () => {
    setDiarias((valorAtual) =>
      Math.min(30, valorAtual + 1)
    );
  };

  /*
   * A nova tela de reserva recebe:
   * - o ID do quarto
   * - a quantidade de diárias
   *
   * As datas não são mais escolhidas pelo cliente.
   */
  const realizarAgendamento = () => {
    if (!disponivel) {
      return;
    }

    navegar(
      `/bookin?quarto=${quarto.id}&diarias=${diarias}`
    );
  };

  return (
    <div className="space-y-8">

      {/* Voltar */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => navegar("/cliente/buscar")}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à busca
      </Button>

      {/* Cabeçalho */}
      <section>
        <p className="text-sm font-medium uppercase tracking-widest text-oceano">
          {quarto.tipo}
        </p>

        <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
          Quarto {quarto.numero}
        </h1>
      </section>

      {/* Informações do quarto */}
      <section className="grid gap-4 md:grid-cols-[1fr_320px]">

        {/* Sobre a acomodação */}
        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Sobre a acomodação
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Acomodação {quarto.tipo.toLowerCase()} com
              ventilação natural, varanda e a brisa do mar a
              poucos passos da areia.
            </p>

            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="h-4 w-4" />
                até {quarto.capacidade} hóspedes
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Waves className="h-4 w-4" />
                200m da praia
              </span>
            </div>

            {/* Comodidades */}
            <ul className="grid gap-2 sm:grid-cols-2">
              {comodidades.map((comodidade) => (
                <li
                  key={comodidade}
                  className="rounded-lg bg-muted px-3 py-2 text-muted-foreground"
                >
                  {comodidade}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Reserva */}
        <Card className="h-fit border-mare/40 bg-mare/5">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-2xl">
              {moeda(quarto.diaria)}

              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / noite
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">

            {/* Quantidade de diárias */}
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Quantidade de diárias
              </p>

              <div className="flex items-center justify-between rounded-lg border bg-background p-2">

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={diminuirDiarias}
                  disabled={diarias <= 1}
                >
                  -
                </Button>

                <span className="font-medium">
                  {diarias}{" "}
                  {diarias === 1 ? "diária" : "diárias"}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={aumentarDiarias}
                  disabled={diarias >= 30}
                >
                  +
                </Button>

              </div>
            </div>

            {/* Valor total */}
            <p className="text-foreground">
              Total estimado:{" "}
              <strong>
                {moeda(valorEstimado)}
              </strong>
            </p>

            {disponivel ? (
              <Button
                type="button"
                className="w-full"
                onClick={realizarAgendamento}
              >
                Reservar este quarto
              </Button>
            ) : (
              <>
                <p className="rounded-lg bg-coral/10 px-3 py-2 text-coral">
                  Este quarto não está disponível para
                  agendamento no momento.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    navegar("/cliente/buscar")
                  }
                >
                  Escolher outro quarto
                </Button>
              </>
            )}

          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default DetalhesQuarto;