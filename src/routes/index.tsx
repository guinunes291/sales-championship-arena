import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Trophy, Calendar, Target, Award } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { PONTOS } from "@/lib/copa";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Copa SMQ — Campeonato de Vendas" },
      { name: "description", content: "Acompanhe a Copa SMQ: corretores disputando como seleções pelos prêmios do torneio." },
    ],
  }),
  component: Home,
});

const COPA_INICIO = new Date("2026-06-03T00:00:00");
const COPA_FIM = new Date("2026-07-28T23:59:59");

function Home() {
  const { data: stats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const [{ count: corretores }, { count: confrontos }, { data: top }] = await Promise.all([
        supabase.from("corretores").select("*", { count: "exact", head: true }),
        supabase.from("confrontos").select("*", { count: "exact", head: true }),
        supabase.from("pontuacoes").select("corretor_id, total, corretores(nome, selecoes(nome, bandeira))").order("total", { ascending: false }).limit(5),
      ]);
      return { corretores: corretores ?? 0, confrontos: confrontos ?? 0, top: top ?? [] };
    },
  });

  const hoje = new Date();
  const totalDias = Math.ceil((COPA_FIM.getTime() - COPA_INICIO.getTime()) / 86400000);
  const decorridos = Math.max(0, Math.min(totalDias, Math.ceil((hoje.getTime() - COPA_INICIO.getTime()) / 86400000)));
  const progresso = Math.round((decorridos / totalDias) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[var(--navy)] text-white">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle at 20% 20%, var(--gold) 0%, transparent 40%), radial-gradient(circle at 80% 80%, var(--grass) 0%, transparent 40%)",
          }} />
          <div className="container relative mx-auto px-4 py-20 md:py-28">
            <div className="max-w-3xl">
              <span className="inline-block rounded-full bg-[var(--gold)] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[var(--navy-deep)]">
                03 jun — 28 jul
              </span>
              <h1 className="mt-4 font-display text-6xl leading-none md:text-8xl">
                A COPA DOS<br />
                <span className="text-[var(--gold)]">CORRETORES</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/80">
                13 corretores. 13 seleções sorteadas. Uma disputa semanal por pontos até descobrir o grande campeão da Copa SMQ.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/chaveamento" className="rounded-md bg-[var(--gold)] px-6 py-3 font-semibold text-[var(--navy-deep)] hover:opacity-90">
                  Ver Chaveamento
                </Link>
                <Link to="/ranking" className="rounded-md border border-white/30 px-6 py-3 font-semibold text-white hover:bg-white/10">
                  Ver Ranking
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Progresso */}
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Progresso do torneio</span>
              <span className="text-muted-foreground">{decorridos} / {totalDias} dias</span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-to-r from-[var(--grass)] to-[var(--gold)]" style={{ width: `${progresso}%` }} />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container mx-auto grid grid-cols-2 gap-4 px-4 py-12 md:grid-cols-4">
          <StatCard icon={<Target className="h-6 w-6" />} label="Corretores" value={stats?.corretores ?? "—"} />
          <StatCard icon={<Trophy className="h-6 w-6" />} label="Confrontos" value={stats?.confrontos ?? "—"} />
          <StatCard icon={<Calendar className="h-6 w-6" />} label="Semanas" value="8" />
          <StatCard icon={<Award className="h-6 w-6" />} label="Premiação" value="R$ 4.350" />
        </section>

        {/* Top 5 */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="font-display text-4xl">Top 5 da semana</h2>
          <div className="mt-4 overflow-hidden rounded-lg border bg-card">
            {stats?.top?.length ? (
              <table className="w-full text-sm">
                <thead className="bg-[var(--navy)] text-white">
                  <tr><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Corretor</th><th className="px-4 py-3 text-left">Seleção</th><th className="px-4 py-3 text-right">Pontos</th></tr>
                </thead>
                <tbody>
                  {stats.top.map((row: any, i: number) => (
                    <tr key={row.corretor_id} className="border-t">
                      <td className="px-4 py-3 font-display text-2xl text-[var(--gold)]">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold">{row.corretores?.nome ?? "—"}</td>
                      <td className="px-4 py-3">{row.corretores?.selecoes?.bandeira} {row.corretores?.selecoes?.nome}</td>
                      <td className="px-4 py-3 text-right font-bold">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nenhuma pontuação registrada ainda. O torneio começa em 03/06.
              </div>
            )}
          </div>
        </section>

        {/* Pontuação */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="font-display text-4xl">Como pontuar</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <ScoreCard label="Agendamento" pts={PONTOS.agendamentos} />
            <ScoreCard label="Visita" pts={PONTOS.visitas} />
            <ScoreCard label="Documentação" pts={PONTOS.documentacao} />
            <ScoreCard label="Venda" pts={PONTOS.vendas} highlight />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 text-[var(--navy)]">{icon}<span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span></div>
      <div className="mt-2 font-display text-4xl text-[var(--navy)]">{value}</div>
    </div>
  );
}

function ScoreCard({ label, pts, highlight }: { label: string; pts: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-5 text-center ${highlight ? "bg-[var(--navy)] text-white" : "bg-card"}`}>
      <div className="text-xs uppercase tracking-widest opacity-70">{label}</div>
      <div className={`mt-1 font-display text-5xl ${highlight ? "text-[var(--gold)]" : "text-[var(--navy)]"}`}>{pts}</div>
      <div className="text-xs opacity-70">{pts === 1 ? "ponto" : "pontos"}</div>
    </div>
  );
}
