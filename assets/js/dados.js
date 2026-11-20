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
    endereco: "Seu bairro, Suzano-SP",
    horarioTexto: "Aberto de terça a sábado, das 9h às 20h",
    // Agenda: 0 = domingo ... 6 = sábado
    diasFechados: [0, 1],
    abre: 9 * 60,
    fecha: 20 * 60,
    intervaloMin: 30
  },

  servicos: [
    { id: "corte", nome: "Corte masculino", preco: 45, duracao: 40 },
    { id: "barba", nome: "Barba completa com toalha quente", preco: 35, duracao: 30 },
    { id: "corte-barba", nome: "Corte + barba", preco: 70, duracao: 70 },
    { id: "degrade", nome: "Degradê / fade", preco: 50, duracao: 45 },
    { id: "pigmentacao", nome: "Pigmentação", preco: 30, duracao: 20 },
    { id: "sobrancelha", nome: "Sobrancelha na navalha", preco: 15, duracao: 10 },
    { id: "infantil", nome: "Corte infantil", preco: 35, duracao: 30 },
    { id: "platinado", nome: "Platinado", preco: 120, duracao: 120, aPartirDe: true }
  ],

  combos: [
    {
      id: "combo-basico",
      nome: "Combo Básico",
      itens: ["Corte", "Sobrancelha"],
      preco: 55,
      duracao: 50
    },
    {
      id: "combo-completo",
      nome: "Combo Completo",
      itens: ["Corte", "Barba", "Sobrancelha", "Lavagem"],
      preco: 95,
      duracao: 90,
      destaque: "Mais pedido"
    },
    {
      id: "dia-do-noivo",
      nome: "Dia do Noivo",
      itens: ["Corte", "Barba", "Limpeza de pele", "Bebida"],
      preco: 160,
      duracao: 120
    }
  ],

  barbeiros: [
    { id: "diego", nome: "Diego", especialidade: "Especialista em degradê", foto: "barbeiro-diego.webp" },
    { id: "marcos", nome: "Marcos", especialidade: "Barba e navalha", foto: "barbeiro-marcos.webp" },
    { id: "felipe", nome: "Felipe", especialidade: "Cortes clássicos", foto: "barbeiro-felipe.webp" },
    { id: "renan", nome: "Renan", especialidade: "Platinado e química", foto: "barbeiro-renan.webp" }
  ],

  planosClube: [
    { id: "clube-corte", nome: "Clube Corte", preco: 99 },
    { id: "clube-corte-barba", nome: "Clube Corte + Barba", preco: 149 }
  ],

  produtos: [
    { nome: "Pomada modeladora", preco: 39.9, tipo: "pote", rotulo: "POMADA" },
    { nome: "Óleo para barba", preco: 44.9, tipo: "conta-gotas", rotulo: "ÓLEO" },
    { nome: "Balm pós-barba", preco: 34.9, tipo: "tubo", rotulo: "BALM" },
    { nome: "Shampoo para barba", preco: 29.9, tipo: "pump", rotulo: "SHAMPOO" }
  ],

  depoimentos: [
    { nome: "Rafael", texto: "Atendimento top e corte impecável. Saí outro homem." },
    { nome: "Lucas", texto: "Melhor barbearia do bairro, sem enrolação e com hora marcada." },
    { nome: "Thiago", texto: "Sempre saio satisfeito. O degradê do Diego é outro nível." },
    { nome: "Bruno", texto: "Levei meu filho e ele já quer voltar. Paciência de sobra." },
    { nome: "André", texto: "Toalha quente na barba é coisa de outro mundo. Recomendo." },
    { nome: "Gustavo", texto: "Ambiente massa, café bom e futebol na TV. Virei cliente." }
  ],

  // categorias: degrade, barba, classico, infantil
  galeria: [
    { arquivo: "galeria-01.webp", categoria: "degrade", alt: "Degradê baixo com acabamento na navalha" },
    { arquivo: "galeria-02.webp", categoria: "barba", alt: "Barba alinhada com contorno marcado" },
    { arquivo: "galeria-03.webp", categoria: "classico", alt: "Corte clássico penteado para o lado" },
    { arquivo: "galeria-04.webp", categoria: "infantil", alt: "Corte infantil curto e arrumado" },
    { arquivo: "galeria-05.webp", categoria: "degrade", alt: "Fade médio com topo texturizado" },
    { arquivo: "galeria-06.webp", categoria: "barba", alt: "Barbeiro aparando a barba com máquina" },
    { arquivo: "galeria-07.webp", categoria: "classico", alt: "Corte social com risca lateral" },
    { arquivo: "galeria-08.webp", categoria: "infantil", alt: "Menino na cadeira de barbeiro" },
    { arquivo: "galeria-09.webp", categoria: "degrade", alt: "Degradê alto visto de lado" },
    { arquivo: "galeria-10.webp", categoria: "barba", alt: "Barba cheia hidratada e modelada" },
    { arquivo: "galeria-11.webp", categoria: "classico", alt: "Acabamento na nuca com navalha" },
    { arquivo: "galeria-12.webp", categoria: "infantil", alt: "Criança sorrindo depois do corte" }
  ],

  filtrosGaleria: [
    { id: "todos", nome: "Todos" },
    { id: "degrade", nome: "Degradê" },
    { id: "barba", nome: "Barba" },
    { id: "classico", nome: "Clássico" },
    { id: "infantil", nome: "Infantil" }
  ],

  perguntas: [
    {
      pergunta: "Preciso agendar ou posso chegar na hora?",
      resposta: "Recomendamos o agendamento para evitar espera, mas também atendemos por ordem de chegada quando há horário livre."
    },
    {
      pergunta: "Quais formas de pagamento vocês aceitam?",
      resposta: "Pix, cartão de crédito, cartão de débito e dinheiro."
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
    }
  ]
};
