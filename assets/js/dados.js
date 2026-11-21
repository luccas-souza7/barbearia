/*
 * Dados da Lâmina Fina Barbearia (fictícia).
 * Para adaptar o site para outra barbearia, edite somente este arquivo:
 * serviços, combos, barbeiros, produtos, depoimentos, galeria, perguntas e horários.
 */
window.DADOS = {
  negocio: {
    nome: "Lâmina Fina Barbearia",
    telefone: "(11) 0000-0000 (fictício)",
    email: "contato@laminafina.exemplo",
    endereco: "Praça da República, Centro, São Paulo-SP",
    enderecoNota: "Localização ilustrativa (projeto fictício)",
    // Marcador do mapa (ponto público e neutro no centro de São Paulo)
    mapa: { lat: -23.5432, lng: -46.6429, zoom: 15 },
    horarioTexto: "Aberto de terça a sábado, das 9h às 20h",
    // Agenda: 0 = domingo ... 6 = sábado
    diasFechados: [0, 1],
    abre: 9 * 60,
    fecha: 20 * 60,
    intervaloMin: 30
  },

  // Vídeo de fundo da hero. Coloque os arquivos em assets/video/ e preencha
  // os caminhos abaixo (ex.: "assets/video/hero.mp4"). Enquanto estiverem
  // vazios, a hero mostra a foto de capa.
  heroVideo: {
    webm: "",
    mp4: ""
  },

  // Serviços avulsos. Os combos abaixo são montados a partir destes ids.
  servicos: [
    { id: "corte", nome: "Corte masculino", preco: 45, duracao: 40, icone: "scissors" },
    { id: "degrade", nome: "Degradê / fade", preco: 50, duracao: 45, icone: "scissors" },
    { id: "barba", nome: "Barba com toalha quente", preco: 35, duracao: 30, icone: "flame" },
    { id: "sobrancelha", nome: "Sobrancelha na navalha", preco: 15, duracao: 10, icone: "sparkles" },
    { id: "pigmentacao", nome: "Pigmentação", preco: 30, duracao: 20, icone: "droplets" },
    { id: "lavagem", nome: "Lavagem e hidratação", preco: 25, duracao: 20, icone: "droplets" },
    { id: "infantil", nome: "Corte infantil", preco: 35, duracao: 30, icone: "baby" },
    { id: "platinado", nome: "Platinado", preco: 120, duracao: 120, aPartirDe: true, icone: "sparkles" }
  ],

  // Cada combo lista os serviços que inclui (ids acima). O preço avulso e a
  // economia são calculados automaticamente a partir da lista de serviços.
  combos: [
    {
      id: "combo-basico",
      nome: "Combo Básico",
      chamada: "O essencial bem feito",
      inclui: ["corte", "barba"],
      preco: 70,
      duracao: 70
    },
    {
      id: "combo-completo",
      nome: "Combo Completo",
      chamada: "Visual alinhado do topo à barba",
      inclui: ["corte", "barba", "sobrancelha", "lavagem"],
      preco: 99,
      duracao: 100,
      destaque: "Mais pedido"
    },
    {
      id: "dia-do-noivo",
      nome: "Dia do Noivo",
      chamada: "Para chegar impecável no altar",
      inclui: ["corte", "barba", "sobrancelha", "lavagem", "pigmentacao"],
      extras: ["Bebida de cortesia"],
      preco: 125,
      duracao: 130
    }
  ],

  barbeiros: [
    { id: "diego", nome: "Diego", especialidade: "Especialista em degradê", foto: "barbeiro-diego.webp", posicao: "50% 25%" },
    { id: "marcos", nome: "Marcos", especialidade: "Barba e navalha", foto: "barbeiro-marcos.webp", posicao: "50% 30%" },
    { id: "felipe", nome: "Felipe", especialidade: "Cortes clássicos", foto: "barbeiro-felipe.webp", posicao: "50% 15%" },
    { id: "renan", nome: "Renan", especialidade: "Platinado e química", foto: "barbeiro-renan.webp", posicao: "50% 12%" }
  ],

  planosClube: [
    { id: "clube-corte", nome: "Clube Corte", preco: 99 },
    { id: "clube-corte-barba", nome: "Clube Corte + Barba", preco: 149 }
  ],

  // Produtos para retirar na barbearia (não há entrega)
  produtos: [
    { id: "pomada", nome: "Pomada modeladora", preco: 39.9, tipo: "pote", rotulo: "POMADA", descricao: "Efeito matte, fixação média" },
    { id: "oleo", nome: "Óleo para barba", preco: 44.9, tipo: "conta-gotas", rotulo: "ÓLEO", descricao: "Hidrata e alinha os fios" },
    { id: "balm", nome: "Balm pós-barba", preco: 34.9, tipo: "tubo", rotulo: "BALM", descricao: "Acalma a pele sem álcool" },
    { id: "shampoo", nome: "Shampoo para barba", preco: 29.9, tipo: "pump", rotulo: "SHAMPOO", descricao: "Limpeza suave do dia a dia" }
  ],

  avaliacoes: {
    nota: 5.0,
    total: 127,
    fonte: "Google"
  },

  depoimentos: [
    { nome: "Rafael Moreira", quando: "há 1 semana", texto: "Atendimento top e corte impecável. O Diego acertou o degradê de primeira e ainda explicou como manter em casa." },
    { nome: "Lucas Andrade", quando: "há 2 semanas", texto: "Melhor barbearia que já fui. Hora marcada de verdade, sem fila e com um café muito bom esperando." },
    { nome: "Thiago Santos", quando: "há 3 semanas", texto: "Fiz o Combo Completo e saí outro homem. A toalha quente na barba é coisa de outro mundo." },
    { nome: "Bruno Carvalho", quando: "há 1 mês", texto: "Levei meu filho para o primeiro corte e foi tranquilo do começo ao fim. Paciência de sobra." },
    { nome: "André Lima", quando: "há 1 mês", texto: "Agendei pelo site em menos de um minuto e reservei a pomada para retirar. Prático demais." },
    { nome: "Gustavo Rocha", quando: "há 2 meses", texto: "Ambiente massa, futebol na TV e um acabamento de navalha muito caprichado. Virei cliente fiel." }
  ],

  // Galeria horizontal (16:9). A ordem aqui é a ordem em que as fotos passam.
  galeria: [
    { arquivo: "galeria-01", alt: "Barbeiro tatuado passando a máquina na nuca de um cliente" },
    { arquivo: "galeria-02", alt: "Nuca com degradê e desenho feito na máquina, sobre fundo claro" },
    { arquivo: "galeria-03", alt: "Interior de barbearia com o cliente e o barbeiro refletidos no espelho" },
    { arquivo: "galeria-04", alt: "Poste de barbeiro vermelho, branco e azul preso à fachada" },
    { arquivo: "galeria-05", alt: "Barbearia de rua em preto e branco, com o barbeiro fazendo a barba de um cliente" },
    { arquivo: "galeria-06", alt: "Homem de barba cheia e gorro escuro, de pé ao lado de uma escada" },
    { arquivo: "galeria-07", alt: "Barbearia antiga de 1935 com cadeira clássica e barbeiro atendendo um cliente" },
    { arquivo: "galeria-08", alt: "Homem de cabelo longo e barba cheia sorrindo, em preto e branco" }
  ],

  perguntas: [
    {
      pergunta: "Preciso agendar ou posso chegar na hora?",
      resposta: "Recomendamos o agendamento para evitar espera, mas também atendemos por ordem de chegada quando há horário livre."
    },
    {
      pergunta: "Quais formas de pagamento vocês aceitam?",
      resposta: "Pix, cartão de crédito e débito (Visa e Mastercard) e dinheiro."
    },
    {
      pergunta: "Atendem crianças?",
      resposta: "Sim. O corte infantil é feito com calma, em cadeira com assento elevado, e a criança deve estar acompanhada de um responsável."
    },
    {
      pergunta: "Como funciona o clube de assinatura?",
      resposta: "Você paga uma mensalidade e corta quantas vezes quiser no mês, com prioridade na agenda. As regras completas estão na página Regras do Clube."
    },
    {
      pergunta: "Posso remarcar ou cancelar?",
      resposta: "Pode, sem custo, com até 2 horas de antecedência. Assim o horário volta para a agenda de outro cliente."
    },
    {
      pergunta: "Qual a tolerância de atraso?",
      resposta: "A tolerância é de 10 minutos. Depois disso, podemos precisar remarcar para não atrasar os próximos clientes."
    },
    {
      pergunta: "Vocês entregam os produtos?",
      resposta: "Não fazemos entrega. Você adiciona o produto no agendamento e retira na barbearia no dia do seu horário, pagando junto com o serviço."
    }
  ]
};
