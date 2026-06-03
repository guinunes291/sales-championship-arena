
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Selecoes (países)
CREATE TABLE public.selecoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  bandeira TEXT,
  cor_primaria TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.selecoes TO anon, authenticated;
GRANT ALL ON public.selecoes TO service_role;
ALTER TABLE public.selecoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "selecoes public read" ON public.selecoes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "selecoes admin write" ON public.selecoes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Corretores
CREATE TABLE public.corretores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  selecao_id UUID REFERENCES public.selecoes(id) ON DELETE SET NULL,
  foto_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.corretores TO anon, authenticated;
GRANT ALL ON public.corretores TO service_role;
ALTER TABLE public.corretores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "corretores public read" ON public.corretores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "corretores admin write" ON public.corretores FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fases
CREATE TYPE public.fase_tipo AS ENUM ('grupos', 'quartas', 'repescagem', 'semifinal', 'final', 'terceiro');

CREATE TABLE public.fases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo public.fase_tipo NOT NULL,
  ordem INT NOT NULL,
  semana_inicio DATE,
  semana_fim DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fases TO anon, authenticated;
GRANT ALL ON public.fases TO service_role;
ALTER TABLE public.fases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fases public read" ON public.fases FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "fases admin write" ON public.fases FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Confrontos
CREATE TABLE public.confrontos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fase_id UUID NOT NULL REFERENCES public.fases(id) ON DELETE CASCADE,
  corretor_a_id UUID REFERENCES public.corretores(id) ON DELETE SET NULL,
  corretor_b_id UUID REFERENCES public.corretores(id) ON DELETE SET NULL,
  vencedor_id UUID REFERENCES public.corretores(id) ON DELETE SET NULL,
  semana_ref INT,
  posicao INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.confrontos TO anon, authenticated;
GRANT ALL ON public.confrontos TO service_role;
ALTER TABLE public.confrontos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "confrontos public read" ON public.confrontos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "confrontos admin write" ON public.confrontos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Pontuacoes (por corretor / semana)
CREATE TABLE public.pontuacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID NOT NULL REFERENCES public.corretores(id) ON DELETE CASCADE,
  semana INT NOT NULL,
  agendamentos INT NOT NULL DEFAULT 0,
  visitas INT NOT NULL DEFAULT 0,
  documentacao INT NOT NULL DEFAULT 0,
  vendas INT NOT NULL DEFAULT 0,
  total INT GENERATED ALWAYS AS (agendamentos * 1 + visitas * 5 + documentacao * 8 + vendas * 40) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (corretor_id, semana)
);
GRANT SELECT ON public.pontuacoes TO anon, authenticated;
GRANT ALL ON public.pontuacoes TO service_role;
ALTER TABLE public.pontuacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pontuacoes public read" ON public.pontuacoes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pontuacoes admin write" ON public.pontuacoes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER pontuacoes_updated BEFORE UPDATE ON public.pontuacoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-promote first signup to admin
CREATE OR REPLACE FUNCTION public.handle_first_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created_first_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_first_admin();
