import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/regulamento")({
  head: () => ({ meta: [{ title: "Regulamento — Copa SMQ" }, { name: "description", content: "Regras completas da Copa SMQ: pontuação, formato e fases." }] }),
  component: RegPage,
});

function RegPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="font-display text-5xl text-[var(--navy)]">Regulamento</h1>

        <section className="mt-8">
          <h2 className="font-display text-2xl text-[var(--navy)]">Período</h2>
          <p className="mt-2 text-muted-foreground">A Copa SMQ acontece entre <strong>03 de junho</strong> e <strong>28 de julho</strong>. Cada rodada dura 1 semana.</p>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-2xl text-[var(--navy)]">Pontuação</h2>
          <table className="mt-3 w-full rounded-lg border bg-card text-sm">
            <thead className="bg-muted"><tr><th className="px-4 py-2 text-left">Ação</th><th className="px-4 py-2 text-right">Pontos</th></tr></thead>
            <tbody>
              <tr className="border-t"><td className="px-4 py-2">Agendamento</td><td className="px-4 py-2 text-right font-bold">1</td></tr>
              <tr className="border-t"><td className="px-4 py-2">Visita</td><td className="px-4 py-2 text-right font-bold">5</td></tr>
              <tr className="border-t"><td className="px-4 py-2">Documentação</td><td className="px-4 py-2 text-right font-bold">8</td></tr>
              <tr className="border-t"><td className="px-4 py-2">Venda</td><td className="px-4 py-2 text-right font-bold">40</td></tr>
            </tbody>
          </table>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-2xl text-[var(--navy)]">Formato</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-muted-foreground">
            <li><strong>Sorteio:</strong> cada um dos 13 corretores sorteia uma seleção famosa para representar.</li>
            <li><strong>Fase de Grupos (semanas 1–2):</strong> divisão em grupos para reduzir o número de competidores a 8.</li>
            <li><strong>Quartas de Final (semanas 3–4):</strong> 8 seleções em chaveamento mata-mata semanal.</li>
            <li><strong>Repescagem (semana seguinte):</strong> os eliminados das quartas disputam uma vaga extra.</li>
            <li><strong>Semifinal (semanas 5–6):</strong> 4 seleções decidem quem vai à final.</li>
            <li><strong>Final + Disputa de 3º lugar (semana 7):</strong> definição do campeão, vice e terceiro lugar.</li>
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">Em cada confronto, avança a seleção (corretor) com <strong>mais pontos na semana</strong>.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
