import { useState } from "react";
import { Anchor, LogIn } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useUser } from "../lib/useUser";
import { homePathFor } from "../lib/authSession";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

function Login() {
  const { login, isAuthenticated, role } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={homePathFor(role)} replace />;
  }

  async function entrar(event) {
    event.preventDefault();
    setErro("");

    if (!email.trim() || !senha) {
      setErro("Informe e-mail e senha.");
      return;
    }

    setEnviando(true);
    try {
      const sessao = await login(email.trim(), senha);
      navigate(location.state?.from ?? homePathFor(sessao.user.role), { replace: true });
    } catch (error) {
      setErro(error.message || "Não foi possível entrar.");
      setSenha("");
    } finally {
      setEnviando(false);
    }
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
            Use o e-mail e a senha cadastrados pelo administrador.
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={entrar} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            {erro && (
              <p role="alert" className="text-sm text-red-600">
                {erro}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={enviando}>
              <LogIn className="h-4 w-4" />
              {enviando ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>

      </Card>
    </div>
  );
}

export default Login;
