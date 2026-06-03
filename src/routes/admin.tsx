import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { LogOut, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: isAdmin, isLoading: checkingRole } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
  });

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (checkingRole) return <div className="p-12 text-center">Verificando permissões…</div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Acesso negado</h1>
        <p className="mt-2 text-muted-foreground">Sua conta não tem permissão de administrador.</p>
        <Button className="mt-4" onClick={logout}>Sair</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl text-[var(--navy)]">Painel Admin</h1>
            <p className="text-sm text-muted-foreground">Gerencie corretores, pontuações e confrontos.</p>
          </div>
          <Button variant="outline" onClick={logout}><LogOut className="mr-2 h-4 w-4" />Sair</Button>
        </div>

        <Tabs defaultValue="corretores" className="mt-6">
          <TabsList>
            <TabsTrigger value="corretores">Corretores</TabsTrigger>
            <TabsTrigger value="pontos">Pontuações</TabsTrigger>
            <TabsTrigger value="confrontos">Confrontos</TabsTrigger>
          </TabsList>
          <TabsContent value="corretores"><CorretoresTab onChange={() => qc.invalidateQueries()} /></TabsContent>
          <TabsContent value="pontos"><PontosTab onChange={() => qc.invalidateQueries()} /></TabsContent>
          <TabsContent value="confrontos"><ConfrontosTab onChange={() => qc.invalidateQueries()} /></TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}

function CorretoresTab({ onChange }: { onChange: () => void }) {
  const { data: selecoes } = useQuery({
    queryKey: ["selecoes"],
    queryFn: async () => (await supabase.from("selecoes").select("*").order("nome")).data ?? [],
  });
  const { data: corretores, refetch } = useQuery({
    queryKey: ["admin-corretores"],
    queryFn: async () => (await supabase.from("corretores").select("*, selecoes(nome, bandeira)").order("nome")).data ?? [],
  });

  const [nome, setNome] = useState("");
  const [selecaoId, setSelecaoId] = useState<string>("");

  const add = async () => {
    if (!nome.trim()) return toast.error("Informe o nome");
    const { error } = await supabase.from("corretores").insert({ nome: nome.trim(), selecao_id: selecaoId || null });
    if (error) return toast.error(error.message);
    toast.success("Corretor adicionado");
    setNome(""); setSelecaoId(""); refetch(); onChange();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este corretor?")) return;
    const { error } = await supabase.from("corretores").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido"); refetch(); onChange();
  };

  const sorteioRand = async () => {
    if (!corretores?.length || !selecoes?.length) return;
    if (!confirm("Sortear seleções aleatoriamente para todos os corretores sem seleção?")) return;
    const livres = selecoes.filter((s: any) => !corretores.some((c: any) => c.selecao_id === s.id));
    const semSel = corretores.filter((c: any) => !c.selecao_id);
    const baralho = [...livres].sort(() => Math.random() - 0.5);
    for (const c of semSel) {
      const s = baralho.shift();
      if (!s) break;
      await supabase.from("corretores").update({ selecao_id: s.id }).eq("id", c.id);
    }
    toast.success("Sorteio concluído"); refetch(); onChange();
  };

  return (
    <Card className="p-6">
      <div className="grid gap-3 sm:grid-cols-[1fr_220px_auto_auto]">
        <div><Label>Nome</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do corretor" /></div>
        <div><Label>Seleção</Label>
          <Select value={selecaoId} onValueChange={setSelecaoId}>
            <SelectTrigger><SelectValue placeholder="Sortear depois" /></SelectTrigger>
            <SelectContent>
              {selecoes?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.bandeira} {s.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button className="self-end" onClick={add}>Adicionar</Button>
        <Button className="self-end" variant="outline" onClick={sorteioRand}>Sortear</Button>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead><tr className="border-b text-left"><th className="py-2">Nome</th><th>Seleção</th><th></th></tr></thead>
        <tbody>
          {corretores?.map((c: any) => (
            <tr key={c.id} className="border-b">
              <td className="py-2 font-medium">{c.nome}</td>
              <td>{c.selecoes ? `${c.selecoes.bandeira} ${c.selecoes.nome}` : <span className="text-muted-foreground">—</span>}</td>
              <td className="text-right"><Button variant="ghost" size="sm" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function PontosTab({ onChange }: { onChange: () => void }) {
  const { data: corretores } = useQuery({
    queryKey: ["admin-corretores-simple"],
    queryFn: async () => (await supabase.from("corretores").select("id, nome, selecoes(nome, bandeira)").order("nome")).data ?? [],
  });

  const [semana, setSemana] = useState(1);
  const [corretorId, setCorretorId] = useState("");
  const [form, setForm] = useState({ agendamentos: 0, visitas: 0, documentacao: 0, vendas: 0 });

  const { data: pontosSemana, refetch } = useQuery({
    queryKey: ["pontos-semana", semana],
    queryFn: async () => (await supabase.from("pontuacoes").select("*, corretores(nome, selecoes(bandeira))").eq("semana", semana).order("total", { ascending: false })).data ?? [],
  });

  const salvar = async () => {
    if (!corretorId) return toast.error("Selecione um corretor");
    const { error } = await supabase.from("pontuacoes")
      .upsert({ corretor_id: corretorId, semana, ...form }, { onConflict: "corretor_id,semana" });
    if (error) return toast.error(error.message);
    toast.success("Pontuação salva");
    setForm({ agendamentos: 0, visitas: 0, documentacao: 0, vendas: 0 });
    refetch(); onChange();
  };

  return (
    <Card className="p-6">
      <div className="grid gap-3 sm:grid-cols-6">
        <div><Label>Semana</Label><Input type="number" min={1} max={8} value={semana} onChange={(e) => setSemana(Number(e.target.value))} /></div>
        <div className="sm:col-span-2"><Label>Corretor</Label>
          <Select value={corretorId} onValueChange={setCorretorId}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{corretores?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.selecoes?.bandeira} {c.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {(["agendamentos", "visitas", "documentacao", "vendas"] as const).map((k) => (
          <div key={k}><Label className="capitalize">{k}</Label>
            <Input type="number" min={0} value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} />
          </div>
        ))}
      </div>
      <Button className="mt-4" onClick={salvar}>Salvar pontuação</Button>

      <h3 className="mt-8 font-display text-xl">Pontos da semana {semana}</h3>
      <table className="mt-2 w-full text-sm">
        <thead><tr className="border-b text-left"><th className="py-2">Corretor</th><th>Ag</th><th>Vi</th><th>Dc</th><th>Vd</th><th className="text-right">Total</th></tr></thead>
        <tbody>
          {pontosSemana?.map((p: any) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">{p.corretores?.selecoes?.bandeira} {p.corretores?.nome}</td>
              <td>{p.agendamentos}</td><td>{p.visitas}</td><td>{p.documentacao}</td><td>{p.vendas}</td>
              <td className="text-right font-bold">{p.total}</td>
            </tr>
          ))}
          {!pontosSemana?.length && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Sem pontos registrados nesta semana.</td></tr>}
        </tbody>
      </table>
    </Card>
  );
}

function ConfrontosTab({ onChange }: { onChange: () => void }) {
  const { data: fases } = useQuery({ queryKey: ["fases"], queryFn: async () => (await supabase.from("fases").select("*").order("ordem")).data ?? [] });
  const { data: corretores } = useQuery({ queryKey: ["admin-corretores-simple2"], queryFn: async () => (await supabase.from("corretores").select("id, nome, selecoes(nome, bandeira)").order("nome")).data ?? [] });
  const { data: confrontos, refetch } = useQuery({
    queryKey: ["admin-confrontos"],
    queryFn: async () => (await supabase.from("confrontos").select("*, fases(nome)").order("posicao")).data ?? [],
  });

  const [faseId, setFaseId] = useState("");
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");
  const [semanaRef, setSemanaRef] = useState(1);

  const add = async () => {
    if (!faseId) return toast.error("Escolha a fase");
    const { error } = await supabase.from("confrontos").insert({ fase_id: faseId, corretor_a_id: aId || null, corretor_b_id: bId || null, semana_ref: semanaRef });
    if (error) return toast.error(error.message);
    toast.success("Confronto criado"); setAId(""); setBId(""); refetch(); onChange();
  };

  const definirVencedor = async (id: string, vencedorId: string | null) => {
    const { error } = await supabase.from("confrontos").update({ vencedor_id: vencedorId }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Atualizado"); refetch(); onChange();
  };

  const calcVencedor = async (cf: any) => {
    if (!cf.semana_ref || !cf.corretor_a_id || !cf.corretor_b_id) return toast.error("Confronto incompleto");
    const { data } = await supabase.from("pontuacoes").select("corretor_id, total").eq("semana", cf.semana_ref).in("corretor_id", [cf.corretor_a_id, cf.corretor_b_id]);
    const a = data?.find((d) => d.corretor_id === cf.corretor_a_id)?.total ?? 0;
    const b = data?.find((d) => d.corretor_id === cf.corretor_b_id)?.total ?? 0;
    const vencedorId = a >= b ? cf.corretor_a_id : cf.corretor_b_id;
    await definirVencedor(cf.id, vencedorId);
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este confronto?")) return;
    await supabase.from("confrontos").delete().eq("id", id);
    refetch(); onChange();
  };

  return (
    <Card className="p-6">
      <div className="grid gap-3 sm:grid-cols-5">
        <div><Label>Fase</Label>
          <Select value={faseId} onValueChange={setFaseId}><SelectTrigger><SelectValue placeholder="Fase" /></SelectTrigger>
            <SelectContent>{fases?.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Corretor A</Label>
          <Select value={aId} onValueChange={setAId}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>{corretores?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.selecoes?.bandeira} {c.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Corretor B</Label>
          <Select value={bId} onValueChange={setBId}><SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>{corretores?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.selecoes?.bandeira} {c.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Semana</Label><Input type="number" min={1} max={8} value={semanaRef} onChange={(e) => setSemanaRef(Number(e.target.value))} /></div>
        <Button className="self-end" onClick={add}>Criar</Button>
      </div>

      <div className="mt-6 space-y-2">
        {confrontos?.map((cf: any) => {
          const a = corretores?.find((c: any) => c.id === cf.corretor_a_id);
          const b = corretores?.find((c: any) => c.id === cf.corretor_b_id);
          return (
            <div key={cf.id} className="flex flex-wrap items-center gap-3 rounded border bg-background p-3">
              <span className="rounded bg-[var(--navy)] px-2 py-0.5 text-xs text-white">{cf.fases?.nome} · Sem {cf.semana_ref ?? "—"}</span>
              <span className={`flex-1 ${cf.vencedor_id === cf.corretor_a_id ? "font-bold text-[var(--grass)]" : ""}`}>{(a as any)?.selecoes?.bandeira} {a?.nome ?? "A definir"}</span>
              <span className="text-xs text-muted-foreground">vs</span>
              <span className={`flex-1 ${cf.vencedor_id === cf.corretor_b_id ? "font-bold text-[var(--grass)]" : ""}`}>{(b as any)?.selecoes?.bandeira} {b?.nome ?? "A definir"}</span>
              <Button size="sm" variant="outline" onClick={() => calcVencedor(cf)}>Calcular vencedor</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(cf.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          );
        })}
        {!confrontos?.length && <div className="p-6 text-center text-muted-foreground">Nenhum confronto cadastrado.</div>}
      </div>
    </Card>
  );
}
