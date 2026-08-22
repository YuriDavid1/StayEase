import { Anchor, LogIn } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

function Login() {
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
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>

              <Input
                id="email"
                type="email"
                placeholder="voce@maremansa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>

              <Input
                id="senha"
                type="password"
                placeholder="••••••"
              />
            </div>

            <Button type="button" className="w-full">
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;