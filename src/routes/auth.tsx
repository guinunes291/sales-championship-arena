import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Acesso Admin — Copa SMQ" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode entrar.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
        navigate({ to: "/admin", replace: true });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--navy)] px-4">
      <div className="w-full max-w-sm rounded-lg bg-card p-8 shadow-2xl">
        <Link to="/" className="flex items-center justify-center gap-2 text-[var(--navy)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--gold)]">
            <Trophy className="h-5 w-5 text-[var(--navy-deep)]" />
          </div>
          <span className="font-display text-3xl tracking-wider">COPA SMQ</span>
        </Link>
        <h1 className="mt-6 text-center font-display text-2xl text-[var(--navy)]">
          {mode === "login" ? "Acesso Administrativo" : "Criar conta admin"}
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[var(--navy)] hover:bg-[var(--navy-deep)]">
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:underline"
        >
          {mode === "login" ? "Primeiro acesso? Criar conta admin" : "Já tem conta? Entrar"}
        </button>

        <p className="mt-4 rounded bg-muted p-2 text-center text-[10px] text-muted-foreground">
          O primeiro usuário cadastrado se torna admin automaticamente.
        </p>
      </div>
    </div>
  );
}
