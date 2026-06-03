import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/chaveamento", label: "Chaveamento" },
  { to: "/corretores", label: "Corretores" },
  { to: "/ranking", label: "Ranking" },
  { to: "/premios", label: "Prêmios" },
  { to: "/regulamento", label: "Regulamento" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--navy)] text-white">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--gold)] text-[var(--navy-deep)]">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <div className="font-display text-2xl tracking-wider">COPA SMQ</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Campeonato de Vendas</div>
          </div>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-1.5 font-medium text-white/80 transition hover:bg-white/10 hover:text-white [&.active]:bg-[var(--gold)] [&.active]:text-[var(--navy-deep)]"
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/auth"
            className="ml-2 rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/90 hover:bg-white/10"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--navy-deep)] py-8 text-center text-sm text-white/60">
      <div className="container mx-auto px-4">
        © {new Date().getFullYear()} Copa SMQ — Campeonato de Vendas. 03/06 a 28/07.
      </div>
    </footer>
  );
}
