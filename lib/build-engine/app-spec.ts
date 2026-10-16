import { z } from "zod";
import type { Archetype } from "../archetypes";
import { generateStructured, llmEnabled } from "../llm";
import type { DesignSystem, EbookExtraction, PRD, ProjectInput } from "../types";
import { ICON_NAMES, SECTION_KINDS, type AppSpec, type IconName, type SpecItem, type SpecScreen, type SpecSection, type SpecTheme } from "./spec-types";

/* ---------- Dados de exemplo por nicho (dão vida ao protótipo) ---------- */

interface Sample {
  greeting: string;
  heroValue: string;
  heroLabel: string;
  stats: SpecItem[];
  schedule: SpecItem[];
  people: SpecItem[];
  cards: SpecItem[];
  chart: SpecItem[];
  checklist: SpecItem[];
  progress: SpecItem[];
  feed: SpecItem[];
  chips: string[];
}

const MONTHS = ["Mai", "Jun", "Jul", "Ago", "Set", "Out"];
const chart = (values: number[], fmt: (v: number) => string) =>
  values.map((v, i) => ({ title: MONTHS[i], value: fmt(v), progress: Math.round((v / Math.max(...values)) * 100) }));
const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

const SAMPLES: Record<string, Sample> = {
  finance: {
    greeting: "Bom dia, Carla", heroValue: "R$ 2.340", heroLabel: "livres para o mês, depois dos envelopes",
    stats: [{ title: "Guardado", value: "R$ 8.900", icon: "trending", meta: "+12%" }, { title: "Dívidas", value: "R$ 3.100", icon: "target", meta: "-28%" }, { title: "Streak", value: "14 dias", icon: "flame" }],
    schedule: [{ title: "Fatura Nubank", subtitle: "Vence amanhã", value: "R$ 1.240", icon: "receipt", badge: "Atenção" }, { title: "Aluguel", subtitle: "Dia 10", value: "R$ 1.800", icon: "home" }, { title: "Check-in com a coach", subtitle: "Quinta, 19h", icon: "message" }],
    people: [{ title: "Casa", subtitle: "R$ 2.100 de R$ 2.400", progress: 87, icon: "home" }, { title: "Mercado", subtitle: "R$ 640 de R$ 900", progress: 71, icon: "shopping" }, { title: "Lazer", subtitle: "R$ 180 de R$ 400", progress: 45, icon: "heart" }, { title: "Sonho: viagem", subtitle: "R$ 300 de R$ 300", progress: 100, icon: "star" }],
    cards: [{ title: "Por que o dinheiro some?", subtitle: "Módulo 1 · 6 min", icon: "play", badge: "Novo" }, { title: "Envelopes na prática", subtitle: "Módulo 2 · 8 min", icon: "play" }, { title: "Bola de neve das dívidas", subtitle: "Módulo 3 · 7 min", icon: "play" }, { title: "Reserva de emergência", subtitle: "Módulo 4 · 5 min", icon: "play" }],
    chart: chart([1200, 1650, 1400, 2100, 2600, 2900], brl),
    checklist: [{ title: "Anotar gastos de hoje", done: true }, { title: "Dia sem delivery", done: true }, { title: "Revisar envelope Lazer", done: false }, { title: "Assistir aula 3", done: false }],
    progress: [{ title: "Viagem para Porto Seguro", subtitle: "R$ 4.200 de R$ 6.000", progress: 70, icon: "star" }, { title: "Reserva de emergência", subtitle: "R$ 4.700 de R$ 12.000", progress: 39, icon: "shield" }, { title: "Quitar cartão", subtitle: "faltam 4 meses", progress: 62, icon: "target" }],
    feed: [{ title: "Juliana", subtitle: "Quitei meu primeiro cartão! 🎉", meta: "2h" }, { title: "Coach", subtitle: "Desafio da semana: 7 dias sem compras por impulso", meta: "5h" }, { title: "Marina", subtitle: "Envelopes mudaram minha relação com o dinheiro", meta: "1d" }],
    chips: ["Iniciante", "Saindo das dívidas", "Investindo"],
  },
  fieldservice: {
    greeting: "Bom dia, Rafael", heroValue: "8 visitas", heroLabel: "na rota de hoje · 62 km · término 16h40",
    stats: [{ title: "Receita do mês", value: "R$ 14.800", icon: "wallet", meta: "+9%" }, { title: "Clientes ativos", value: "47", icon: "users" }, { title: "A receber", value: "R$ 2.150", icon: "receipt" }],
    schedule: [{ title: "Cond. Vila Verde", subtitle: "08:00 · Piscina 60m³", icon: "route", badge: "1ª" }, { title: "Família Andrade", subtitle: "09:30 · Limpeza + química", icon: "droplet" }, { title: "Academia Fit", subtitle: "11:00 · Leituras", icon: "droplet" }, { title: "Casa Moreira", subtitle: "13:30 · Troca de filtro", icon: "settings" }],
    people: [{ title: "Família Andrade", subtitle: "Pampulha · semanal", meta: "pH 7,4", icon: "user" }, { title: "Cond. Vila Verde", subtitle: "Buritis · 2x semana", meta: "Cloro 2,0", icon: "building" }, { title: "Casa Moreira", subtitle: "Lourdes · quinzenal", meta: "Alerta", badge: "pH 8,1", icon: "user" }, { title: "Academia Fit", subtitle: "Savassi · semanal", meta: "OK", icon: "building" }],
    cards: [{ title: "Cloro granulado 10kg", subtitle: "Estoque: 6", value: "R$ 289", icon: "shopping" }, { title: "Clarificante 1L", subtitle: "Estoque: 2", value: "R$ 39", icon: "droplet", badge: "Repor" }, { title: "Elevador de pH", subtitle: "Estoque: 9", value: "R$ 45", icon: "zap" }],
    chart: chart([9800, 10400, 11200, 12900, 13600, 14800], brl),
    checklist: [{ title: "Aspirar fundo", done: true }, { title: "Escovar bordas", done: true }, { title: "Medir pH e cloro", done: false }, { title: "Foto antes/depois", done: false }],
    progress: [{ title: "pH", subtitle: "Ideal 7,2–7,6", value: "7,4", progress: 74, icon: "droplet" }, { title: "Cloro livre", subtitle: "Ideal 1–3 ppm", value: "2,0", progress: 66, icon: "droplet" }, { title: "Alcalinidade", subtitle: "Ideal 80–120", value: "95", progress: 79, icon: "droplet" }],
    feed: [{ title: "Relatório enviado", subtitle: "Família Andrade recebeu fotos e leituras no WhatsApp", meta: "10:12" }, { title: "Pix recebido", subtitle: "Cond. Vila Verde · R$ 680", meta: "09:40" }, { title: "Orçamento aprovado", subtitle: "Troca de bomba · R$ 1.450", meta: "ontem" }],
    chips: ["Hoje", "Atrasadas", "Concluídas"],
  },
  fitness: {
    greeting: "Bora, Lucas", heroValue: "Treino B", heroLabel: "Peito e tríceps · 52 min · 7 exercícios",
    stats: [{ title: "Sequência", value: "21 dias", icon: "flame" }, { title: "Carga total", value: "12,4 t", icon: "dumbbell", meta: "+8%" }, { title: "Peso", value: "81,2 kg", icon: "trending", meta: "-3,1" }],
    schedule: [{ title: "Supino reto", subtitle: "4 × 10 · 70 kg", icon: "dumbbell" }, { title: "Crucifixo inclinado", subtitle: "3 × 12 · 18 kg", icon: "dumbbell" }, { title: "Paralelas", subtitle: "3 × falha", icon: "dumbbell" }, { title: "Tríceps corda", subtitle: "4 × 12 · 25 kg", icon: "dumbbell" }],
    people: [{ title: "Hipertrofia 12 semanas", subtitle: "Semana 5 de 12", progress: 41, icon: "dumbbell" }, { title: "Core de aço", subtitle: "4 semanas", progress: 0, icon: "target" }, { title: "Corrida 5K", subtitle: "8 semanas", progress: 0, icon: "route" }],
    cards: [{ title: "Hipertrofia 12 semanas", subtitle: "Intermediário · academia", icon: "dumbbell", badge: "Em andamento" }, { title: "Queima total em casa", subtitle: "Iniciante · 25 min", icon: "flame" }, { title: "Mobilidade diária", subtitle: "Todos · 10 min", icon: "leaf" }, { title: "Corrida 5K", subtitle: "Iniciante · 8 semanas", icon: "route" }],
    chart: chart([84.3, 83.6, 83.1, 82.4, 81.9, 81.2], (v) => `${v.toLocaleString("pt-BR")} kg`),
    checklist: [{ title: "2,5 L de água", done: true }, { title: "Treino do dia", done: false }, { title: "8 h de sono", done: true }, { title: "Proteína na meta", done: false }],
    progress: [{ title: "Supino", subtitle: "60 → 70 kg", progress: 80, icon: "trending" }, { title: "Agachamento", subtitle: "80 → 100 kg", progress: 65, icon: "trending" }, { title: "Cintura", subtitle: "94 → 89 cm", progress: 55, icon: "target" }],
    feed: [{ title: "Coach Bia", subtitle: "Boa execução no vídeo! Desce um pouco mais no agachamento.", meta: "08:12" }, { title: "Você", subtitle: "Enviei o vídeo do terra 🏋️", meta: "07:50" }, { title: "Coach Bia", subtitle: "Semana 5 liberada — foco em cadência", meta: "ontem" }],
    chips: ["Academia", "Em casa", "Corrida"],
  },
  health: {
    greeting: "Olá, Fernanda", heroValue: "Qui, 14:00", heroLabel: "Próxima consulta · online com Dra. Paula",
    stats: [{ title: "Adesão ao plano", value: "86%", icon: "check" }, { title: "Humor médio", value: "4,1/5", icon: "heart", meta: "+0,6" }, { title: "Dias registrando", value: "23", icon: "flame" }],
    schedule: [{ title: "Consulta de retorno", subtitle: "Qui, 14:00 · Online", icon: "calendar", badge: "Confirmada" }, { title: "Lembrete: magnésio", subtitle: "Todos os dias, 21:00", icon: "bell" }, { title: "Respiração 4-7-8", subtitle: "Hoje, 22:00", icon: "leaf" }],
    people: [{ title: "Ana Souza", subtitle: "Retorno · qui 14:00", icon: "user" }, { title: "Bruno Lima", subtitle: "1ª consulta · sex 09:00", icon: "user", badge: "Novo" }, { title: "Carla Dias", subtitle: "Online · sex 11:00", icon: "user" }],
    cards: [{ title: "Respiração para ansiedade", subtitle: "Áudio · 6 min", icon: "play" }, { title: "Café da manhã anti-inflamatório", subtitle: "Receita · 10 min", icon: "utensils" }, { title: "Rotina do sono", subtitle: "Guia · 4 min", icon: "book" }],
    chart: chart([3.1, 3.4, 3.3, 3.8, 4.0, 4.1], (v) => v.toLocaleString("pt-BR")),
    checklist: [{ title: "Diário da manhã", done: true }, { title: "Caminhada 20 min", done: true }, { title: "Refeição registrada", done: false }, { title: "Prática de respiração", done: false }],
    progress: [{ title: "Sono", subtitle: "7h12 média", progress: 80, icon: "clock" }, { title: "Hidratação", subtitle: "1,8 de 2,5 L", progress: 72, icon: "droplet" }, { title: "Plano da semana", subtitle: "6 de 7 tarefas", progress: 86, icon: "check" }],
    feed: [{ title: "Dra. Paula", subtitle: "Ótima evolução esta semana. Vamos manter a rotina!", meta: "09:00" }, { title: "Você", subtitle: "Dormi melhor depois da respiração guiada", meta: "ontem" }],
    chips: ["Ansiedade", "Sono", "Alimentação"],
  },
  beauty: {
    greeting: "Olá, Júlia", heroValue: "Sáb, 10:30", heroLabel: "Coloração + escova com Marina",
    stats: [{ title: "Pontos", value: "1.240", icon: "gift" }, { title: "Visitas", value: "18", icon: "calendar" }, { title: "Cashback", value: "R$ 62", icon: "wallet" }],
    schedule: [{ title: "09:00 · Corte feminino", subtitle: "Marina · 45 min", value: "R$ 120", icon: "scissors" }, { title: "10:30 · Coloração", subtitle: "Marina · 2h", value: "R$ 280", icon: "sparkles", badge: "Sinal pago" }, { title: "14:00 · Manicure", subtitle: "Bia · 40 min", value: "R$ 45", icon: "sparkles" }, { title: "15:00 · Barba", subtitle: "Diego · 30 min", value: "R$ 50", icon: "scissors" }],
    people: [{ title: "Marina Alves", subtitle: "Colorista · ★ 4,9", icon: "user" }, { title: "Diego Rocha", subtitle: "Barbeiro · ★ 4,8", icon: "user" }, { title: "Bia Santos", subtitle: "Nail designer · ★ 5,0", icon: "user" }],
    cards: [{ title: "Loiro perolado", subtitle: "Marina", icon: "camera", badge: "Antes/depois" }, { title: "Corte bob", subtitle: "Marina", icon: "camera" }, { title: "Fade clássico", subtitle: "Diego", icon: "camera" }, { title: "Nail art minimal", subtitle: "Bia", icon: "camera" }],
    chart: chart([18200, 19400, 21000, 20500, 23800, 26100], brl),
    checklist: [{ title: "Confirmar agenda de amanhã", done: true }, { title: "Repor tonalizante", done: false }, { title: "Responder avaliações", done: false }],
    progress: [{ title: "Próxima recompensa", subtitle: "Hidratação grátis em 260 pts", progress: 82, icon: "gift" }, { title: "Clube Prestige", subtitle: "2 de 4 visitas no mês", progress: 50, icon: "crown" }],
    feed: [{ title: "★★★★★ Camila", subtitle: "Melhor coloração da vida!", meta: "hoje" }, { title: "★★★★★ Pedro", subtitle: "Diego é o cara.", meta: "ontem" }],
    chips: ["Cabelo", "Unhas", "Barba", "Estética"],
  },
  food: {
    greeting: "Olá, Thiago", heroValue: "Combo da Casa", heroLabel: "Hambúrguer artesanal + fritas + bebida · R$ 42,90",
    stats: [{ title: "Pedidos hoje", value: "86", icon: "receipt", meta: "+14%" }, { title: "Ticket médio", value: "R$ 58", icon: "wallet" }, { title: "Tempo médio", value: "31 min", icon: "clock" }],
    schedule: [{ title: "#1042 · Ana", subtitle: "2 itens · Pix", value: "R$ 74", icon: "receipt", badge: "Preparando" }, { title: "#1041 · Marcos", subtitle: "Retirada 19:30", value: "R$ 39", icon: "receipt", badge: "Pronto" }, { title: "#1040 · Lívia", subtitle: "Entrega · 2,1 km", value: "R$ 112", icon: "truck", badge: "A caminho" }],
    people: [{ title: "Ana Paula", subtitle: "23 pedidos · VIP", icon: "user" }, { title: "Marcos", subtitle: "8 pedidos", icon: "user" }],
    cards: [{ title: "Smash duplo", subtitle: "Blend 160g, cheddar inglês", value: "R$ 36,90", icon: "utensils", badge: "Mais pedido" }, { title: "Batata rústica", subtitle: "Alecrim e páprica", value: "R$ 19,90", icon: "utensils" }, { title: "Brownie com sorvete", subtitle: "Chocolate belga", value: "R$ 22,90", icon: "gift" }, { title: "Limonada suíça", subtitle: "500 ml", value: "R$ 12,90", icon: "droplet" }],
    chart: chart([32100, 34800, 36400, 39900, 41200, 45600], brl),
    checklist: [{ title: "Pedido recebido", done: true }, { title: "Em preparo", done: true }, { title: "Saiu para entrega", done: false }, { title: "Entregue", done: false }],
    progress: [{ title: "Cartão fidelidade", subtitle: "7 de 10 pedidos", progress: 70, icon: "gift" }],
    feed: [{ title: "★★★★★ Lívia", subtitle: "Chegou quentinho!", meta: "hoje" }],
    chips: ["Burgers", "Porções", "Sobremesas", "Bebidas"],
  },
  education: {
    greeting: "Bem-vindo de volta, Pedro", heroValue: "Aula 7", heroLabel: "Módulo 2 · continue de onde parou (4 min restantes)",
    stats: [{ title: "Sequência", value: "12 dias", icon: "flame" }, { title: "XP", value: "3.480", icon: "zap" }, { title: "Concluído", value: "38%", icon: "check" }],
    schedule: [{ title: "Live: perguntas e respostas", subtitle: "Qua, 20:00", icon: "play", badge: "Ao vivo" }, { title: "Entrega do exercício 2", subtitle: "Sex", icon: "file" }, { title: "Mentoria em grupo", subtitle: "Sáb, 10:00", icon: "users" }],
    people: [{ title: "Módulo 1 · Fundamentos", subtitle: "6 aulas", progress: 100, icon: "book" }, { title: "Módulo 2 · Método na prática", subtitle: "8 aulas", progress: 45, icon: "book" }, { title: "Módulo 3 · Escala", subtitle: "7 aulas", progress: 0, icon: "book" }],
    cards: [{ title: "O erro que trava 90% dos iniciantes", subtitle: "Aula 7 · 9 min", icon: "play", badge: "Continuar" }, { title: "Estudo de caso real", subtitle: "Aula 8 · 12 min", icon: "play" }, { title: "Template de planejamento", subtitle: "PDF · material", icon: "file" }, { title: "Checklist da semana", subtitle: "Exercício", icon: "check" }],
    chart: chart([2, 4, 3, 6, 5, 7], (v) => `${v} aulas`),
    checklist: [{ title: "Assistir aula 7", done: false }, { title: "Responder quiz do módulo 1", done: true }, { title: "Postar sua vitória na comunidade", done: false }],
    progress: [{ title: "Método completo", subtitle: "8 de 21 aulas", progress: 38, icon: "graduation" }, { title: "Meta semanal", subtitle: "3 de 5 aulas", progress: 60, icon: "target" }],
    feed: [{ title: "Rodrigo · Nível 4", subtitle: "Apliquei o módulo 2 e fechei meu primeiro cliente!", meta: "1h" }, { title: "Mentor", subtitle: "Live de quarta: mandem perguntas aqui 👇", meta: "3h" }, { title: "Aline · Nível 2", subtitle: "Alguém para estudar junto?", meta: "5h" }],
    chips: ["Todos", "Vitórias", "Dúvidas", "Avisos"],
  },
  realestate: {
    greeting: "Olá, Marcos", heroValue: "12 imóveis", heroLabel: "novos no seu perfil esta semana · Savassi, Lourdes e Funcionários",
    stats: [{ title: "Leads ativos", value: "38", icon: "users", meta: "+6" }, { title: "Visitas", value: "9", icon: "calendar" }, { title: "Propostas", value: "3", icon: "file" }],
    schedule: [{ title: "Sáb 10:00 · Apto 3 qts Lourdes", subtitle: "com Ana e Paulo", icon: "building", badge: "Confirmada" }, { title: "Sáb 14:30 · Casa Pampulha", subtitle: "com Rodrigo", icon: "home" }, { title: "Seg 18:00 · Cobertura Savassi", subtitle: "com Júlia", icon: "building" }],
    people: [{ title: "Ana e Paulo", subtitle: "Compra · até R$ 1,2 mi", icon: "user", badge: "Quente" }, { title: "Rodrigo", subtitle: "Aluguel · até R$ 6 mil", icon: "user" }, { title: "Júlia", subtitle: "Investidora · temporada", icon: "user" }],
    cards: [{ title: "Apto 3 quartos com varanda gourmet", subtitle: "Lourdes · 112 m²", value: "R$ 1.150.000", icon: "building", badge: "Novo" }, { title: "Casa com piscina", subtitle: "Pampulha · 280 m²", value: "R$ 1.890.000", icon: "home" }, { title: "Studio mobiliado", subtitle: "Savassi · 38 m²", value: "R$ 3.200/mês", icon: "building" }],
    chart: chart([3, 5, 4, 7, 6, 9], (v) => `${v} vendas`),
    checklist: [{ title: "RG e CPF", done: true }, { title: "Comprovante de renda", done: true }, { title: "Certidão de casamento", done: false }, { title: "Extrato do FGTS", done: false }],
    progress: [{ title: "Financiamento aprovado", subtitle: "Etapa 3 de 5", progress: 60, icon: "shield" }, { title: "Documentação", subtitle: "2 de 4 enviados", progress: 50, icon: "file" }],
    feed: [{ title: "Proposta recebida", subtitle: "Apto Lourdes · R$ 1.080.000", meta: "10:12" }, { title: "Visita confirmada", subtitle: "Casa Pampulha · sáb 14:30", meta: "ontem" }],
    chips: ["Comprar", "Alugar", "Temporada"],
  },
  pets: {
    greeting: "Oi, Bruna", heroValue: "Thor", heroLabel: "Banho e tosa amanhã às 10h · leva-e-traz incluso",
    stats: [{ title: "Vacinas em dia", value: "5/6", icon: "shield" }, { title: "Banhos no mês", value: "3/4", icon: "droplet" }, { title: "Pontos", value: "820", icon: "gift" }],
    schedule: [{ title: "Amanhã 10:00 · Banho e tosa", subtitle: "Thor · leva-e-traz", value: "R$ 95", icon: "paw", badge: "Confirmado" }, { title: "Sex 16:00 · Consulta", subtitle: "Luna · Dra. Camila", icon: "heart" }, { title: "20/11 · Vacina V10", subtitle: "Thor · reforço anual", icon: "shield" }],
    people: [{ title: "Thor", subtitle: "Golden · 32 kg · 4 anos", icon: "paw" }, { title: "Luna", subtitle: "Siamês · 4 kg · 2 anos", icon: "paw" }],
    cards: [{ title: "Ração Premium 15kg", subtitle: "Compra programada", value: "R$ 289", icon: "shopping", badge: "-10%" }, { title: "Petisco natural", subtitle: "Pacote 500g", value: "R$ 39", icon: "gift" }, { title: "Spa hidratação", subtitle: "Pelagem brilhante", value: "R$ 70", icon: "sparkles" }],
    chart: chart([31.2, 31.6, 31.9, 32.1, 32.0, 32.3], (v) => `${v.toLocaleString("pt-BR")} kg`),
    checklist: [{ title: "Vermífugo do mês", done: true }, { title: "Antipulgas", done: false }, { title: "Escovar os dentes", done: false }],
    progress: [{ title: "V10", subtitle: "Reforço em 35 dias", progress: 90, icon: "shield" }, { title: "Antirrábica", subtitle: "Em dia até mar/26", progress: 100, icon: "shield" }, { title: "Giárdia", subtitle: "Atrasada 12 dias", progress: 20, icon: "shield" }],
    feed: [{ title: "Pet Spa", subtitle: "O Thor já está cheiroso! 🐶 (3 fotos)", meta: "10:40" }, { title: "Dra. Camila", subtitle: "Exames da Luna normais.", meta: "ontem" }],
    chips: ["Cães", "Gatos", "Serviços"],
  },
  retail: {
    greeting: "Olá, Isabela", heroValue: "Coleção Verão", heroLabel: "Linho, tons de areia e peças que viajam com você · frete grátis acima de R$ 299",
    stats: [{ title: "Cashback", value: "R$ 48", icon: "wallet" }, { title: "Pedidos", value: "7", icon: "truck" }, { title: "Desejos", value: "12", icon: "heart" }],
    schedule: [{ title: "#2231 · Vestido Linho Areia", subtitle: "Chega amanhã", value: "R$ 389", icon: "truck", badge: "A caminho" }, { title: "#2198 · Camisa Off-white", subtitle: "Entregue 02/10", value: "R$ 249", icon: "check" }],
    people: [{ title: "Vestido Linho Areia", subtitle: "Tam. M · avise-me", icon: "heart" }, { title: "Bolsa Palha Natural", subtitle: "Voltou ao estoque", icon: "heart", badge: "Disponível" }],
    cards: [{ title: "Vestido Linho Areia", subtitle: "P · M · G", value: "R$ 389", icon: "sparkles", badge: "Novo" }, { title: "Calça Pantalona", subtitle: "Off-white", value: "R$ 329", icon: "sparkles" }, { title: "Bolsa Palha", subtitle: "Artesanal", value: "R$ 219", icon: "shopping" }, { title: "Sandália Couro", subtitle: "Caramelo", value: "R$ 279", icon: "shopping" }],
    chart: chart([21000, 23800, 22500, 27900, 31200, 36400], brl),
    checklist: [{ title: "Pedido confirmado", done: true }, { title: "Separado", done: true }, { title: "Enviado", done: true }, { title: "Entregue", done: false }],
    progress: [{ title: "Clube VIP", subtitle: "R$ 640 de R$ 1.000 para subir de nível", progress: 64, icon: "crown" }],
    feed: [{ title: "★★★★★ Carol", subtitle: "Caimento perfeito, tecido maravilhoso.", meta: "hoje" }, { title: "★★★★★ Lia", subtitle: "Chegou em 2 dias!", meta: "ontem" }],
    chips: ["Novidades", "Vestidos", "Acessórios", "Sale"],
  },
};

/** Nicho fora da biblioteca: o conteúdo das telas é montado a partir do PRD e do texto do usuário. */
function genericSample(prd: PRD, input: ProjectInput): Sample {
  const f = prd.mustHave;
  const icons: IconName[] = ["sparkles", "star", "zap", "target", "heart", "crown"];
  const topic = input.what.toLowerCase();
  return {
    greeting: "Olá, Ana",
    heroValue: prd.appName,
    heroLabel: f[0]?.description ?? prd.tagline,
    stats: [{ title: "Clientes ativos", value: "128", icon: "users", meta: "+18%" }, { title: "Este mês", value: "R$ 12.400", icon: "wallet", meta: "+9%" }, { title: "Avaliação", value: "4,9", icon: "star" }],
    schedule: f.slice(1, 4).map((x, i) => ({ title: x.name, subtitle: ["Hoje", "Amanhã", "Esta semana"][i], icon: icons[i] })),
    people: f.slice(0, 4).map((x, i) => ({ title: x.name, subtitle: x.description.slice(0, 60), icon: icons[i % icons.length] })),
    cards: f.slice(0, 6).map((x, i) => ({ title: x.name, subtitle: x.why.slice(0, 40), icon: icons[i % icons.length], badge: i === 0 ? "Destaque" : undefined })),
    chart: chart([5200, 6100, 7400, 8300, 10100, 12400], brl),
    checklist: [{ title: `Completar perfil de ${topic}`.slice(0, 60), done: true }, { title: f[1]?.name ?? "Explorar o app", done: false }, { title: f[2]?.name ?? "Convidar um amigo", done: false }],
    progress: [{ title: "Sua jornada", subtitle: "3 de 5 etapas", progress: 60, icon: "target" }, { title: f[5]?.name ?? "Histórico", subtitle: "Atualizado hoje", progress: 80, icon: "trending" }],
    feed: [{ title: "Equipe " + prd.appName, subtitle: `Bem-vinda! Conte o que você procura em ${topic}.`, meta: "agora" }, { title: "Você", subtitle: "Quero saber mais sobre os planos.", meta: "1 min" }],
    chips: ["Todos", "Novidades", "Favoritos"],
  };
}

function sampleFor(id: string, prd: PRD, input: ProjectInput): Sample {
  return SAMPLES[id] ?? genericSample(prd, input);
}

/* ---------- Motor offline: monta telas a partir das abas e do PRD ---------- */

const SUBTITLES: Record<string, (a: Archetype) => string> = {
  money: () => "Receitas, cobranças e Pix em um só lugar",
  budget: () => "Cada real com uma função",
  goals: () => "Seus sonhos com data marcada",
  progress: () => "Sua evolução, semana a semana",
  rewards: () => "Quanto mais você volta, mais ganha",
  health: () => "Vacinas, histórico e cuidados em dia",
  community: () => "Aprenda junto, celebre junto",
  chat: () => "Fale direto com quem te acompanha",
  clients: (a) => `Todos os seus ${a.units.client}s e o histórico de cada um`,
  favorites: () => "Os que você mais gostou",
  wishlist: () => "Avisamos quando baixar o preço",
  agenda: () => "Confirmação automática pelo WhatsApp",
  book: () => "Escolha o serviço, o horário e pronto",
  visits: () => "Visitas confirmadas e próximas",
  orders: () => "Acompanhe cada pedido em tempo real",
  practice: () => "Coloque o método em prática hoje",
  plan: () => "O que fazer até a próxima consulta",
  map: () => "Menos trânsito, mais atendimentos",
  explore: () => "Tudo o que você oferece, em um só lugar",
};

function screenFor(tab: { id: string; label: string }, archetype: Archetype, prd: PRD, s: Sample, index: number): SpecScreen {
  const sub = SUBTITLES[tab.id]?.(archetype);
  const premium = prd.luxury[index % prd.luxury.length];
  const f = (i: number) => prd.mustHave[i % prd.mustHave.length];
  const sec = (x: Partial<SpecSection> & { kind: SpecSection["kind"] }): SpecSection => ({ items: [], ...x });

  switch (tab.id) {
    case "home":
      return {
        id: tab.id, title: s.greeting, subtitle: prd.tagline,
        sections: [
          sec({ kind: "hero", title: s.heroValue, subtitle: s.heroLabel, cta: "Começar agora" }),
          sec({ kind: "stats", items: s.stats }),
          sec({ kind: "schedule", title: "Próximos", items: s.schedule }),
          sec({ kind: "checklist", title: "Hoje", items: s.checklist }),
          sec({ kind: "cta", title: premium.name, subtitle: premium.description, cta: "Conhecer o premium", premium: true }),
        ],
      };
    case "profile":
      return {
        id: tab.id, title: "Perfil", subtitle: "Conta, plano e preferências",
        sections: [
          sec({ kind: "profile", title: s.greeting.replace(/^[^,]+,\s*/, "") || "Você", subtitle: `Plano ${prd.plans[1]?.name ?? "Pro"}`, items: s.stats.slice(0, 3) }),
          sec({ kind: "pricing", title: "Planos", items: prd.plans.map((p, i) => ({ title: p.name, value: p.priceBRL ? `R$ ${p.priceBRL.toFixed(2).replace(".", ",")}` : "Grátis", subtitle: p.pitch, meta: p.includes.slice(0, 3).join(" · "), badge: i === 1 ? "Mais escolhido" : undefined })) }),
          sec({ kind: "list", title: "Configurações", items: [{ title: "Notificações e WhatsApp", icon: "bell" }, { title: "Pagamentos e Pix", icon: "wallet" }, { title: "Privacidade (LGPD)", icon: "shield" }, { title: "Ajuda", icon: "message" }] }),
        ],
      };
    case "money":
    case "budget":
      return {
        id: tab.id, title: tab.label, subtitle: sub,
        sections: [
          sec({ kind: "stats", items: s.stats }),
          sec({ kind: "chart", title: "Evolução", items: s.chart }),
          sec({ kind: archetype.id === "finance" ? "progress" : "list", title: archetype.id === "finance" ? "Envelopes" : "Movimentações", items: archetype.id === "finance" ? s.people : s.feed.map((x) => ({ ...x, icon: x.icon ?? "receipt" })) }),
          sec({ kind: "cta", title: f(6).name, subtitle: f(6).description, cta: "Gerar cobrança" }),
        ],
      };
    case "goals":
    case "progress":
    case "rewards":
    case "health":
      return {
        id: tab.id, title: tab.label, subtitle: sub,
        sections: [
          sec({ kind: "progress", title: "Em andamento", items: s.progress }),
          sec({ kind: "chart", title: "Sua evolução", items: s.chart }),
          sec({ kind: "chips", title: "Filtrar", items: s.chips.map((c) => ({ title: c })) }),
        ],
      };
    case "community":
    case "chat":
      return {
        id: tab.id, title: tab.label, subtitle: sub,
        sections: [sec({ kind: "chips", items: s.chips.map((c) => ({ title: c })) }), sec({ kind: "timeline", title: "Recentes", items: s.feed }), sec({ kind: "cta", title: "Escreva algo", subtitle: "Compartilhe uma vitória ou dúvida", cta: "Publicar" })],
      };
    case "clients":
    case "favorites":
    case "wishlist":
      return {
        id: tab.id, title: tab.label, subtitle: sub,
        sections: [sec({ kind: "chips", items: s.chips.map((c) => ({ title: c })) }), sec({ kind: "list", title: `${s.people.length} ${archetype.units.client}s`, items: s.people }), sec({ kind: "cta", title: `Novo ${archetype.units.client}`, subtitle: "Cadastro em 30 segundos", cta: "Adicionar" })],
      };
    case "agenda":
    case "book":
    case "visits":
    case "orders":
      return {
        id: tab.id, title: tab.label, subtitle: sub,
        sections: [sec({ kind: "chips", items: ["Hoje", "Amanhã", "Semana"].map((c) => ({ title: c })) }), sec({ kind: "schedule", title: "Agenda", items: s.schedule }), sec({ kind: "cta", title: f(0).name, subtitle: "Confirmação automática no WhatsApp", cta: "Agendar" })],
      };
    case "practice":
    case "plan":
      return {
        id: tab.id, title: tab.label, subtitle: sub,
        sections: [sec({ kind: "checklist", title: "Para hoje", items: s.checklist }), sec({ kind: "progress", title: "Progresso", items: s.progress })],
      };
    case "map":
      return {
        id: tab.id, title: tab.label, subtitle: sub,
        sections: [sec({ kind: "hero", title: "Rota otimizada", subtitle: s.heroLabel, cta: "Abrir no Waze" }), sec({ kind: "schedule", title: "Paradas", items: s.schedule })],
      };
    default:
      return {
        id: tab.id, title: tab.label, subtitle: sub ?? f(index + 2).description,
        sections: [sec({ kind: "chips", items: s.chips.map((c) => ({ title: c })) }), sec({ kind: "cards", title: f(index + 2).name, items: s.cards }), sec({ kind: "list", title: "Mais", items: s.people })],
      };
  }
}

export function offlineAppSpec(archetype: Archetype, prd: PRD, ds: DesignSystem, input: ProjectInput, ebook?: EbookExtraction | null): AppSpec {
  const s = withEbook(sampleFor(archetype.id, prd, input), ebook);
  return {
    name: prd.appName,
    tagline: prd.tagline,
    theme: themeFrom(ds),
    onboarding: {
      headline: prd.tagline,
      sub: `Feito para ${input.who || prd.personas[0]?.profile || "você"}${input.where ? ` em ${input.where}` : ""}. ${prd.mustHave[0]?.description ?? ""}`,
      cta: "Começar grátis",
      bullets: prd.mustHave.slice(0, 3).map((f) => f.name),
    },
    tabs: archetype.tabs,
    screens: archetype.tabs.map((t, i) => screenFor(t, archetype, prd, s, i)),
  };
}

/** O método do e-book vira conteúdo real do app: capítulos → aulas, exercícios → checklist. */
function withEbook(s: Sample, ebook?: EbookExtraction | null): Sample {
  if (!ebook || !ebook.chapters.length) return s;
  return {
    ...s,
    cards: ebook.chapters.slice(0, 6).map((c, i) => ({ title: c.title, subtitle: `Módulo ${i + 1}`, icon: "play" as const, badge: i === 0 ? "Comece aqui" : undefined })),
    checklist: ebook.exercises.length ? ebook.exercises.slice(0, 4).map((e, i) => ({ title: e.length > 70 ? `${e.slice(0, 67)}…` : e, done: i === 0 })) : s.checklist,
  };
}

export function themeFrom(ds: DesignSystem): SpecTheme {
  return { ...ds.colors, radius: ds.radius, fontDisplay: ds.fonts.display, fontBody: ds.fonts.body, dark: ds.dark };
}

/* ---------- Motor Claude ---------- */

const ItemSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  value: z.string().optional(),
  meta: z.string().optional(),
  icon: z.enum(ICON_NAMES).optional(),
  badge: z.string().optional(),
  progress: z.number().optional().describe("0 a 100"),
  done: z.boolean().optional(),
});

const SpecContentSchema = z.object({
  onboarding: z.object({ headline: z.string(), sub: z.string(), cta: z.string(), bullets: z.array(z.string()) }),
  tabs: z.array(z.object({ id: z.string().describe("slug curto, a primeira deve ser 'home' e a última 'profile'"), label: z.string(), icon: z.enum(ICON_NAMES) })).describe("4 ou 5 abas"),
  screens: z.array(
    z.object({
      id: z.string().describe("igual ao id da aba"),
      title: z.string(),
      subtitle: z.string().optional(),
      sections: z.array(
        z.object({
          kind: z.enum(SECTION_KINDS),
          title: z.string().optional(),
          subtitle: z.string().optional(),
          items: z.array(ItemSchema),
          cta: z.string().optional(),
          premium: z.boolean().optional(),
        }),
      ),
    }),
  ),
});

const SPEC_GUIDE = `Tipos de seção disponíveis e como usar "items":
- hero: destaque principal (title = número/valor grande, subtitle = contexto, cta)
- stats: 3 KPIs (title = rótulo, value = número, meta = variação, icon)
- list: linhas (title, subtitle, meta, icon, badge)
- cards: cards horizontais de conteúdo/produto (title, subtitle, value, icon, badge)
- chart: 6 barras (title = mês, value = rótulo, progress = altura 0-100)
- progress: barras de progresso (title, subtitle, progress)
- schedule: itens com horário (title começa com o horário ou nome, subtitle, value, badge)
- checklist: tarefas (title, done)
- pricing: planos (title, value = preço, subtitle = pitch, meta = inclui, badge)
- cta: chamada (title, subtitle, cta, premium=true para upsell)
- chips: filtros (items com só title)
- timeline: feed/mensagens (title = autor, subtitle = texto, meta = hora)
- profile: cabeçalho de perfil (title = nome, subtitle = plano, items = 3 stats)`;

export async function generateAppSpec(opts: { archetype: Archetype; prd: PRD; ds: DesignSystem; input: ProjectInput; ebook?: EbookExtraction | null }): Promise<{ spec: AppSpec; engine: "claude" | "offline" }> {
  const offline = offlineAppSpec(opts.archetype, opts.prd, opts.ds, opts.input, opts.ebook);
  if (!llmEnabled()) return { spec: offline, engine: "offline" };
  try {
    const content = await generateStructured({
      system: "Você é um designer de produto sênior que desenha apps mobile brasileiros com cara de produto de 1 milhão: dados realistas, microcopy afiada, hierarquia clara. Nada de lorem ipsum.",
      user: `Desenhe as telas do app "${opts.prd.appName}" (${opts.prd.tagline}).

PRD (resumo):
- Must-have: ${opts.prd.mustHave.map((f) => f.name).join("; ")}
- Luxo: ${opts.prd.luxury.map((f) => f.name).join("; ")}
- Planos: ${opts.prd.plans.map((p) => `${p.name} R$${p.priceBRL}`).join("; ")}
${opts.ebook ? `- E-book do especialista (use capítulos como aulas e exercícios como checklists): ${JSON.stringify({ chapters: opts.ebook.chapters, exercises: opts.ebook.exercises })}\n` : ""}- Público: ${opts.input.who || opts.prd.personas[0]?.profile} · Local: ${opts.input.where || "Brasil"}
- Voz: ${opts.prd.brandVoice}

Regras:
- 4 ou 5 abas; cada aba tem exatamente uma tela com o mesmo id; 3 a 5 seções por tela
- A tela 'home' abre com hero + stats; a 'profile' tem pricing com os 3 planos
- Dados de exemplo realistas e brasileiros (nomes, bairros de ${opts.input.where || "uma capital"}, valores em R$)
- Inclua ao menos um cta premium com uma feature de luxo
- Use só os ícones permitidos

${SPEC_GUIDE}`,
      schema: SpecContentSchema,
    });
    const tabs = content.tabs.slice(0, 5);
    const screens = tabs.map((t, i) => content.screens.find((s) => s.id === t.id) ?? offline.screens[i] ?? offline.screens[0]);
    if (tabs.length < 3) return { spec: offline, engine: "offline" };
    return {
      spec: { ...offline, onboarding: content.onboarding, tabs: tabs as AppSpec["tabs"], screens: screens as SpecScreen[] },
      engine: "claude",
    };
  } catch (err) {
    console.warn("[spec] Claude falhou, usando motor offline:", (err as Error).message);
    return { spec: offline, engine: "offline" };
  }
}

export type { IconName };
