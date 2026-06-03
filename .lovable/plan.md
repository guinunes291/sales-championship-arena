## Copa SMQ — Campeonato de Vendas

Site público com chaveamento visual + painel admin para gerenciar pontos, com Lovable Cloud (banco + auth).

### Estrutura do torneio

- **13 corretores**, cada um sorteia 1 seleção de futebol famosa (Brasil, Argentina, França, Alemanha, Espanha, Itália, Portugal, Inglaterra, Holanda, Bélgica, Croácia, Uruguai, México)
- **Período**: 03/06 a 28/07 (8 semanas)
- **Fase de grupos** (sem 1–2): 13 corretores em grupos → top reduz para 8
- **Quartas** (sem 3–4): 8 → 4
- **Repescagem** (sem após quartas): eliminados disputam vaga extra
- **Semifinal** (sem 5–6): 4 → 2
- **Final + 3º lugar** (sem 7–8): define campeão

### Pontuação (semanal)

- Agendamento: 1pt · Visita: 5pts · Documentação: 8pts · Venda: 40pts
- Avança quem somar mais pontos na semana vs. oponente

### Prêmios

- Top 3 fase de grupos: R$ 100
- Avançar para semifinal (via quartas ou repescagem): R$ 250
- 3º lugar: R$ 400 · Vice: R$ 800,00 · Campeão: R$ 2.000

### Páginas (site público)

1. **Home** — hero da Copa, contagem regressiva, rodada atual, próximos confrontos
2. **Chaveamento** — bracket visual com fases (grupos → quartas → semi → final), repescagem
3. **Corretores/Seleções** — grid com cada corretor + seleção sorteada + pontos totais
4. **Ranking** — tabela ordenada por pontos (semana atual + acumulado)
5. **Prêmios** — explicação dos prêmios por fase
6. **Regulamento** — regras de pontuação e formato

### Painel Admin (`/admin`, protegido)

- Login email/senha (Lovable Cloud Auth)
- CRUD corretores + atribuição de seleção
- Lançar pontos por corretor/semana (agendamentos, visitas, doc, vendas)
- Definir confrontos de cada fase
- Avançar fase (calcula vencedor automaticamente pela soma de pontos da semana)
- Gerenciar repescagem

### Banco de dados (Lovable Cloud)

- `profiles` (admins)
- `user_roles` (admin role)
- `corretores` (nome, seleção, foto opcional)
- `fases` (nome, semana_inicio, semana_fim, tipo)
- `confrontos` (fase_id, corretor_a, corretor_b, vencedor, semana)
- `pontuacoes` (corretor_id, semana, agendamentos, visitas, documentacao, vendas, total)
- RLS: leitura pública nos dados do torneio, escrita só admin

### Visual

Azul marinho + amarelo + verde + branco, clima de Copa do Mundo. Tipografia esportiva (Bebas Neue + Barlow). Bracket com cards das seleções estilo álbum de figurinhas.

### Stack técnico

- TanStack Start + Tailwind + shadcn
- Lovable Cloud (Supabase) — auth email/senha + Postgres + RLS
- `_authenticated/admin/*` para rotas protegidas
- Server functions para mutações de pontos/confrontos

### Ordem de implementação

1. Habilitar Lovable Cloud + schema + RLS
2. Seed das 13 seleções e estrutura de fases
3. Auth admin + página de login
4. Painel admin (CRUD corretores, pontos, confrontos)
5. Páginas públicas (home, chaveamento, ranking, prêmios)
6. Polimento visual + responsivo