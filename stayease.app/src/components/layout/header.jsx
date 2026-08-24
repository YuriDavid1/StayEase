import { Anchor } from "lucide-react";

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-espuma/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">

        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-oceano text-primary-foreground">
            <Anchor className="h-4.5 w-4.5" />
          </span>

          <div className="leading-tight">
            <span className="block font-display text-lg font-semibold text-foreground">
              StayEase
            </span>

            <span className="block text-xs text-muted-foreground">
              Gestão de hospedagem
            </span>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header;