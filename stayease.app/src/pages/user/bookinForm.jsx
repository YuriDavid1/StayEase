import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/button";
import { fetchRooms } from "../../services/roomsService";
import { fetchCurrentGuest } from "../../services/guestsService";
import { createReservation } from "../../services/reservationsService";

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

const moeda = (valor) => {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const hojeISO = () => {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
};

function BookinForm() {
  const navigate = useNavigate();

  const parametros = new URLSearchParams(
    window.location.search
  );

  const quartoParametro = parametros.get("quarto");

  const [quartoId, setQuartoId] = useState(
    quartoParametro ?? ""
  );

  const [quartos, setQuartos] = useState([]);
  const [hospede, setHospede] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [entrada, setEntrada] = useState("");
  const [saida, setSaida] = useState("");

  const [observacao, setObservacao] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const [quartosApi, hospedeApi] = await Promise.all([
          fetchRooms(),
          fetchCurrentGuest(),
        ]);

        setQuartos(quartosApi);
        setHospede(hospedeApi);
      } catch (error) {
        console.error("Erro ao carregar dados da reserva:", error);
        toast.error("Não foi possível carregar os dados da reserva.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  const quarto = quartos.find(
    (q) => String(q.id) === String(quartoId)
  );

  const quartosDisponiveis = quartos.filter(
    (q) => q.status === "Livre"
  );


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

  const valorTotal = quarto
    ? quarto.diaria * diarias
    : 0;


  const dataMinima = hojeISO();


  const invalido =
    !quarto ||
    quarto.status !== "Livre" ||
    !entrada ||
    !saida ||
    diarias <= 0;

  const confirmar = async (e) => {
    e.preventDefault();

    if (!quarto || !hospede?.id) {
      return;
    }

    if (quarto.status !== "Livre") {
      toast.error(
        "Este quarto não está disponível para reserva."
      );
      return;
    }

    if (!entrada || !saida) {
      toast.error(
        "Informe as datas de check-in e check-out."
      );
      return;
    }

    if (diarias <= 0) {
      toast.error(
        "A data de check-out deve ser posterior à data de check-in."
      );
      return;
    }

    try {
      setEnviando(true);

      const reserva = await createReservation({
        roomId: quarto.id,
        guestId: hospede.id,
        entrada,
        saida,
      });

      toast.success(
        `Reserva confirmada no quarto ${quarto.numero}.`
      );

      navigate(`/user/bookinDetail/${reserva.id}`);
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      toast.error("Não foi possível confirmar a reserva.");
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <div className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Carregando dados da reserva...
        </p>
      </div>
    );
  }

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
                      value={String(q.id)}
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
              disabled={invalido || enviando}

            >
              <CalendarPlus className="h-4 w-4" />
              {enviando ? "Confirmando..." : "Confirmar reserva"}
            </Button>

            {/* Escolher outro quarto */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                navigate("/roomList")
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