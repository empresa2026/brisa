/**
 * Base de conhecimento de nichos.
 *
 * Usada para (1) traduzir o tema do leigo em termos de busca para o Reference Engine,
 * (2) servir de biblioteca curada quando as fontes ao vivo estão indisponíveis e
 * (3) alimentar o motor offline do PM Engine quando não há chave da Claude.
 *
 * Todas as referências curadas são apps/repos reais e públicos. Os links da Play Store e
 * do Behance apontam para buscas, que nunca quebram.
 */
import type { IconName } from "./build-engine/spec-types";

export interface Feature {
  name: string;
  description: string;
  why: string;
}

export interface CuratedApp {
  title: string;
  developer: string;
  query: string;
  summary: string;
  features: string[];
}

export interface Archetype {
  id: string;
  label: string;
  keywords: string[];
  searchTerms: string[];
  designTerms: string[];
  apps: CuratedApp[];
  repos: { fullName: string; description: string }[];
  mustHave: Feature[];
  luxury: Feature[];
  plans: { name: string; priceBRL: number; pitch: string; includes: string[] }[];
  entities: { name: string; label: string; fields: [string, string][] }[];
  tabs: { id: string; label: string; icon: IconName }[];
  mood: "trust" | "energy" | "calm" | "luxury" | "warm" | "fresh" | "playful";
  units: { client: string; job: string; money: string };
}

const pixAndWhatsapp: Feature[] = [
  {
    name: "Cobrança via Pix e cartão com link",
    description: "Gera cobrança, envia link e baixa automática quando o pagamento cai, com recibo em PDF.",
    why: "Reviews de apps de gestão citam 'receber' como a dor nº 1; no Brasil, Pix é o meio dominante.",
  },
  {
    name: "Lembretes automáticos no WhatsApp",
    description: "Confirmação de horário, lembrete na véspera e aviso de cobrança, com templates editáveis.",
    why: "Reduz faltas e inadimplência — é o canal que o cliente brasileiro realmente lê.",
  },
];

export const ARCHETYPES: Archetype[] = [
  {
    id: "finance",
    label: "Finanças pessoais e educação financeira",
    keywords: ["finan", "dinheiro", "invest", "orçament", "orcament", "dívida", "divida", "contábil", "contabil", "poupar", "renda", "budget", "money", "milionári", "economia"],
    searchTerms: ["personal finance", "budget planner", "money coach"],
    designTerms: ["finance app", "budget app ui"],
    apps: [
      { title: "Mobills", developer: "Mobills Labs", query: "Mobills controle financeiro", summary: "Controle de gastos e orçamento com categorias, cartões e metas.", features: ["Orçamento por categoria", "Controle de cartões de crédito", "Metas de economia", "Relatórios visuais", "Alertas de contas a pagar"] },
      { title: "Organizze", developer: "Organizze", query: "Organizze finanças", summary: "Finanças pessoais simples, foco em clareza e rotina diária.", features: ["Lançamento rápido", "Contas recorrentes", "Gráficos mensais", "Sincronização web/app"] },
      { title: "YNAB", developer: "You Need A Budget", query: "YNAB budget", summary: "Método de orçamento base zero com forte componente educativo.", features: ["Orçamento base zero", "Metas por envelope", "Conteúdo educativo", "Relatórios de idade do dinheiro"] },
    ],
    repos: [
      { fullName: "actualbudget/actual", description: "Local-first personal finance app (envelope budgeting)." },
      { fullName: "firefly-iii/firefly-iii", description: "Self-hosted personal finances manager." },
      { fullName: "maybe-finance/maybe", description: "Personal finance + wealth management app." },
    ],
    mustHave: [
      { name: "Diagnóstico financeiro em 3 minutos", description: "Quiz guiado que gera o 'raio-x' da cliente: renda, dívidas, gastos fixos e perfil comportamental.", why: "YNAB e o método de coaching começam pelo diagnóstico; reduz abandono no 1º dia." },
      { name: "Orçamento por envelopes", description: "Cada real recebe uma função (casa, lazer, sonho), com saldo visual por envelope.", why: "Feature central do YNAB e do Actual Budget, a mais elogiada nos reviews." },
      { name: "Lançamento rápido de gastos", description: "Registrar gasto em 2 toques, com sugestão de categoria e foto do cupom.", why: "Organizze é elogiado pela rapidez; reviews negativos citam 'dá preguiça de lançar'." },
      { name: "Plano de quitação de dívidas", description: "Simula bola de neve vs. avalanche e mostra a data da liberdade.", why: "Dívida é a principal dor do público feminino 30-45 nas buscas do tema." },
      { name: "Metas com sonho visual", description: "Meta com foto, valor, prazo e quanto guardar por semana.", why: "Mobills: 'metas' entre as features mais citadas nas avaliações 5 estrelas." },
      { name: "Trilha de aulas curtas", description: "Microaulas de 5 minutos liberadas conforme o progresso da aluna.", why: "Transforma o método da coach em produto escalável (conteúdo + ferramenta)." },
      { name: "Desafios de 21 dias", description: "Desafios diários (ex: 'sem delivery') com check-in e streak.", why: "Gamificação aumenta retenção D30, padrão em apps educativos de alto faturamento." },
      { name: "Relatório mensal automático", description: "Resumo do mês com evolução, onde vazou dinheiro e próxima ação.", why: "Relatórios visuais são o motivo nº 1 de upgrade para premium no Mobills." },
      { name: "Alertas de contas a vencer", description: "Notificação antes do vencimento de contas e faturas.", why: "Evita juros — benefício tangível citado em reviews." },
      { name: "Comunidade e check-in com a coach", description: "Feed de vitórias das alunas e perguntas semanais respondidas pela coach.", why: "Prova social + acesso à especialista justificam assinatura recorrente." },
    ],
    luxury: [
      { name: "Sessão 1:1 agendada no app", description: "Agenda de mentoria individual com vídeo e pagamento embutidos.", why: "Ticket alto: cliente que quer atenção exclusiva paga 10x mais." },
      { name: "Open Finance automático", description: "Importa extratos dos bancos sem digitar nada.", why: "Monarch/Mobills Premium cobram por conexão bancária automática." },
      { name: "Planejamento de independência financeira", description: "Simulador de aposentadoria e renda passiva com cenários.", why: "Público de renda maior busca 'quando posso parar de trabalhar'." },
      { name: "Plano familiar compartilhado", description: "Orçamento do casal/família com permissões.", why: "Upsell clássico de apps de finanças." },
      { name: "Concierge de investimentos", description: "Carteira sugerida pela coach com revisão trimestral.", why: "Serviço de alto valor percebido para clientes que já saíram das dívidas." },
    ],
    plans: [
      { name: "Essencial", priceBRL: 29.9, pitch: "Organize seu dinheiro com o método", includes: ["Diagnóstico", "Orçamento por envelopes", "Trilha básica de aulas", "Desafios"] },
      { name: "Pro", priceBRL: 79.9, pitch: "Saia das dívidas com acompanhamento", includes: ["Tudo do Essencial", "Plano de quitação", "Relatórios mensais", "Comunidade + check-in semanal"] },
      { name: "Elite", priceBRL: 397, pitch: "Mentoria individual e patrimônio", includes: ["Tudo do Pro", "2 sessões 1:1/mês", "Open Finance", "Concierge de investimentos"] },
    ],
    entities: [
      { name: "accounts", label: "Contas", fields: [["name", "text"], ["kind", "text"], ["balance", "numeric"]] },
      { name: "transactions", label: "Lançamentos", fields: [["account_id", "uuid"], ["category", "text"], ["amount", "numeric"], ["occurred_on", "date"], ["note", "text"]] },
      { name: "envelopes", label: "Envelopes", fields: [["name", "text"], ["monthly_limit", "numeric"], ["spent", "numeric"]] },
      { name: "goals", label: "Metas", fields: [["title", "text"], ["target_amount", "numeric"], ["saved_amount", "numeric"], ["due_on", "date"]] },
      { name: "debts", label: "Dívidas", fields: [["creditor", "text"], ["balance", "numeric"], ["interest_rate", "numeric"], ["min_payment", "numeric"]] },
      { name: "lessons", label: "Aulas", fields: [["title", "text"], ["module", "text"], ["video_url", "text"], ["position", "integer"]] },
    ],
    tabs: [
      { id: "home", label: "Início", icon: "home" },
      { id: "budget", label: "Orçamento", icon: "wallet" },
      { id: "goals", label: "Metas", icon: "target" },
      { id: "learn", label: "Aulas", icon: "book" },
      { id: "profile", label: "Perfil", icon: "user" },
    ],
    mood: "trust",
    units: { client: "aluna", job: "plano", money: "R$" },
  },
  {
    id: "fieldservice",
    label: "Serviços em campo (piscinas, limpeza, manutenção)",
    keywords: ["piscina", "pool", "limpeza", "manutenç", "manutenc", "eletricist", "encanador", "jardin", "dedetiz", "ar-condicionado", "ar condicionado", "técnico", "tecnico", "instalação", "instalacao", "reforma", "diarista", "lavagem"],
    searchTerms: ["pool service", "field service management", "cleaning business"],
    designTerms: ["pool maintenance app", "field service app"],
    apps: [
      { title: "Pool Guy Pro", developer: "Pool Guy Pro", query: "Pool Guy Pro", summary: "Ideal swimming pool service management: manage customers' pools easily and keep track of test results.", features: ["Cadastro de clientes e piscinas", "Histórico de testes químicos", "Rotas do dia", "Fotos do serviço"] },
      { title: "Dip", developer: "Dip", query: "Dip pool service", summary: "Managing pool service business: routes, readings, invoicing.", features: ["Rotas otimizadas", "Leituras químicas", "Faturamento", "Relatório ao cliente"] },
      { title: "Jobber", developer: "Jobber", query: "Jobber field service", summary: "Gestão de serviços em campo: orçamentos, agenda, equipes e cobrança.", features: ["Orçamento com aprovação online", "Agenda de equipe", "Cobrança e recibos", "Portal do cliente"] },
    ],
    repos: [
      { fullName: "invoiceninja/invoiceninja", description: "Invoices, quotes, payments and client portal — open source." },
      { fullName: "kimai/kimai", description: "Open source time-tracking for teams and freelancers." },
    ],
    mustHave: [
      { name: "Rota do dia otimizada", description: "Lista de visitas na melhor ordem, com navegação por Waze/Maps e tempo estimado.", why: "Dip e Jobber: rotas são a feature que economiza horas por semana." },
      { name: "Ficha técnica por cliente", description: "Cada cliente com endereço, equipamento (ex: piscina, volume, filtro) e observações.", why: "Pool Guy Pro: 'manage customers pools easily'." },
      { name: "Registro de leituras e medições", description: "pH, cloro, alcalinidade (ou medições do serviço) com histórico e alerta fora da faixa.", why: "Pool Guy Pro e Dip: 'keep track of test results / readings'." },
      { name: "Checklist do serviço com fotos", description: "Checklist padrão por tipo de serviço, com fotos antes/depois.", why: "Prova de serviço reduz contestação e gera confiança." },
      { name: "Relatório automático ao cliente", description: "Ao concluir, o cliente recebe no WhatsApp o resumo com fotos e leituras.", why: "Diferencial percebido como 'empresa grande' — reviews elogiam." },
      { name: "Orçamento com aprovação online", description: "Orçamento bonito em PDF/link com botão 'aprovar'.", why: "Jobber: aprovação online aumenta conversão de orçamentos." },
      ...pixAndWhatsapp,
      { name: "Estoque de produtos e insumos", description: "Controle de produtos usados por visita e alerta de reposição.", why: "SWIMMER concept: venda de produtos de manutenção junto ao serviço." },
      { name: "Painel de faturamento", description: "Receita do mês, clientes ativos, inadimplência e ticket médio.", why: "Dono do negócio precisa enxergar se está lucrando." },
    ],
    luxury: [
      { name: "Gestão de equipe com GPS", description: "Técnicos com app próprio, check-in por geolocalização e produtividade.", why: "Escala de 1 para 10 técnicos — Jobber cobra caro por isso." },
      { name: "Loja de produtos integrada", description: "Cliente compra produtos pelo app e o técnico entrega na visita.", why: "SWIMMER concept: receita extra por cliente." },
      { name: "Contratos recorrentes com reajuste", description: "Planos mensais com cobrança recorrente e reajuste anual automático.", why: "Receita previsível valoriza o negócio." },
      { name: "Portal do cliente premium", description: "Cliente vê histórico, agenda extra e chat direto.", why: "Condomínios e clientes de alto padrão exigem." },
      { name: "Sensores IoT", description: "Integração com medidores automáticos e alertas em tempo real.", why: "Serviço premium para residências de luxo." },
    ],
    plans: [
      { name: "Autônomo", priceBRL: 49.9, pitch: "Para quem atende sozinho", includes: ["Até 40 clientes", "Rotas e checklist", "Relatório ao cliente", "Cobrança Pix"] },
      { name: "Empresa", priceBRL: 149.9, pitch: "Para equipes de até 5 técnicos", includes: ["Clientes ilimitados", "Equipe com GPS", "Orçamentos online", "Estoque"] },
      { name: "Premium", priceBRL: 399, pitch: "Para operações de alto padrão", includes: ["Tudo do Empresa", "Loja integrada", "Portal premium", "Sensores e suporte dedicado"] },
    ],
    entities: [
      { name: "clients", label: "Clientes", fields: [["name", "text"], ["phone", "text"], ["address", "text"], ["notes", "text"]] },
      { name: "sites", label: "Locais/Equipamentos", fields: [["client_id", "uuid"], ["kind", "text"], ["volume", "numeric"], ["details", "jsonb"]] },
      { name: "visits", label: "Visitas", fields: [["site_id", "uuid"], ["scheduled_at", "timestamptz"], ["status", "text"], ["route_order", "integer"]] },
      { name: "readings", label: "Leituras", fields: [["visit_id", "uuid"], ["metric", "text"], ["value", "numeric"]] },
      { name: "invoices", label: "Cobranças", fields: [["client_id", "uuid"], ["amount", "numeric"], ["due_on", "date"], ["status", "text"]] },
      { name: "products", label: "Produtos", fields: [["name", "text"], ["stock", "integer"], ["price", "numeric"]] },
    ],
    tabs: [
      { id: "home", label: "Hoje", icon: "route" },
      { id: "clients", label: "Clientes", icon: "users" },
      { id: "agenda", label: "Agenda", icon: "calendar" },
      { id: "money", label: "Financeiro", icon: "wallet" },
      { id: "profile", label: "Perfil", icon: "settings" },
    ],
    mood: "fresh",
    units: { client: "cliente", job: "visita", money: "R$" },
  },
  {
    id: "fitness",
    label: "Fitness, treino e esporte",
    keywords: ["personal", "academia", "treino", "fitness", "crossfit", "corrida", "yoga", "pilates", "musculação", "musculacao", "emagrec", "funcional", "atleta", "esporte", "natação", "natacao"],
    searchTerms: ["personal trainer app", "workout planner", "fitness coaching"],
    designTerms: ["fitness app", "workout app ui"],
    apps: [
      { title: "Nike Training Club", developer: "Nike, Inc.", query: "Nike Training Club", summary: "Treinos guiados em vídeo por objetivo e nível.", features: ["Treinos em vídeo", "Programas de várias semanas", "Filtros por equipamento", "Histórico de treinos"] },
      { title: "Trainerize", developer: "ABC Trainerize", query: "Trainerize personal trainer", summary: "Plataforma para personal trainers venderem e acompanharem treinos online.", features: ["Prescrição de treino", "Chat com aluno", "Check-in de hábitos", "Pagamentos"] },
      { title: "Strava", developer: "Strava Inc.", query: "Strava", summary: "Rede social de corrida e ciclismo com GPS.", features: ["Registro por GPS", "Segmentos e rankings", "Clubes", "Desafios mensais"] },
    ],
    repos: [
      { fullName: "wger-project/wger", description: "Self-hosted FLOSS fitness/workout, nutrition and weight tracker." },
      { fullName: "OpenTracksApp/OpenTracks", description: "Sport tracking application that respects your privacy." },
    ],
    mustHave: [
      { name: "Avaliação inicial guiada", description: "Questionário + fotos + medidas que geram o ponto de partida do aluno.", why: "Trainerize começa pela avaliação; base para mostrar evolução." },
      { name: "Treino do dia com vídeo", description: "Cada exercício com vídeo curto, séries, carga e descanso cronometrado.", why: "Nike Training Club: vídeo é o que o usuário mais elogia." },
      { name: "Registro de cargas e séries", description: "Anota carga em 1 toque e sugere progressão.", why: "wger e apps de musculação: progressão de carga é o motor do resultado." },
      { name: "Programas por objetivo", description: "Trilhas de 4–12 semanas (emagrecer, hipertrofia, corrida).", why: "Programas fechados aumentam aderência e são vendáveis." },
      { name: "Check-in de hábitos", description: "Água, sono, passos e alimentação com streak diário.", why: "Trainerize: hábitos aumentam retenção fora do treino." },
      { name: "Evolução visual", description: "Gráficos de peso, medidas e comparação de fotos lado a lado.", why: "Prova de resultado é o principal gatilho de renovação." },
      { name: "Chat com o treinador", description: "Mensagens, áudio e feedback de vídeo de execução.", why: "Acesso ao profissional justifica a mensalidade." },
      { name: "Agenda de aulas e check-in", description: "Reserva de horários presenciais com limite de vagas.", why: "Studios e boxes precisam controlar lotação." },
      ...pixAndWhatsapp,
    ],
    luxury: [
      { name: "Plano alimentar com nutricionista", description: "Cardápio personalizado e lista de compras.", why: "Pacote treino + dieta tem ticket muito maior." },
      { name: "Integração com relógios", description: "Apple Health, Google Fit, Garmin.", why: "Público premium já usa wearables." },
      { name: "Análise de execução por vídeo", description: "Aluno grava, treinador comenta no frame.", why: "Experiência de consultoria presencial no digital." },
      { name: "Desafios com ranking e prêmios", description: "Competições entre alunos estilo Strava.", why: "Comunidade engajada gera indicação." },
      { name: "Sessões ao vivo exclusivas", description: "Aulas ao vivo para assinantes top.", why: "Escassez e exclusividade." },
    ],
    plans: [
      { name: "Start", priceBRL: 39.9, pitch: "Treinos prontos para começar", includes: ["Programas por objetivo", "Treino com vídeo", "Registro de cargas"] },
      { name: "Consultoria", priceBRL: 149.9, pitch: "Treino feito para você", includes: ["Avaliação", "Treino personalizado", "Chat com treinador", "Evolução visual"] },
      { name: "Black", priceBRL: 449, pitch: "Treino + nutrição + acompanhamento total", includes: ["Tudo da Consultoria", "Plano alimentar", "Análise de vídeo", "Ao vivo exclusivo"] },
    ],
    entities: [
      { name: "students", label: "Alunos", fields: [["name", "text"], ["goal", "text"], ["phone", "text"], ["started_on", "date"]] },
      { name: "programs", label: "Programas", fields: [["title", "text"], ["weeks", "integer"], ["level", "text"]] },
      { name: "workouts", label: "Treinos", fields: [["program_id", "uuid"], ["title", "text"], ["day_index", "integer"]] },
      { name: "exercises", label: "Exercícios", fields: [["workout_id", "uuid"], ["name", "text"], ["sets", "integer"], ["reps", "text"], ["video_url", "text"]] },
      { name: "workout_logs", label: "Registros", fields: [["exercise_id", "uuid"], ["load_kg", "numeric"], ["reps_done", "integer"], ["logged_at", "timestamptz"]] },
      { name: "measurements", label: "Medidas", fields: [["weight_kg", "numeric"], ["waist_cm", "numeric"], ["measured_on", "date"]] },
    ],
    tabs: [
      { id: "home", label: "Hoje", icon: "flame" },
      { id: "workouts", label: "Treinos", icon: "dumbbell" },
      { id: "progress", label: "Evolução", icon: "trending" },
      { id: "chat", label: "Coach", icon: "message" },
      { id: "profile", label: "Perfil", icon: "user" },
    ],
    mood: "energy",
    units: { client: "aluno", job: "treino", money: "R$" },
  },
  {
    id: "health",
    label: "Saúde, nutrição e terapia",
    keywords: ["nutri", "psicólog", "psicolog", "clínica", "clinica", "dentist", "médic", "medic", "terapia", "terapeuta", "fisioterap", "saúde", "saude", "fono", "ansiedade", "dieta", "gestante", "maternidade", "bem-estar"],
    searchTerms: ["nutrition coaching", "therapy app", "patient management"],
    designTerms: ["health app", "wellness app ui"],
    apps: [
      { title: "Doctoralia", developer: "DocPlanner", query: "Doctoralia", summary: "Agendamento online de consultas e gestão de agenda médica.", features: ["Agendamento online", "Lembretes de consulta", "Avaliações de pacientes", "Teleconsulta"] },
      { title: "Headspace", developer: "Headspace Inc.", query: "Headspace meditation", summary: "Meditação e bem-estar mental com conteúdo guiado.", features: ["Meditações guiadas", "Programas por tema", "Streak diário", "Sons para dormir"] },
      { title: "MyFitnessPal", developer: "MyFitnessPal, Inc.", query: "MyFitnessPal", summary: "Diário alimentar e contagem de calorias e macros.", features: ["Diário alimentar", "Banco de alimentos", "Leitor de código de barras", "Metas de macros"] },
    ],
    repos: [
      { fullName: "openemr/openemr", description: "Electronic health records and medical practice management." },
    ],
    mustHave: [
      { name: "Agendamento online 24h", description: "Paciente escolhe horário livre, paga sinal e recebe confirmação.", why: "Doctoralia: agendamento online é o produto central." },
      { name: "Anamnese digital", description: "Formulário pré-consulta personalizado por especialidade.", why: "Economiza 15 min por consulta e profissionaliza." },
      { name: "Prontuário e evolução", description: "Notas por sessão, anexos e linha do tempo do paciente (com sigilo).", why: "OpenEMR: prontuário é obrigatório para profissionais de saúde." },
      { name: "Plano entre consultas", description: "Tarefas, cardápio ou exercícios para o paciente seguir em casa.", why: "Aderência entre consultas é onde o resultado acontece." },
      { name: "Diário do paciente", description: "Registro de humor, refeições ou sintomas com fotos.", why: "MyFitnessPal/Headspace: diário diário gera hábito." },
      { name: "Teleconsulta integrada", description: "Vídeo dentro do app, sem link externo.", why: "Doctoralia: teleconsulta virou padrão pós-2020." },
      { name: "Conteúdos e áudios guiados", description: "Biblioteca de áudios, receitas ou exercícios do profissional.", why: "Headspace mostra que conteúdo próprio retém e diferencia." },
      { name: "Lembretes e adesão", description: "Lembretes de remédio, água, prática e consulta.", why: "Reduz faltas e abandono do tratamento." },
      ...pixAndWhatsapp,
    ],
    luxury: [
      { name: "Acompanhamento diário por chat", description: "Canal direto com resposta em até 24h.", why: "Pacientes de alto padrão pagam por acesso." },
      { name: "Exames e laudos integrados", description: "Upload e leitura de exames com gráficos de evolução.", why: "Visão completa da saúde." },
      { name: "Programas em grupo premium", description: "Turmas fechadas com encontros ao vivo.", why: "Escala o atendimento sem perder valor." },
      { name: "Concierge de saúde", description: "Rede de parceiros (exames, academias) com agendamento.", why: "Experiência 'tudo resolvido'." },
      { name: "Relatórios para outros profissionais", description: "Compartilhamento seguro com médico/psiquiatra.", why: "Cuidado integrado é diferencial premium." },
    ],
    plans: [
      { name: "Consulta avulsa", priceBRL: 0, pitch: "Agende e pague por consulta", includes: ["Agendamento online", "Anamnese", "Teleconsulta"] },
      { name: "Acompanhamento", priceBRL: 197, pitch: "Consultas + plano entre sessões", includes: ["2 consultas/mês", "Plano personalizado", "Diário", "Conteúdos"] },
      { name: "Premium", priceBRL: 597, pitch: "Cuidado contínuo e próximo", includes: ["Tudo do Acompanhamento", "Chat diário", "Exames integrados", "Concierge"] },
    ],
    entities: [
      { name: "patients", label: "Pacientes", fields: [["name", "text"], ["phone", "text"], ["birth_date", "date"]] },
      { name: "appointments", label: "Consultas", fields: [["patient_id", "uuid"], ["starts_at", "timestamptz"], ["mode", "text"], ["status", "text"]] },
      { name: "records", label: "Prontuário", fields: [["patient_id", "uuid"], ["note", "text"], ["attachments", "jsonb"]] },
      { name: "care_plans", label: "Planos", fields: [["patient_id", "uuid"], ["title", "text"], ["tasks", "jsonb"]] },
      { name: "journal_entries", label: "Diário", fields: [["patient_id", "uuid"], ["mood", "integer"], ["content", "text"], ["logged_at", "timestamptz"]] },
    ],
    tabs: [
      { id: "home", label: "Início", icon: "heart" },
      { id: "agenda", label: "Consultas", icon: "calendar" },
      { id: "plan", label: "Meu plano", icon: "check" },
      { id: "content", label: "Conteúdos", icon: "play" },
      { id: "profile", label: "Perfil", icon: "user" },
    ],
    mood: "calm",
    units: { client: "paciente", job: "consulta", money: "R$" },
  },
  {
    id: "beauty",
    label: "Beleza, estética e barbearia",
    keywords: ["salão", "salao", "barbearia", "barbeiro", "estética", "estetica", "manicure", "unha", "cabelo", "maquiagem", "sobrancelha", "cílios", "cilios", "depila", "beleza", "spa", "harmoniza", "tatua"],
    searchTerms: ["salon booking", "barber shop", "beauty appointment"],
    designTerms: ["beauty salon app", "barber app ui"],
    apps: [
      { title: "Booksy", developer: "Booksy International", query: "Booksy", summary: "Agendamento para salões e barbearias com marketplace.", features: ["Agendamento online", "Perfil com portfólio", "Lembretes", "Pagamento antecipado"] },
      { title: "Fresha", developer: "Fresha.com", query: "Fresha salon", summary: "Software de salão e spa com agenda, POS e marketing.", features: ["Agenda da equipe", "Ponto de venda", "Campanhas de marketing", "Programa de fidelidade"] },
      { title: "Trinks", developer: "Trinks", query: "Trinks salão", summary: "Gestão de salões e agendamento online no Brasil.", features: ["Agenda online", "Comissões", "Controle de caixa", "Estoque"] },
    ],
    repos: [
      { fullName: "alextselegidis/easyappointments", description: "Open source appointment scheduler web application." },
    ],
    mustHave: [
      { name: "Agendamento em 3 toques", description: "Serviço → profissional → horário, com duração e preço visíveis.", why: "Booksy e Trinks: agendar sem ligar é o motivo de download." },
      { name: "Portfólio com antes/depois", description: "Galeria de trabalhos por serviço e profissional.", why: "Booksy: portfólio converte novos clientes." },
      { name: "Sinal antecipado anti-falta", description: "Cobrança de sinal no agendamento com política de cancelamento.", why: "Faltas são a maior perda citada pelos donos." },
      { name: "Agenda da equipe e comissões", description: "Agenda por profissional e cálculo automático de comissão.", why: "Trinks/Fresha: comissão é dor operacional nº 1." },
      { name: "Ficha da cliente", description: "Preferências, alergias, fórmulas de coloração e histórico.", why: "Atendimento personalizado = cliente fiel." },
      { name: "Programa de fidelidade", description: "Pontos ou cashback por visita.", why: "Fresha: fidelidade aumenta frequência." },
      { name: "Avaliações pós-atendimento", description: "Pedido automático de avaliação e indicação.", why: "Reputação traz novos clientes no Google." },
      { name: "Venda de produtos", description: "Vitrine de produtos para home care.", why: "Ticket médio maior por visita." },
      ...pixAndWhatsapp,
    ],
    luxury: [
      { name: "Clube de assinatura", description: "Ex: barba ilimitada por R$ X/mês.", why: "Receita recorrente previsível." },
      { name: "Consultoria de imagem virtual", description: "Simulação de corte/cor com foto.", why: "Experiência premium e viral." },
      { name: "Atendimento VIP com horário exclusivo", description: "Horários reservados e mimos.", why: "Clientes de alto padrão pagam por exclusividade." },
      { name: "Marketing automático", description: "Campanhas para clientes sumidas e aniversariantes.", why: "Fresha: marketing recupera receita parada." },
      { name: "Multiunidades", description: "Gestão de várias unidades/franquias.", why: "Escala do negócio." },
    ],
    plans: [
      { name: "Solo", priceBRL: 39.9, pitch: "Para profissional autônoma", includes: ["Agenda online", "Lembretes WhatsApp", "Sinal via Pix"] },
      { name: "Salão", priceBRL: 129.9, pitch: "Para equipes", includes: ["Agenda da equipe", "Comissões", "Fidelidade", "Produtos"] },
      { name: "Prestige", priceBRL: 349, pitch: "Experiência premium e multiunidades", includes: ["Clube de assinatura", "Marketing automático", "Multiunidades", "Suporte VIP"] },
    ],
    entities: [
      { name: "clients", label: "Clientes", fields: [["name", "text"], ["phone", "text"], ["preferences", "jsonb"]] },
      { name: "services", label: "Serviços", fields: [["name", "text"], ["duration_min", "integer"], ["price", "numeric"]] },
      { name: "staff", label: "Profissionais", fields: [["name", "text"], ["commission_pct", "numeric"]] },
      { name: "bookings", label: "Agendamentos", fields: [["client_id", "uuid"], ["service_id", "uuid"], ["staff_id", "uuid"], ["starts_at", "timestamptz"], ["status", "text"]] },
      { name: "loyalty_points", label: "Fidelidade", fields: [["client_id", "uuid"], ["points", "integer"]] },
    ],
    tabs: [
      { id: "home", label: "Início", icon: "sparkles" },
      { id: "book", label: "Agendar", icon: "calendar" },
      { id: "gallery", label: "Portfólio", icon: "camera" },
      { id: "rewards", label: "Fidelidade", icon: "gift" },
      { id: "profile", label: "Perfil", icon: "user" },
    ],
    mood: "luxury",
    units: { client: "cliente", job: "atendimento", money: "R$" },
  },
  {
    id: "food",
    label: "Alimentação, restaurantes e delivery",
    keywords: ["restaurante", "delivery", "confeitaria", "marmita", "hamburguer", "pizzaria", "café", "cafe", "doce", "bolo", "padaria", "lanchonete", "food", "comida", "chef", "buffet", "açaí", "acai"],
    searchTerms: ["restaurant ordering", "food delivery", "bakery orders"],
    designTerms: ["food delivery app", "restaurant app ui"],
    apps: [
      { title: "iFood", developer: "iFood", query: "iFood", summary: "Maior app de delivery do Brasil.", features: ["Cardápio com fotos", "Rastreamento do pedido", "Cupons", "Avaliações"] },
      { title: "Toast", developer: "Toast, Inc.", query: "Toast restaurant POS", summary: "Plataforma de gestão e pedidos para restaurantes.", features: ["Pedidos online", "PDV", "Cozinha (KDS)", "Fidelidade"] },
      { title: "Goomer", developer: "Goomer", query: "Goomer cardápio digital", summary: "Cardápio digital e pedidos para restaurantes brasileiros.", features: ["Cardápio digital QR", "Pedidos na mesa", "Delivery próprio"] },
    ],
    repos: [
      { fullName: "tastyigniter/TastyIgniter", description: "Online restaurant ordering and reservation system." },
    ],
    mustHave: [
      { name: "Cardápio com fotos irresistíveis", description: "Categorias, adicionais, observações e destaques do dia.", why: "iFood: foto é o maior fator de conversão." },
      { name: "Pedido e pagamento em 1 minuto", description: "Carrinho, Pix/cartão e confirmação instantânea.", why: "Checkout rápido reduz abandono." },
      { name: "Acompanhamento do pedido", description: "Status em tempo real: recebido, preparando, a caminho.", why: "iFood: rastreamento reduz ansiedade e ligações." },
      { name: "Delivery próprio sem taxa de marketplace", description: "Canal direto que evita comissões de 12–27%.", why: "Goomer: vender direto aumenta margem." },
      { name: "Encomendas agendadas", description: "Bolos, marmitas da semana e eventos com data de retirada.", why: "Essencial para confeitarias e marmitarias." },
      { name: "Programa de fidelidade", description: "Cashback ou 'compre 10, ganhe 1'.", why: "Toast: fidelidade aumenta recompra." },
      { name: "Cupons e combos", description: "Promoções por dia/horário e combos inteligentes.", why: "Aumenta ticket médio em horário fraco." },
      { name: "Painel da cozinha", description: "Fila de pedidos para a cozinha com tempo de preparo.", why: "Toast KDS: organiza operação no pico." },
      ...pixAndWhatsapp,
    ],
    luxury: [
      { name: "Clube de assinatura gourmet", description: "Caixa mensal ou marmitas semanais por assinatura.", why: "Receita recorrente." },
      { name: "Reserva de mesa e experiências", description: "Jantares harmonizados e eventos.", why: "Ticket alto." },
      { name: "Personal chef / catering", description: "Orçamento para eventos privados.", why: "Clientes premium." },
      { name: "Rastreamento do entregador no mapa", description: "Mapa ao vivo.", why: "Experiência de app grande." },
      { name: "Multi-lojas", description: "Várias unidades e dark kitchens.", why: "Escala." },
    ],
    plans: [
      { name: "Cardápio", priceBRL: 59.9, pitch: "Cardápio digital e pedidos", includes: ["Cardápio", "Pedidos online", "Pix"] },
      { name: "Delivery", priceBRL: 149.9, pitch: "Delivery próprio completo", includes: ["Rastreamento", "Fidelidade", "Cupons", "Painel da cozinha"] },
      { name: "Gourmet", priceBRL: 399, pitch: "Assinaturas, eventos e multi-lojas", includes: ["Clube de assinatura", "Reservas", "Multi-lojas"] },
    ],
    entities: [
      { name: "menu_items", label: "Itens do cardápio", fields: [["name", "text"], ["category", "text"], ["price", "numeric"], ["photo_url", "text"], ["available", "boolean"]] },
      { name: "customers", label: "Clientes", fields: [["name", "text"], ["phone", "text"], ["address", "text"]] },
      { name: "orders", label: "Pedidos", fields: [["customer_id", "uuid"], ["status", "text"], ["total", "numeric"], ["scheduled_for", "timestamptz"]] },
      { name: "order_items", label: "Itens do pedido", fields: [["order_id", "uuid"], ["menu_item_id", "uuid"], ["qty", "integer"], ["notes", "text"]] },
      { name: "coupons", label: "Cupons", fields: [["code", "text"], ["discount_pct", "numeric"], ["valid_until", "date"]] },
    ],
    tabs: [
      { id: "home", label: "Início", icon: "utensils" },
      { id: "menu", label: "Cardápio", icon: "book" },
      { id: "orders", label: "Pedidos", icon: "receipt" },
      { id: "rewards", label: "Fidelidade", icon: "gift" },
      { id: "profile", label: "Perfil", icon: "user" },
    ],
    mood: "warm",
    units: { client: "cliente", job: "pedido", money: "R$" },
  },
  {
    id: "education",
    label: "Cursos, mentoria e infoprodutos",
    keywords: ["curso", "professor", "aula", "mentor", "ensino", "escola", "idioma", "inglês", "ingles", "ebook", "e-book", "infoproduto", "coach", "concurso", "vestibular", "treinamento", "palestr", "aluno"],
    searchTerms: ["online course", "learning app", "mentorship community"],
    designTerms: ["e-learning app", "course app ui"],
    apps: [
      { title: "Duolingo", developer: "Duolingo", query: "Duolingo", summary: "Aprendizado gamificado com lições curtas diárias.", features: ["Lições de 5 minutos", "Streak e XP", "Ligas semanais", "Lembretes inteligentes"] },
      { title: "Hotmart", developer: "Hotmart", query: "Hotmart", summary: "Plataforma brasileira de cursos e assinaturas digitais.", features: ["Área de membros", "Comunidade", "Certificados", "Pagamentos"] },
      { title: "Skool", developer: "Skool", query: "Skool community", summary: "Comunidade + cursos gamificados para criadores.", features: ["Comunidade com níveis", "Cursos desbloqueáveis", "Calendário de eventos", "Ranking"] },
    ],
    repos: [
      { fullName: "moodle/moodle", description: "The world's open source learning platform." },
      { fullName: "oppia/oppia", description: "A free, online learning platform to make quality education accessible." },
    ],
    mustHave: [
      { name: "Trilha de aulas curtas", description: "Módulos com vídeos de até 10 minutos e progresso visível.", why: "Duolingo/Hotmart: aulas curtas aumentam conclusão." },
      { name: "Exercícios práticos após cada aula", description: "Quiz, tarefa ou checklist que fixam o conteúdo.", why: "Transforma consumo passivo em resultado." },
      { name: "Streak e metas diárias", description: "Sequência de dias, XP e lembretes inteligentes.", why: "Duolingo: streak é o motor de retenção." },
      { name: "Comunidade com níveis", description: "Feed de alunos, perguntas e vitórias com gamificação.", why: "Skool: comunidade gamificada reduz churn." },
      { name: "Encontros ao vivo", description: "Calendário de lives e gravações.", why: "Proximidade com o mentor justifica recorrência." },
      { name: "Material de apoio para baixar", description: "PDFs, planilhas e templates por módulo.", why: "Valor percebido alto, custo baixo." },
      { name: "Certificado de conclusão", description: "Certificado com QR de validação.", why: "Hotmart: certificado é pedido frequente." },
      { name: "Busca no conteúdo", description: "Encontrar a aula certa pelo assunto.", why: "Reviews reclamam de não achar conteúdo." },
      ...pixAndWhatsapp,
    ],
    luxury: [
      { name: "Mentoria individual agendada", description: "Sessões 1:1 com o especialista.", why: "Escada de valor: do curso à mentoria." },
      { name: "Assistente de IA treinado no método", description: "Tira dúvidas 24h com o conteúdo do mentor.", why: "Escala atenção sem escalar horas." },
      { name: "Imersão presencial", description: "Ingressos para eventos exclusivos.", why: "Ticket alto e networking." },
      { name: "Grupo mastermind", description: "Turma fechada com encontros quinzenais.", why: "Clientes ricos pagam por acesso e networking." },
      { name: "Revisão personalizada de tarefas", description: "Feedback do mentor em entregas.", why: "Acompanhamento real gera resultado." },
    ],
    plans: [
      { name: "Aluno", priceBRL: 47, pitch: "Acesso ao método completo", includes: ["Trilha completa", "Exercícios", "Certificado"] },
      { name: "Comunidade", priceBRL: 97, pitch: "Aprenda junto e ao vivo", includes: ["Tudo do Aluno", "Comunidade", "Lives mensais", "Materiais"] },
      { name: "Mentoria", priceBRL: 997, pitch: "Acompanhamento direto do especialista", includes: ["Tudo da Comunidade", "Sessões 1:1", "Mastermind", "IA do método"] },
    ],
    entities: [
      { name: "courses", label: "Cursos", fields: [["title", "text"], ["description", "text"], ["published", "boolean"]] },
      { name: "modules", label: "Módulos", fields: [["course_id", "uuid"], ["title", "text"], ["position", "integer"]] },
      { name: "lessons", label: "Aulas", fields: [["module_id", "uuid"], ["title", "text"], ["video_url", "text"], ["duration_min", "integer"], ["position", "integer"]] },
      { name: "enrollments", label: "Matrículas", fields: [["course_id", "uuid"], ["plan", "text"], ["status", "text"]] },
      { name: "lesson_progress", label: "Progresso", fields: [["lesson_id", "uuid"], ["completed_at", "timestamptz"]] },
      { name: "posts", label: "Comunidade", fields: [["content", "text"], ["likes", "integer"]] },
    ],
    tabs: [
      { id: "home", label: "Início", icon: "home" },
      { id: "learn", label: "Aulas", icon: "play" },
      { id: "practice", label: "Prática", icon: "check" },
      { id: "community", label: "Comunidade", icon: "users" },
      { id: "profile", label: "Perfil", icon: "user" },
    ],
    mood: "playful",
    units: { client: "aluno", job: "aula", money: "R$" },
  },
  {
    id: "realestate",
    label: "Imóveis e corretagem",
    keywords: ["imóve", "imove", "corretor", "imobili", "aluguel", "locação", "locacao", "condomínio", "condominio", "apartamento", "lote", "airbnb", "temporada"],
    searchTerms: ["real estate", "property management", "realtor crm"],
    designTerms: ["real estate app", "property app ui"],
    apps: [
      { title: "QuintoAndar", developer: "QuintoAndar", query: "QuintoAndar", summary: "Aluguel e compra de imóveis sem burocracia.", features: ["Busca com filtros e mapa", "Agendamento de visita", "Proposta online", "Contrato digital"] },
      { title: "Zillow", developer: "Zillow", query: "Zillow real estate", summary: "Marketplace imobiliário com estimativas de preço.", features: ["Busca em mapa", "Estimativa de valor", "Alertas de novos imóveis", "Tour 3D"] },
      { title: "ZAP Imóveis", developer: "Grupo OLX", query: "ZAP Imóveis", summary: "Portal de anúncios de imóveis do Brasil.", features: ["Filtros avançados", "Favoritos", "Contato com anunciante"] },
    ],
    repos: [],
    mustHave: [
      { name: "Vitrine de imóveis com mapa", description: "Fotos grandes, filtros e mapa do bairro.", why: "QuintoAndar/Zillow: busca em mapa é padrão." },
      { name: "Agendamento de visitas", description: "Cliente escolhe horário; corretor confirma.", why: "QuintoAndar: visita agendada sem ligação." },
      { name: "CRM de leads", description: "Funil de interessados com origem e próximo passo.", why: "Corretor perde vendas por não fazer follow-up." },
      { name: "Proposta online", description: "Envio e negociação de proposta pelo app.", why: "QuintoAndar: proposta digital acelera fechamento." },
      { name: "Alertas de novos imóveis", description: "Aviso quando entra imóvel no perfil buscado.", why: "Zillow: alertas trazem o usuário de volta." },
      { name: "Simulador de financiamento", description: "Parcelas por banco e entrada.", why: "Dúvida nº 1 do comprador." },
      { name: "Documentos e checklist", description: "Checklist de documentos com upload seguro.", why: "Burocracia é a maior dor do processo." },
      { name: "Favoritos e comparação", description: "Comparar imóveis lado a lado.", why: "Ajuda a decisão." },
      ...pixAndWhatsapp,
    ],
    luxury: [
      { name: "Tour virtual 3D", description: "Visita imersiva.", why: "Zillow 3D Home." },
      { name: "Curadoria personalizada", description: "Seleção feita pelo corretor para o perfil.", why: "Alto padrão quer atendimento consultivo." },
      { name: "Avaliação de imóvel", description: "Estimativa de preço com comparáveis.", why: "Captação de proprietários." },
      { name: "Gestão de aluguel por temporada", description: "Calendário, limpeza e repasses.", why: "Investidores pagam por gestão." },
      { name: "Concierge de mudança", description: "Parceiros de mudança, reforma e decoração.", why: "Experiência completa." },
    ],
    plans: [
      { name: "Corretor", priceBRL: 69.9, pitch: "Seu portfólio no bolso do cliente", includes: ["Vitrine", "Agendamento", "CRM"] },
      { name: "Imobiliária", priceBRL: 249, pitch: "Equipe e funil completo", includes: ["Multi-corretores", "Propostas", "Documentos"] },
      { name: "Alto Padrão", priceBRL: 690, pitch: "Experiência premium", includes: ["Tour 3D", "Curadoria", "Concierge"] },
    ],
    entities: [
      { name: "properties", label: "Imóveis", fields: [["title", "text"], ["price", "numeric"], ["neighborhood", "text"], ["bedrooms", "integer"], ["photos", "jsonb"]] },
      { name: "leads", label: "Leads", fields: [["name", "text"], ["phone", "text"], ["stage", "text"], ["source", "text"]] },
      { name: "visits", label: "Visitas", fields: [["property_id", "uuid"], ["lead_id", "uuid"], ["scheduled_at", "timestamptz"]] },
      { name: "proposals", label: "Propostas", fields: [["property_id", "uuid"], ["lead_id", "uuid"], ["amount", "numeric"], ["status", "text"]] },
    ],
    tabs: [
      { id: "home", label: "Explorar", icon: "building" },
      { id: "map", label: "Mapa", icon: "map" },
      { id: "visits", label: "Visitas", icon: "calendar" },
      { id: "favorites", label: "Favoritos", icon: "heart" },
      { id: "profile", label: "Perfil", icon: "user" },
    ],
    mood: "luxury",
    units: { client: "cliente", job: "visita", money: "R$" },
  },
  {
    id: "pets",
    label: "Pets e veterinária",
    keywords: ["pet", "veterin", "banho e tosa", "tosa", "adestra", "cachorro", "gato", "dog", "cão", "cao", "felino", "hotelzinho", "creche canina"],
    searchTerms: ["pet care", "dog walker", "veterinary clinic"],
    designTerms: ["pet care app", "dog app ui"],
    apps: [
      { title: "Petlove", developer: "Petlove", query: "Petlove", summary: "E-commerce pet com assinatura e plano de saúde.", features: ["Compra programada", "Plano de saúde pet", "Carteira de vacinação"] },
      { title: "Rover", developer: "Rover.com", query: "Rover dog sitter", summary: "Marketplace de passeadores e cuidadores.", features: ["Perfis de cuidadores", "Fotos durante o serviço", "Mapa do passeio", "Avaliações"] },
      { title: "DogHero", developer: "DogHero", query: "DogHero", summary: "Hospedagem e passeios para cães no Brasil.", features: ["Hospedagem", "Passeios", "Atualizações com fotos"] },
    ],
    repos: [],
    mustHave: [
      { name: "Perfil do pet", description: "Raça, peso, alergias, temperamento e foto.", why: "Base de todo app pet." },
      { name: "Carteira de vacinação digital", description: "Vacinas e vermífugos com lembrete.", why: "Petlove: carteira é feature mais usada." },
      { name: "Agendamento de banho, tosa e consultas", description: "Serviço, horário e leva-e-traz.", why: "Dor principal do tutor." },
      { name: "Fotos e atualizações durante o serviço", description: "Tutor recebe fotos em tempo real.", why: "Rover/DogHero: fotos geram confiança." },
      { name: "Leva-e-traz com rastreio", description: "Mapa do motorista.", why: "Conveniência premium." },
      { name: "Histórico de atendimentos", description: "Tudo que foi feito no pet.", why: "Continuidade de cuidado." },
      { name: "Pacotes de banho", description: "4 banhos/mês com desconto.", why: "Receita recorrente." },
      { name: "Loja de produtos", description: "Ração e acessórios com compra programada.", why: "Petlove: compra programada fideliza." },
      ...pixAndWhatsapp,
    ],
    luxury: [
      { name: "Câmera ao vivo na creche", description: "Tutor assiste o pet.", why: "Diferencial premium." },
      { name: "Plano de saúde pet", description: "Parceria com clínicas.", why: "Petlove Saúde." },
      { name: "Spa pet", description: "Hidratação, ozônio e aromaterapia.", why: "Ticket alto." },
      { name: "Adestramento online", description: "Aulas e acompanhamento.", why: "Conteúdo recorrente." },
      { name: "Hospedagem premium", description: "Suítes com relatório diário.", why: "Viagens dos tutores." },
    ],
    plans: [
      { name: "Básico", priceBRL: 0, pitch: "Agende e pague por serviço", includes: ["Perfil do pet", "Agendamento", "Vacinas"] },
      { name: "Clube", priceBRL: 159, pitch: "Pacote mensal com desconto", includes: ["4 banhos/mês", "Leva-e-traz", "Fotos"] },
      { name: "VIP", priceBRL: 399, pitch: "Cuidado total", includes: ["Spa", "Câmera ao vivo", "Hospedagem com desconto"] },
    ],
    entities: [
      { name: "tutors", label: "Tutores", fields: [["name", "text"], ["phone", "text"], ["address", "text"]] },
      { name: "pets", label: "Pets", fields: [["tutor_id", "uuid"], ["name", "text"], ["species", "text"], ["breed", "text"], ["weight_kg", "numeric"]] },
      { name: "vaccines", label: "Vacinas", fields: [["pet_id", "uuid"], ["name", "text"], ["applied_on", "date"], ["next_on", "date"]] },
      { name: "appointments", label: "Agendamentos", fields: [["pet_id", "uuid"], ["service", "text"], ["starts_at", "timestamptz"], ["status", "text"]] },
    ],
    tabs: [
      { id: "home", label: "Início", icon: "paw" },
      { id: "book", label: "Agendar", icon: "calendar" },
      { id: "health", label: "Saúde", icon: "shield" },
      { id: "shop", label: "Loja", icon: "shopping" },
      { id: "profile", label: "Perfil", icon: "user" },
    ],
    mood: "playful",
    units: { client: "tutor", job: "atendimento", money: "R$" },
  },
  {
    id: "retail",
    label: "Loja, moda e e-commerce",
    keywords: ["loja", "moda", "roupa", "cosmétic", "cosmetic", "ecommerce", "e-commerce", "artesanato", "boutique", "semijoia", "bijuteria", "revenda", "vend", "acessório", "acessorio", "calçado", "calcado"],
    searchTerms: ["fashion store", "shopping app", "boutique ecommerce"],
    designTerms: ["fashion ecommerce app", "shop app ui"],
    apps: [
      { title: "Shopee", developer: "Shopee", query: "Shopee", summary: "Marketplace com gamificação e cupons.", features: ["Cupons diários", "Lives de venda", "Frete grátis", "Avaliações com fotos"] },
      { title: "Nuvemshop", developer: "Nuvemshop", query: "Nuvemshop", summary: "Plataforma de lojas virtuais da América Latina.", features: ["Gestão de pedidos", "Catálogo", "Integração com redes sociais"] },
      { title: "Shopify", developer: "Shopify Inc.", query: "Shopify", summary: "Plataforma global de e-commerce.", features: ["Catálogo", "Checkout", "Análises", "Marketing"] },
    ],
    repos: [
      { fullName: "medusajs/medusa", description: "Open source commerce platform." },
      { fullName: "saleor/saleor", description: "Headless, GraphQL commerce platform." },
    ],
    mustHave: [
      { name: "Vitrine editorial", description: "Coleções, lookbook e novidades com fotos grandes.", why: "Moda vende pelo visual." },
      { name: "Checkout em 1 página", description: "Pix, cartão parcelado e frete calculado.", why: "Shopify: checkout curto converte mais." },
      { name: "Guia de tamanhos inteligente", description: "Sugestão de tamanho por medidas.", why: "Troca por tamanho é a maior dor." },
      { name: "Avaliações com fotos", description: "Clientes mostram o produto real.", why: "Shopee: fotos de clientes convertem." },
      { name: "Lista de desejos e alerta de preço", description: "Aviso de reposição e promoção.", why: "Traz o cliente de volta." },
      { name: "Cupons e cashback", description: "Primeira compra e aniversário.", why: "Shopee: cupons são o motor de recompra." },
      { name: "Rastreio do pedido", description: "Status e código de rastreio.", why: "Reduz atendimento." },
      { name: "Trocas fáceis", description: "Solicitação de troca no app.", why: "Confiança para comprar online." },
      ...pixAndWhatsapp,
    ],
    luxury: [
      { name: "Personal stylist", description: "Curadoria de looks por vídeo.", why: "Clientes premium." },
      { name: "Provador virtual", description: "Ver o look em fotos.", why: "Experiência inovadora." },
      { name: "Clube VIP com pré-venda", description: "Acesso antecipado a coleções.", why: "Exclusividade." },
      { name: "Live commerce", description: "Vendas ao vivo.", why: "Shopee Live." },
      { name: "Entrega no mesmo dia", description: "Para a cidade.", why: "Conveniência." },
    ],
    plans: [
      { name: "Loja", priceBRL: 59.9, pitch: "Sua loja no app", includes: ["Catálogo", "Checkout Pix", "Pedidos"] },
      { name: "Crescimento", priceBRL: 179, pitch: "Venda mais", includes: ["Cupons", "Avaliações", "Fidelidade"] },
      { name: "Maison", priceBRL: 499, pitch: "Experiência de marca premium", includes: ["Clube VIP", "Live commerce", "Stylist"] },
    ],
    entities: [
      { name: "products", label: "Produtos", fields: [["name", "text"], ["price", "numeric"], ["sizes", "jsonb"], ["stock", "integer"], ["photos", "jsonb"]] },
      { name: "customers", label: "Clientes", fields: [["name", "text"], ["phone", "text"], ["measurements", "jsonb"]] },
      { name: "orders", label: "Pedidos", fields: [["customer_id", "uuid"], ["status", "text"], ["total", "numeric"], ["tracking_code", "text"]] },
      { name: "order_items", label: "Itens", fields: [["order_id", "uuid"], ["product_id", "uuid"], ["size", "text"], ["qty", "integer"]] },
      { name: "wishlists", label: "Desejos", fields: [["customer_id", "uuid"], ["product_id", "uuid"]] },
    ],
    tabs: [
      { id: "home", label: "Início", icon: "shopping" },
      { id: "catalog", label: "Coleções", icon: "sparkles" },
      { id: "wishlist", label: "Desejos", icon: "heart" },
      { id: "orders", label: "Pedidos", icon: "truck" },
      { id: "profile", label: "Perfil", icon: "user" },
    ],
    mood: "luxury",
    units: { client: "cliente", job: "pedido", money: "R$" },
  },
];

/**
 * Nicho fora da biblioteca: modelo NEUTRO. As features reais vêm das referências ao vivo
 * (Play Store/GitHub) e do próprio texto do usuário — nunca de um template de agendamento.
 */
export const GENERIC_ARCHETYPE: Archetype = {
  id: "services",
  label: "Negócio digital sob medida",
  keywords: [],
  searchTerms: [],
  designTerms: ["mobile app ui", "app dashboard design"],
  apps: [],
  repos: [],
  mustHave: [
    { name: "Onboarding em 3 passos", description: "Cadastro rápido que já entende o objetivo do usuário e personaliza a primeira tela.", why: "Apps líderes ativam o usuário no primeiro minuto; quem não vê valor no dia 1 não volta." },
    { name: "Painel inicial personalizado", description: "Resumo do que importa hoje: próximos passos, números e atalhos.", why: "Padrão dos apps mais bem avaliados: o usuário entende tudo em uma tela." },
    { name: "Catálogo do que você oferece", description: "Produtos, serviços ou conteúdos com fotos, preço e detalhes.", why: "Clareza de oferta é o que transforma visita em venda." },
    { name: "Pagamento via Pix e cartão", description: "Checkout dentro do app com recibo automático.", why: "No Brasil, Pix é o meio dominante; pagar fora do app derruba conversão." },
    { name: "Notificações e WhatsApp", description: "Avisos, lembretes e novidades no canal que o cliente realmente lê.", why: "Reengajamento é o que mantém o usuário ativo." },
    { name: "Histórico e progresso", description: "Tudo o que o usuário já fez, comprou ou conquistou, em ordem.", why: "Ver progresso é o principal motivo para continuar pagando." },
    { name: "Avaliações e indicação", description: "Avaliação após cada uso e link de indicação com recompensa.", why: "Prova social e indicação são o crescimento mais barato." },
    { name: "Chat com o especialista", description: "Mensagens diretas com quem presta o serviço.", why: "Acesso humano justifica assinatura recorrente." },
    { name: "Painel do dono do negócio", description: "Faturamento, clientes ativos e métricas em tempo real.", why: "O dono precisa saber se está lucrando." },
    { name: "Privacidade e LGPD", description: "Consentimento, exportação e exclusão de dados pelo próprio usuário.", why: "Obrigatório no Brasil e gera confiança." },
  ],
  luxury: [
    { name: "Atendimento VIP prioritário", description: "Canal exclusivo e resposta garantida em poucas horas.", why: "Clientes premium pagam por velocidade e atenção." },
    { name: "Assistente de IA do negócio", description: "Responde dúvidas 24h com o conhecimento do especialista.", why: "Escala o atendimento sem contratar." },
    { name: "Experiências exclusivas", description: "Eventos, encontros ou conteúdos só para assinantes top.", why: "Exclusividade aumenta o ticket." },
    { name: "Relatórios executivos", description: "Relatório mensal em PDF com evolução e recomendações.", why: "Alto valor percebido." },
    { name: "Marca própria (white label)", description: "Versão do app com a marca do cliente corporativo.", why: "Venda B2B de ticket alto." },
  ],
  plans: [
    { name: "Essencial", priceBRL: 29.9, pitch: "O básico para começar", includes: ["Painel", "Catálogo", "Pagamento Pix"] },
    { name: "Pro", priceBRL: 89.9, pitch: "Para quem quer resultado", includes: ["Tudo do Essencial", "Chat com especialista", "Histórico completo"] },
    { name: "Premium", priceBRL: 297, pitch: "Experiência completa", includes: ["Tudo do Pro", "Atendimento VIP", "Assistente de IA"] },
  ],
  entities: [
    { name: "customers", label: "Clientes", fields: [["name", "text"], ["phone", "text"], ["email", "text"]] },
    { name: "offerings", label: "Ofertas", fields: [["title", "text"], ["description", "text"], ["price", "numeric"], ["active", "boolean"]] },
    { name: "orders", label: "Pedidos", fields: [["customer_id", "uuid"], ["offering_id", "uuid"], ["status", "text"], ["total", "numeric"]] },
    { name: "messages", label: "Mensagens", fields: [["customer_id", "uuid"], ["content", "text"]] },
    { name: "reviews", label: "Avaliações", fields: [["customer_id", "uuid"], ["rating", "integer"], ["comment", "text"]] },
  ],
  tabs: [
    { id: "home", label: "Início", icon: "home" },
    { id: "explore", label: "Explorar", icon: "sparkles" },
    { id: "progress", label: "Progresso", icon: "trending" },
    { id: "chat", label: "Mensagens", icon: "message" },
    { id: "profile", label: "Perfil", icon: "user" },
  ],
  mood: "trust",
  units: { client: "cliente", job: "pedido", money: "R$" },
};

function normalize(s: string) {
  return s.toLowerCase();
}

/**
 * Escolhe o arquétipo com mais palavras-chave presentes. O que a pessoa digitou ("o que você faz")
 * pesa mais que o tema do e-book, que pesa mais que o resto do texto.
 */
export function detectArchetype(text: string, themeHint = "", primary = ""): Archetype {
  const body = normalize(text);
  const hint = normalize(themeHint);
  const main = normalize(primary);
  let best: { a: Archetype; score: number } = { a: GENERIC_ARCHETYPE, score: 0 };
  for (const a of ARCHETYPES) {
    let score = 0;
    for (const k of a.keywords) {
      if (main.includes(k)) score += 5;
      if (hint.includes(k)) score += 3;
      if (body.includes(k)) score += 1;
    }
    if (score > best.score) best = { a, score };
  }
  return best.a;
}

export function getArchetype(id: string): Archetype {
  return ARCHETYPES.find((a) => a.id === id) ?? GENERIC_ARCHETYPE;
}

/** O nicho de piscinas é o exemplo validado: adiciona termos específicos. */
export function specificTerms(text: string): string[] {
  const t = normalize(text);
  if (t.includes("piscina") || t.includes("pool")) return ["pool service", "pool maintenance", "pool care"];
  return [];
}
