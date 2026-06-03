export const PONTOS = {
  agendamentos: 1,
  visitas: 5,
  documentacao: 8,
  vendas: 40,
} as const;

export type Selecao = {
  id: string;
  nome: string;
  bandeira: string | null;
  cor_primaria: string | null;
};

export type Corretor = {
  id: string;
  nome: string;
  selecao_id: string | null;
  foto_url: string | null;
  ativo: boolean;
};

export type Fase = {
  id: string;
  nome: string;
  tipo: "grupos" | "quartas" | "repescagem" | "semifinal" | "final" | "terceiro";
  ordem: number;
  semana_inicio: string | null;
  semana_fim: string | null;
};

export type Confronto = {
  id: string;
  fase_id: string;
  corretor_a_id: string | null;
  corretor_b_id: string | null;
  vencedor_id: string | null;
  semana_ref: number | null;
  posicao: number | null;
};

export type Pontuacao = {
  id: string;
  corretor_id: string;
  semana: number;
  agendamentos: number;
  visitas: number;
  documentacao: number;
  vendas: number;
  total: number;
};

export function calcTotal(p: Pick<Pontuacao, "agendamentos" | "visitas" | "documentacao" | "vendas">) {
  return p.agendamentos * PONTOS.agendamentos + p.visitas * PONTOS.visitas + p.documentacao * PONTOS.documentacao + p.vendas * PONTOS.vendas;
}
