import { useNavigate, Link } from "react-router-dom";

import {
  Anchor,
  BedDouble,
  CalendarRange,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { useUser } from "../../lib/useUser";

function Header() {
  const { perfil, logout } = useUser();
  const navigate = useNavigate();

  const adminNav = [
    {
      to: "/homeAdm",
      label: "Painel",
      icon: Anchor,
    },
    {
      to: "/usersAdm",
      label: "Usuários",
      icon: ShieldCheck,
    },
    {
      to: "/rooms",
      label: "Quartos",
      icon: BedDouble,
    },
    {
      to: "/guests",
      label: "Hóspedes",
      icon: Users,
    },
    {
      to: "/schedulingAdm",
      label: "Reservas",
      icon: CalendarRange,
    },
    {
      to: "/governanca",
      label: "Governança",
      icon: Sparkles,
    },
  ];

  const usuarioNav = [
    {
      to: "/user",
      label: "Início",
      icon: Anchor,
    },
    {
      to: "/cliente/buscar",
      label: "Disponibilidade",
      icon: BedDouble,
    },
    {
      to: "/cliente/reservas",
      label: "Minhas reservas",
      icon: CalendarRange,
    },
  ];

  const navItems = perfil === "admin" ? adminNav : usuarioNav;

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-espuma/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">

        {/* Logo */}
        <Link
          to={perfil === "admin" ? "/homeAdm" : "/user"}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-oceano text-primary-foreground">
            <Anchor className="h-4 w-4" />
          </span>

          <div className="leading-tight">
            <span className="block font-display text-lg font-semibold">
              StayEase
            </span>

            <span className="block text-xs text-muted-foreground">
              Gestão de hospedagem
            </span>
          </div>
        </Link>

        {/* Navegação */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>

      </div>
    </header>
  );
}

export default Header;