import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Trophy, Medal, Award } from "lucide-react";

export const Route = createFileRoute("/premios")({
  head: () => ({ meta: [{ title: "Prêmios — Copa SMQ" }, { name: "description", content: "Conheça todos os prêmios da Copa SMQ por fase do torneio." }] }),
  component: PremiosPage,
});

const PREMIOS = [
  { fase: "Top 3 — Fase de Grupos", valor: "R$ 100", desc: "Para cada um dos 3 melhores pontuadores da fase de grupos.", icon: Award, accent: "var(--grass)" },
  { fase: "Avanço à Semifinal", valor: "R$ 250", desc: "Quem avançar das quartas ou repescagem rumo à semifinal.", icon: Medal, accent: "var(--gold)" },
  { fase: "3º Lugar", valor: "R$ 400", desc: "Vencedor da disputa de terceiro lugar.", icon: Medal, accent: "#cd7f32" },
  { fase: "Vice-campeão", valor: "R$ 600", desc: "Finalista derrotado.", icon: Trophy, accent: "#c0c0c0" },
  { fase: "Campeão", valor: "R$ 1.000", desc: "O grande campeão da Copa SMQ.", icon: Trophy, accent: "var(--gold)" },
];

function PremiosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="font-display text-5xl text-[var(--navy)]">Prêmios</h1>
        <p className="mt-1 text-muted-foreground">Premiação total: <strong>R$ 4.350</strong> distribuídos ao longo do torneio.</p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PREMIOS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.fase} className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="h-2" style={{ background: p.accent }} />
                <div className="p-6">
                  <Icon className="h-8 w-8 text-[var(--navy)]" />
                  <div className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{p.fase}</div>
                  <div className="mt-1 font-display text-5xl text-[var(--navy)]">{p.valor}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
