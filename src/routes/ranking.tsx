import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/ranking")({
  head: () => ({ meta: [{ title: "Ranking — Copa SMQ" }, { name: "description", content: "Ranking acumulado de pontos dos corretores na Copa SMQ." }] }),
  component: RankingPage,
});

function RankingPage() {
  const { data } = useQuery({
    queryKey: ["ranking"],
    queryFn: async () => {
      const { data } = await supabase
        .from("corretores")
        .select("id, nome, selecoes(nome, bandeira), pontuacoes(semana, total, agendamentos, visitas, documentacao, vendas)");
      const ranked = (data ?? []).map((c: any) => {
        const total = (c.pontuacoes ?? []).reduce((s: number, p: any) => s + (p.total ?? 0), 0);
        const ag = (c.pontuacoes ?? []).reduce((s: number, p: any) => s + p.agendamentos, 0);
        const vi = (c.pontuacoes ?? []).reduce((s: number, p: any) => s + p.visitas, 0);
        const dc = (c.pontuacoes ?? []).reduce((s: number, p: any) => s + p.documentacao, 0);
        const ve = (c.pontuacoes ?? []).reduce((s: number, p: any) => s + p.vendas, 0);
        return { id: c.id, nome: c.nome, selecao: c.selecoes, total, ag, vi, dc, ve };
      }).sort((a, b) => b.total - a.total);
      return ranked;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="font-display text-5xl text-[var(--navy)]">Ranking Geral</h1>
        <p className="mt-1 text-muted-foreground">Pontuação acumulada de todas as semanas.</p>

        <div className="mt-6 overflow-x-auto rounded-lg border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-[var(--navy)] text-white">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Corretor / Seleção</th>
                <th className="px-3 py-3 text-right">Agend.</th>
                <th className="px-3 py-3 text-right">Visitas</th>
                <th className="px-3 py-3 text-right">Doc.</th>
                <th className="px-3 py-3 text-right">Vendas</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data?.length ? data.map((r, i) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3 font-display text-2xl text-[var(--gold)]">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{r.nome}</div>
                    <div className="text-xs text-muted-foreground">{(r.selecao as any)?.bandeira} {(r.selecao as any)?.nome}</div>
                  </td>
                  <td className="px-3 py-3 text-right">{r.ag}</td>
                  <td className="px-3 py-3 text-right">{r.vi}</td>
                  <td className="px-3 py-3 text-right">{r.dc}</td>
                  <td className="px-3 py-3 text-right">{r.ve}</td>
                  <td className="px-4 py-3 text-right font-display text-2xl text-[var(--navy)]">{r.total}</td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">Sem dados ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
