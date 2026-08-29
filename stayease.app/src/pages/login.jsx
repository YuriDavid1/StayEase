import { Anchor, ShieldCheck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useUser } from "../lib/useUser";

import { Button } from "../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

function Login() {
  const { login } = useUser();
  const navigate = useNavigate();

  function entrarComoAdmin() {
    login("admin");
    navigate("/homeAdm");
  }

  function entrarComoUsuario() {
    login("usuario");
    navigate("/user");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md border-border/70">

        <CardHeader>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-oceano text-primary-foreground">
            <Anchor className="h-5 w-5" />
          </span>

          <CardTitle className="font-display text-2xl">
            Entrar no sistema
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            Selecione o tipo de acesso para continuar.
          </p>
        </CardHeader>

        <CardContent className="space-y-3">

          <Button
            type="button"
            className="w-full"
            onClick={entrarComoAdmin}
          >
            <ShieldCheck className="h-4 w-4" />
            Entrar como Administrador
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={entrarComoUsuario}
          >
            <User className="h-4 w-4" />
            Entrar como Usuário
          </Button>

        </CardContent>

      </Card>
    </div>
  );
}

export default Login;