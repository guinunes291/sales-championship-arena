import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import type { Fase, Confronto, Corretor, Selecao } from "@/lib/copa";

export const Route = createFileRoute("/chaveamento")({
  head: () => ({ meta: [{ title: "Chaveamento — Copa SMQ" }, { name: "description", content: "Chaveamento completo da Copa SMQ: grupos, quartas, repescagem, semis e final." }] }),
  component: ChaveamentoPage,
});

type CorretorRow = Corretor & { selecoes: Selecao | null };

function ChaveamentoPage() {
  const { data } = useQuery({
    queryKey: ["chaveamento"],
    queryFn: async () => {
      const [{ data: fases }, { data: confrontos }, { data: corretores }] = await Promise.all([
        supabase.from("fases").select("*").order("ordem"),
        supabase.from("confrontos").select("*").order("posicao"),
        supabase.from("corretores").select("id, nome, selecao_id, foto_url, ativo, selecoes(id, nome, bandeira, cor_primaria)"),
      ]);
      const map = new Map<string, CorretorRow>();
      (corretores ?? []).forEach((c: any) => map.set(c.id, c));
      return { fases: (fases ?? []) as Fase[], confrontos: (confrontos ?? []) as Confronto[], corretoresById: map };
    },
  });

  const fases = data?.fases ?? [];
  const confrontos = data?.confrontos ?? [];
  const corretoresById = data?.corretoresById ?? new Map<string, CorretorRow>();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="font-display text-5xl text-[var(--navy)]">Chaveamento</h1>
        <p className="mt-1 text-muted-foreground">Confira os confrontos de cada fase do torneio.</p>

        {!fases.length ? (
          <div className="mt-8 rounded-lg border bg-card p-12 text-center text-muted-foreground">
            Estrutura ainda não definida.
          </div>
        ) : (
          <div className="mt-8 flex gap-6 overflow-x-auto pb-4">
            {fases.map((fase) => {
              const list = confrontos.filter((c) => c.fase_id === fase.id);
              return (
                <div key={fase.id} className="min-w-[280px] flex-1">
                  <div className="rounded-t-lg bg-[var(--navy)] px-4 py-3 text-white">
                    <div className="font-display text-xl tracking-wider">{fase.nome}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/60">{fase.semana_inicio} → {fase.semana_fim}</div>
                  </div>
                  <div className="space-y-3 rounded-b-lg border border-t-0 bg-card p-3">
                    {!list.length && <div className="p-4 text-center text-xs text-muted-foreground">Sem confrontos definidos</div>}
                    {list.map((cf) => (
                      <MatchCard key={cf.id} cf={cf} corretoresById={corretoresById} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function MatchCard({ cf, corretoresById }: { cf: Confronto; corretoresById: Map<string, CorretorRow> }) {
  const a = cf.corretor_a_id ? corretoresById.get(cf.corretor_a_id) : null;
  const b = cf.corretor_b_id ? corretoresById.get(cf.corretor_b_id) : null;
  const vencedor = cf.vencedor_id;
  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <Side row={a} winner={vencedor === a?.id} />
      <div className="border-t bg-muted px-3 py-1 text-center text-[10px] uppercase tracking-widest text-muted-foreground">vs</div>
      <Side row={b} winner={vencedor === b?.id} />
    </div>
  );
}

function Side({ row, winner }: { row: CorretorRow | null | undefined; winner: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 ${winner ? "bg-[var(--gold)]/20" : ""}`}>
      <span className="text-2xl">{row?.selecoes?.bandeira ?? "❓"}</span>
      <div className="flex-1 min-w-0">
        <div className="truncate text-sm font-semibold">{row?.nome ?? "A definir"}</div>
        <div className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">{row?.selecoes?.nome ?? "—"}</div>
      </div>
      {winner && <span className="rounded bg-[var(--gold)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--navy-deep)]">classificado</span>}
    </div>
  );
}
