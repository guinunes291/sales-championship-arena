import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/corretores")({
  head: () => ({ meta: [{ title: "Corretores — Copa SMQ" }, { name: "description", content: "Conheça os corretores e suas seleções na Copa SMQ." }] }),
  component: CorretoresPage,
});

function CorretoresPage() {
  const { data } = useQuery({
    queryKey: ["corretores-full"],
    queryFn: async () => {
      const { data } = await supabase
        .from("corretores")
        .select("id, nome, foto_url, selecoes(nome, bandeira, cor_primaria), pontuacoes(total)")
        .order("nome");
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <h1 className="font-display text-5xl text-[var(--navy)]">Corretores & Seleções</h1>
        <p className="mt-1 text-muted-foreground">Cada corretor representa uma seleção sorteada.</p>

        {!data?.length ? (
          <div className="mt-8 rounded-lg border bg-card p-12 text-center text-muted-foreground">
            Nenhum corretor cadastrado ainda. O sorteio será divulgado em breve.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c: any) => {
              const total = (c.pontuacoes ?? []).reduce((s: number, p: any) => s + (p.total ?? 0), 0);
              const cor = c.selecoes?.cor_primaria || "var(--navy)";
              return (
                <div key={c.id} className="overflow-hidden rounded-lg border bg-card shadow-sm transition hover:shadow-md">
                  <div className="h-3" style={{ background: cor }} />
                  <div className="flex items-center gap-4 p-5">
                    <div className="text-5xl">{c.selecoes?.bandeira ?? "🏳️"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.selecoes?.nome ?? "Sem seleção"}</div>
                      <div className="truncate font-display text-2xl text-[var(--navy)]">{c.nome}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-3xl text-[var(--gold)]">{total}</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">pts</div>
                    </div>
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
