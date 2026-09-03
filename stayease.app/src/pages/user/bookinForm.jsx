import { useState } from "react";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// -----------------------------------------------------------------------------
// MOCKS
// -----------------------------------------------------------------------------

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

const hospede = {
  id: "h1",
  nome: "Lucas",
};

const usuarioAtual = {
  id: "u1",
};

const hospedeId = "h1";

// -----------------------------------------------------------------------------
// FUNÇÕES AUXILIARES
// -----------------------------------------------------------------------------

const moeda = (valor) => {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const novoId = (prefixo) => {
  return `${prefixo}${Date.now()}`;
};

const hojeISO = () => {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
};

// -----------------------------------------------------------------------------
// COMPONENTE
// -----------------------------------------------------------------------------

function BookinForm() {
  const navigate = useNavigate();

  /*
   * Lê o quarto enviado pela tela de detalhes.
   *
   * Exemplo:
   *
   * /bookin?quarto=q1
   */
  const parametros = new URLSearchParams(
    window.location.search
  );

  const quartoParametro = parametros.get("quarto");

  /*
   * Se o cliente veio da tela de detalhes,
   * o quarto já fica selecionado.
   *
   * Se veio pelo Header, começa sem quarto.
   */
  const [quartoId, setQuartoId] = useState(
    quartoParametro ?? ""
  );

  /*
   * Datas escolhidas pelo cliente.
   */
  const [entrada, setEntrada] = useState("");
  const [saida, setSaida] = useState("");

  const [observacao, setObservacao] = useState("");

  /*
   * Procura o quarto selecionado.
   */
  const quarto = quartos.find(
    (q) => q.id === quartoId
  );

  /*
   * Apenas quartos LIVRES podem aparecer
   * para o cliente realizar uma reserva.
   */
  const quartosDisponiveis = quartos.filter(
    (q) => q.status === "Livre"
  );

  // ---------------------------------------------------------------------------
  // CALCULAR DIÁRIAS
  // ---------------------------------------------------------------------------

  const calcularDiarias = () => {
    if (!entrada || !saida) {
      return 0;
    }

    const dataEntrada = new Date(
      `${entrada}T00:00:00`
    );

    const dataSaida = new Date(
      `${saida}T00:00:00`
    );

    const diferenca =
      dataSaida.getTime() -
      dataEntrada.getTime();

    return Math.ceil(
      diferenca / (1000 * 60 * 60 * 24)
    );
  };

  const diarias = calcularDiarias();

  /*
   * Calcula o valor total:
   *
   * preço da diária × quantidade de diárias
   */
  const valorTotal = quarto
    ? quarto.diaria * diarias
    : 0;

  /*
   * Data mínima para check-in.
   */
  const dataMinima = hojeISO();

  /*
   * O formulário só pode ser enviado se:
   *
   * - houver quarto;
   * - quarto estiver Livre;
   * - check-in estiver preenchido;
   * - check-out estiver preenchido;
   * - check-out for posterior ao check-in.
   */
  const invalido =
    !quarto ||
    quarto.status !== "Livre" ||
    !entrada ||
    !saida ||
    diarias <= 0;

  // ---------------------------------------------------------------------------
  // CONFIRMAR RESERVA
  // ---------------------------------------------------------------------------

  const confirmar = (e) => {
    e.preventDefault();

    if (!quarto || !hospedeId || !usuarioAtual) {
      return;
    }

    /*
     * Segunda validação da regra de negócio.
     *
     * Mesmo que alguém tente alterar a URL manualmente,
     * o sistema não permite reservar um quarto que não
     * esteja Livre.
     */
    if (quarto.status !== "Livre") {
      toast.error(
        "Este quarto não está disponível para reserva."
      );

      return;
    }

    /*
     * Verifica se as datas foram preenchidas.
     */
    if (!entrada || !saida) {
      toast.error(
        "Informe as datas de check-in e check-out."
      );

      return;
    }

    /*
     * O check-out precisa ser posterior
     * ao check-in.
     */
    if (diarias <= 0) {
      toast.error(
        "A data de check-out deve ser posterior à data de check-in."
      );

      return;
    }

    const id = novoId("r");

    const reserva = {
      id,
      hospedeIds: [hospedeId],
      quartoId: quarto.id,
      responsavelId: usuarioAtual.id,

      // Datas escolhidas pelo cliente
      entrada,
      saida,

      // Calculado automaticamente
      diarias,

      // Calculado automaticamente
      valorTotal,

      status: "Confirmada",

      observacao,
    };

    /*
     * Aqui você pode substituir pelo dispatch do seu store
     * quando ele estiver disponível.
     */
    console.log("Reserva criada:", reserva);

    toast.success(
      `Reserva confirmada no quarto ${quarto.numero}.`
    );

    /*
     * Depois de salvar a reserva, vai para os detalhes
     * da reserva criada.
     */
    navigate(`/cliente/reservas/${id}`);
  };

  return (
    <div className="space-y-8">

      {/* Cabeçalho */}
      <section>
        <p className="text-sm font-medium uppercase tracking-widest text-oceano">
          Área do hóspede
        </p>

        <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">
          Nova reserva
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Reserva em nome de{" "}
          <strong>
            {hospede?.nome ?? "—"}
          </strong>
        </p>
      </section>

      <form
        className="grid gap-4 md:grid-cols-[1fr_320px]"
        onSubmit={confirmar}
      >

        {/* ------------------------------------------------------------------ */}
        {/* DADOS DA ESTADIA */}
        {/* ------------------------------------------------------------------ */}

        <Card className="border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Dados da estadia
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2">

            {/* Quarto */}
            <div className="space-y-2 sm:col-span-2">
              <Label>Quarto</Label>

              <Select
                value={quartoId}
                onValueChange={setQuartoId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um quarto" />
                </SelectTrigger>

                <SelectContent>
                  {quartosDisponiveis.map((q) => (
                    <SelectItem
                      key={q.id}
                      value={q.id}
                    >
                      {q.numero} — {q.tipo} (
                      {moeda(q.diaria)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Check-in */}
            <div className="space-y-2">
              <Label htmlFor="entrada">
                Check-in
              </Label>

              <Input
                id="entrada"
                type="date"
                min={dataMinima}
                value={entrada}
                onChange={(e) =>
                  setEntrada(e.target.value)
                }
              />
            </div>

            {/* Check-out */}
            <div className="space-y-2">
              <Label htmlFor="saida">
                Check-out
              </Label>

              <Input
                id="saida"
                type="date"
                min={entrada || dataMinima}
                value={saida}
                onChange={(e) =>
                  setSaida(e.target.value)
                }
              />
            </div>

            {/* Observações */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="obs">
                Observações (opcional)
              </Label>

              <Input
                id="obs"
                value={observacao}
                onChange={(e) =>
                  setObservacao(e.target.value)
                }
                placeholder="Ex.: chegada após as 22h"
              />
            </div>

          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* RESUMO */}
        {/* ------------------------------------------------------------------ */}

        <Card className="h-fit border-mare/40 bg-mare/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Resumo
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">

            {/* Quarto */}
            <p className="text-muted-foreground">
              {quarto
                ? `Quarto ${quarto.numero} — ${quarto.tipo}`
                : "Nenhum quarto escolhido"}
            </p>

            {/* Período */}
            {entrada && saida && diarias > 0 && (
              <>
                <p className="text-muted-foreground">
                  Check-in:{" "}
                  {entrada}
                </p>

                <p className="text-muted-foreground">
                  Check-out:{" "}
                  {saida}
                </p>

                <p className="text-muted-foreground">
                  {diarias}{" "}
                  {diarias === 1
                    ? "diária"
                    : "diárias"}
                </p>
              </>
            )}

            {/* Valor da diária */}
            {quarto && (
              <p className="text-muted-foreground">
                Diária:{" "}
                <strong>
                  {moeda(quarto.diaria)}
                </strong>
              </p>
            )}

            {/* Valor total */}
            <p className="font-display text-2xl font-semibold text-foreground">
              {moeda(valorTotal)}
            </p>

            {/* Aviso de datas inválidas */}
            {entrada &&
              saida &&
              diarias <= 0 && (
                <p className="rounded-lg bg-coral/10 px-3 py-2 text-coral">
                  A data de check-out deve ser
                  posterior à data de check-in.
                </p>
              )}

            {/* Aviso caso nenhum quarto tenha sido selecionado */}
            {!quarto && (
              <p className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
                Escolha um quarto disponível para
                continuar.
              </p>
            )}

            {/* Botão confirmar */}
            <Button
              type="submit"
              className="w-full"
              disabled={invalido}
              onClick={() =>
                navigate("/myBookin")
              }
            >
              <CalendarPlus className="h-4 w-4" />
              Confirmar reserva
            </Button>

            {/* Escolher outro quarto */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                navigate("/cliente/buscar")
              }
            >
              Escolher outro quarto
            </Button>

          </CardContent>
        </Card>

      </form>
    </div>
  );
}

export default BookinForm;