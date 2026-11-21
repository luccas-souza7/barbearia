/* Lâmina Fina Barbearia: agendamento online demonstrativo (nenhum dado é enviado).
 * Etapas: 1 Serviço, 2 Barbeiro, 3 Data e horário, 4 Produtos (opcional), 5 Confirmação. */
(function () {
  "use strict";

  var D = window.DADOS;
  var LF = window.LF;
  var form = document.getElementById("form-agenda");
  if (!D || !LF || !form) return;

  var $ = LF.$, $$ = LF.$$, esc = LF.esc, icone = LF.icone, moeda = LF.moeda, dur = LF.duracaoTexto;
  var N = D.negocio;
  var CHAVE = "lf-ultimo-agendamento";
  var MESES_A_FRENTE = 1;
  var TOTAL_ETAPAS = 5;

  function estadoInicial() {
    return { etapa: 1, servico: null, barbeiro: null, data: null, hora: null, barbeiroAtribuido: null, produtos: {} };
  }
  var estado = estadoInicial();
  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  var mesVisivel = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  var el = {
    etapas: $$(".agenda__etapa", form),
    passos: $$(".passos .passo"),
    progresso: $("#passos-progresso"),
    indice: $("#agenda-etapa-indice"),
    servicos: $("#opcoes-servico"),
    barbeiros: $("#opcoes-barbeiro"),
    mes: $("#calendario-mes"),
    corpoCal: $("#calendario-corpo"),
    ant: $("#calendario-ant"),
    prox: $("#calendario-prox"),
    horarios: $("#grade-horarios"),
    horariosTitulo: $("#horarios-titulo"),
    produtos: $("#produtos-agenda"),
    confirmacao: $("#confirmacao"),
    resumo: $("#resumo-pedido"),
    erro: $("#agenda-erro"),
    voltar: $("#agenda-voltar"),
    avancar: $("#agenda-avancar"),
    ultimo: $("#ultimo-agendamento"),
    modal: $("#modal-resumo"),
    listaResumo: $("#lista-resumo")
  };

  /* ---------- Catálogo ---------- */
  var catalogo = {};
  D.servicos.forEach(function (s) {
    catalogo[s.id] = { id: s.id, nome: s.nome, preco: s.preco, duracao: s.duracao, aPartirDe: !!s.aPartirDe, tipo: "Serviço", icone: s.icone || "scissors" };
  });
  D.combos.forEach(function (c) {
    var nomes = c.inclui.map(function (id) { return catalogo[id] ? catalogo[id].nome : id; }).concat(c.extras || []);
    catalogo[c.id] = { id: c.id, nome: c.nome, preco: c.preco, duracao: c.duracao, tipo: "Combo", itens: nomes, avulso: LF.precoAvulso(c), destaque: c.destaque, icone: "badge-percent" };
  });
  var barbeirosPorId = {};
  D.barbeiros.forEach(function (b) { barbeirosPorId[b.id] = b; });
  var produtosPorId = {};
  (D.produtos || []).forEach(function (p) { produtosPorId[p.id] = p; });

  /* ---------- Utilidades de data e hora ---------- */
  function chaveData(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function dataDeChave(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function hhmm(min) { return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0"); }
  function dataExtenso(d) { return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }); }
  function dataCurta(d) { return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }); }

  // Hash FNV-1a com finalizador: gera horários "ocupados" sempre iguais para a mesma data e barbeiro.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return h >>> 0;
  }
  function blocoOcupado(barbeiroId, dataK, minuto) {
    var lotacao = 22 + (hash(dataK) % 18);
    return hash(dataK + "|" + barbeiroId + "|" + minuto) % 100 < lotacao;
  }
  function cabe(barbeiroId, dataK, inicio, duracao) {
    for (var t = inicio; t < inicio + duracao; t += N.intervaloMin) {
      if (blocoOcupado(barbeiroId, dataK, t - (t % N.intervaloMin))) return false;
    }
    return true;
  }
  function diaFechado(d) { return N.diasFechados.indexOf(d.getDay()) !== -1; }
  function diaIndisponivel(d) { return d < hoje || diaFechado(d); }

  function horariosDoDia(dataK) {
    var servico = catalogo[estado.servico];
    if (!servico) return [];
    var agora = new Date();
    var ehHoje = dataK === chaveData(agora);
    var minAgora = agora.getHours() * 60 + agora.getMinutes() + 30;
    var ids = estado.barbeiro === "sem-preferencia"
      ? D.barbeiros.map(function (b) { return b.id; }).sort(function (a, b) { return hash(dataK + a) - hash(dataK + b); })
      : [estado.barbeiro];
    var lista = [];
    for (var ini = N.abre; ini + servico.duracao <= N.fecha; ini += N.intervaloMin) {
      var livre = null;
      if (!(ehHoje && ini < minAgora)) {
        for (var i = 0; i < ids.length; i++) { if (cabe(ids[i], dataK, ini, servico.duracao)) { livre = ids[i]; break; } }
      }
      lista.push({ minuto: ini, barbeiro: livre, passou: ehHoje && ini < minAgora });
    }
    return lista;
  }

  /* ---------- Totais ---------- */
  function totalProdutos() {
    return Object.keys(estado.produtos).reduce(function (t, id) {
      return t + (produtosPorId[id] ? produtosPorId[id].preco * estado.produtos[id] : 0);
    }, 0);
  }
  function qtdProdutos() {
    return Object.keys(estado.produtos).reduce(function (t, id) { return t + estado.produtos[id]; }, 0);
  }

  /* ---------- Etapa 1: serviços e combos ---------- */
  function opcaoServico(item) {
    var economia = item.avulso ? item.avulso - item.preco : 0;
    return '<label class="opcao' + (item.tipo === "Combo" ? " opcao--combo" : "") + '"><input type="radio" name="servico" value="' + item.id + '">' +
      '<span class="opcao__caixa"><span class="opcao__icone">' + icone(item.icone) + "</span>" +
      '<span class="opcao__nome">' + esc(item.nome) +
      (item.itens ? "<small>" + esc(item.itens.join(" + ")) + "</small>" : "<small>" + dur(item.duracao) + "</small>") + "</span>" +
      '<span class="opcao__meta">' + (item.aPartirDe ? "<small>a partir de</small>" : "") + "<strong>" + moeda(item.preco) + "</strong>" +
      (economia > 0 ? '<span class="opcao__economia">economize ' + moeda(economia) + "</span>" : (item.itens ? dur(item.duracao) : "")) + "</span>" +
      '<span class="opcao__check" aria-hidden="true">' + icone("check") + "</span></span></label>";
  }
  el.servicos.innerHTML =
    '<p class="opcoes__grupo" aria-hidden="true">' + icone("badge-percent") + "Combos com desconto</p>" +
    D.combos.map(function (c) { return opcaoServico(catalogo[c.id]); }).join("") +
    '<p class="opcoes__grupo" aria-hidden="true">' + icone("scissors") + "Serviços avulsos</p>" +
    D.servicos.map(function (s) { return opcaoServico(catalogo[s.id]); }).join("");

  /* ---------- Etapa 2: barbeiros ---------- */
  el.barbeiros.innerHTML =
    D.barbeiros.map(function (b) {
      return '<label class="opcao opcao--barbeiro"><input type="radio" name="barbeiro" value="' + b.id + '">' +
        '<span class="opcao__caixa"><img class="opcao__avatar" src="assets/img/' + esc(b.foto) + '" alt="" width="56" height="56" loading="lazy" style="object-position:' + esc(b.posicao || "50% 25%") + '">' +
        '<span class="opcao__nome">' + esc(b.nome) + "<small>" + esc(b.especialidade) + "</small></span>" +
        '<span class="opcao__check" aria-hidden="true">' + icone("check") + "</span></span></label>";
    }).join("") +
    '<label class="opcao opcao--barbeiro"><input type="radio" name="barbeiro" value="sem-preferencia">' +
    '<span class="opcao__caixa"><span class="opcao__avatar opcao__avatar--icone" aria-hidden="true">' + icone("users") + "</span>" +
    '<span class="opcao__nome">Sem preferência<small>O primeiro barbeiro livre</small></span>' +
    '<span class="opcao__check" aria-hidden="true">' + icone("check") + "</span></span></label>";

  /* ---------- Etapa 4: produtos ---------- */
  function renderProdutosAgenda() {
    el.produtos.innerHTML = D.produtos.map(function (p) {
      var q = estado.produtos[p.id] || 0;
      return '<li class="produto-agenda' + (q ? " is-selecionado" : "") + '" data-produto="' + p.id + '">' +
        '<div class="produto-agenda__img">' + LF.frascoSVG(p.tipo, p.rotulo) + "</div>" +
        '<div class="produto-agenda__info"><p class="produto-agenda__nome">' + esc(p.nome) + "</p>" +
        '<p class="produto-agenda__desc">' + esc(p.descricao || "") + '</p><p class="produto-agenda__preco">' + moeda(p.preco) + "</p></div>" +
        '<div class="qtd" role="group" aria-label="Quantidade de ' + esc(p.nome) + '">' +
        '<button type="button" class="qtd__btn" data-qtd="-1" aria-label="Remover uma unidade de ' + esc(p.nome) + '"' + (q ? "" : " disabled") + ">" + icone("minus") + "</button>" +
        '<output class="qtd__valor" aria-live="polite">' + q + "</output>" +
        '<button type="button" class="qtd__btn" data-qtd="1" aria-label="Adicionar uma unidade de ' + esc(p.nome) + '"' + (q >= 5 ? " disabled" : "") + ">" + icone("plus") + "</button></div></li>";
    }).join("");
  }
  function alterarProduto(id, delta) {
    var q = Math.max(0, Math.min(5, (estado.produtos[id] || 0) + delta));
    if (q) estado.produtos[id] = q; else delete estado.produtos[id];
    var foco = document.activeElement && document.activeElement.getAttribute("data-qtd");
    renderProdutosAgenda();
    if (foco) {
      var btn = el.produtos.querySelector('[data-produto="' + id + '"] [data-qtd="' + foco + '"]');
      if (btn && !btn.disabled) btn.focus();
      else { var outro = el.produtos.querySelector('[data-produto="' + id + '"] .qtd__btn:not(:disabled)'); if (outro) outro.focus(); }
    }
    atualizarResumo();
  }
  el.produtos.addEventListener("click", function (e) {
    var b = e.target.closest("[data-qtd]");
    if (!b) return;
    alterarProduto(b.closest("[data-produto]").getAttribute("data-produto"), +b.getAttribute("data-qtd"));
  });

  form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "servico") { estado.servico = t.value; estado.hora = null; }
    if (t.name === "barbeiro") { estado.barbeiro = t.value; estado.hora = null; }
    if (t.name === "hora") {
      estado.hora = +t.value;
      estado.barbeiroAtribuido = t.getAttribute("data-barbeiro");
    }
    limparErro();
    atualizarResumo();
  });

  /* ---------- Etapa 3: calendário ---------- */
  function renderCalendario(focarData) {
    var ano = mesVisivel.getFullYear(), mes = mesVisivel.getMonth();
    el.mes.textContent = mesVisivel.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    var limite = new Date(hoje.getFullYear(), hoje.getMonth() + MESES_A_FRENTE, 1);
    el.ant.disabled = ano === hoje.getFullYear() && mes === hoje.getMonth();
    el.prox.disabled = mesVisivel >= limite;

    var primeiro = new Date(ano, mes, 1).getDay();
    var totalDias = new Date(ano, mes + 1, 0).getDate();
    var html = "<tr>";
    for (var v = 0; v < primeiro; v++) html += "<td></td>";
    var candidatos = [];
    for (var d = 1; d <= totalDias; d++) {
      var data = new Date(ano, mes, d);
      var k = chaveData(data);
      var indis = diaIndisponivel(data);
      if (!indis) candidatos.push(k);
      var ehHoje = k === chaveData(hoje);
      var motivo = data < hoje ? ", já passou" : diaFechado(data) ? ", fechado" : "";
      html += '<td><button type="button" class="dia' + (ehHoje ? " is-hoje" : "") + '" data-data="' + k + '"' +
        (indis ? " disabled" : "") + ' aria-pressed="' + (estado.data === k) + '"' + (ehHoje ? ' aria-current="date"' : "") +
        ' aria-label="' + esc(dataExtenso(data) + (ehHoje ? ", hoje" : "") + motivo) + '" tabindex="-1">' + d + "</button></td>";
      if ((primeiro + d) % 7 === 0 && d < totalDias) html += "</tr><tr>";
    }
    html += "</tr>";
    el.corpoCal.innerHTML = html;
    var tabAlvo = (focarData && candidatos.indexOf(focarData) !== -1 && focarData) ||
      (estado.data && candidatos.indexOf(estado.data) !== -1 && estado.data) || candidatos[0];
    var btn = tabAlvo && el.corpoCal.querySelector('[data-data="' + tabAlvo + '"]');
    if (btn) { btn.tabIndex = 0; if (focarData) btn.focus(); }
  }

  el.ant.addEventListener("click", function () { mesVisivel.setMonth(mesVisivel.getMonth() - 1); renderCalendario(); });
  el.prox.addEventListener("click", function () { mesVisivel.setMonth(mesVisivel.getMonth() + 1); renderCalendario(); });

  el.corpoCal.addEventListener("click", function (e) {
    var b = e.target.closest(".dia");
    if (!b || b.disabled) return;
    escolherData(b.getAttribute("data-data"));
  });
  el.corpoCal.addEventListener("keydown", function (e) {
    var b = e.target.closest(".dia");
    if (!b) return;
    var passos = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      var todos = $$(".dia:not(:disabled)", el.corpoCal);
      var alvo = e.key === "Home" ? todos[0] : todos[todos.length - 1];
      if (alvo) focarDia(alvo);
      return;
    }
    if (!(e.key in passos)) return;
    e.preventDefault();
    var tentativa = dataDeChave(b.getAttribute("data-data"));
    var limiteFim = new Date(hoje.getFullYear(), hoje.getMonth() + MESES_A_FRENTE + 1, 0);
    for (var i = 0; i < 62; i++) {
      tentativa.setDate(tentativa.getDate() + passos[e.key]);
      if (tentativa < hoje || tentativa > limiteFim) return;
      if (!diaIndisponivel(tentativa)) break;
    }
    if (diaIndisponivel(tentativa)) return;
    if (tentativa.getMonth() !== mesVisivel.getMonth()) {
      mesVisivel = new Date(tentativa.getFullYear(), tentativa.getMonth(), 1);
      renderCalendario(chaveData(tentativa));
    } else {
      focarDia(el.corpoCal.querySelector('[data-data="' + chaveData(tentativa) + '"]'));
    }
  });
  function focarDia(btn) {
    if (!btn) return;
    $$(".dia", el.corpoCal).forEach(function (x) { x.tabIndex = -1; });
    btn.tabIndex = 0;
    btn.focus();
  }

  function escolherData(k) {
    estado.data = k;
    estado.hora = null;
    $$(".dia", el.corpoCal).forEach(function (x) {
      var sel = x.getAttribute("data-data") === k;
      x.setAttribute("aria-pressed", String(sel));
      x.tabIndex = sel ? 0 : -1;
    });
    renderHorarios();
    limparErro();
    atualizarResumo();
  }

  function renderHorarios() {
    if (!estado.data) {
      el.horariosTitulo.textContent = "Horários disponíveis";
      el.horarios.innerHTML = '<p class="horarios__vazio">' + icone("calendar-days") + "<span>Escolha um dia no calendário para ver os horários.</span></p>";
      return;
    }
    var lista = horariosDoDia(estado.data);
    var livres = lista.filter(function (h) { return h.barbeiro; }).length;
    el.horariosTitulo.textContent = "Horários em " + dataCurta(dataDeChave(estado.data)) + " (" + livres + " livres)";
    if (!livres) {
      el.horarios.innerHTML = '<p class="horarios__vazio">' + icone("info") + "<span>Nenhum horário livre neste dia para o serviço escolhido. Tente outra data.</span></p>";
      return;
    }
    el.horarios.innerHTML = lista.map(function (h) {
      var txt = hhmm(h.minuto);
      var indis = !h.barbeiro;
      var rot = txt + (indis ? (h.passou ? ", horário já passou" : ", ocupado") : ", livre");
      return '<label class="horario"><input type="radio" name="hora" value="' + h.minuto + '"' +
        (h.barbeiro ? ' data-barbeiro="' + h.barbeiro + '"' : "") + (indis ? " disabled" : "") +
        (estado.hora === h.minuto && !indis ? " checked" : "") + ' aria-label="' + rot + '"><span aria-hidden="true">' + txt + "</span></label>";
    }).join("");
  }

  /* ---------- Etapa 5: confirmação ---------- */
  function barbeiroFinal() {
    return estado.barbeiro === "sem-preferencia" ? estado.barbeiroAtribuido : estado.barbeiro;
  }
  function nomeBarbeiro(id) { return id === "sem-preferencia" ? "Sem preferência" : (barbeirosPorId[id] || {}).nome || ""; }

  function renderConfirmacao() {
    var s = catalogo[estado.servico];
    var b = barbeirosPorId[barbeiroFinal()];
    var prods = Object.keys(estado.produtos);
    el.confirmacao.innerHTML =
      '<div class="confirmacao__bloco"><span class="confirmacao__icone">' + icone(s.icone) + '</span><div><p class="confirmacao__rotulo">' + esc(s.tipo) + "</p>" +
      '<p class="confirmacao__valor">' + esc(s.nome) + "</p>" + (s.itens ? "<p class=\"confirmacao__extra\">" + esc(s.itens.join(" + ")) + "</p>" : "") + "</div>" +
      '<button type="button" class="confirmacao__editar" data-ir="1">Alterar</button></div>' +
      '<div class="confirmacao__bloco">' + (b ? '<img class="confirmacao__foto" src="assets/img/' + esc(b.foto) + '" alt="" width="48" height="48" style="object-position:' + esc(b.posicao || "50% 25%") + '">' : '<span class="confirmacao__icone">' + icone("user-round") + "</span>") +
      '<div><p class="confirmacao__rotulo">Barbeiro</p><p class="confirmacao__valor">' + esc(nomeBarbeiro(barbeiroFinal())) + "</p>" +
      (estado.barbeiro === "sem-preferencia" ? '<p class="confirmacao__extra">Escolhido automaticamente (sem preferência)</p>' : "") + "</div>" +
      '<button type="button" class="confirmacao__editar" data-ir="2">Alterar</button></div>' +
      '<div class="confirmacao__bloco"><span class="confirmacao__icone">' + icone("calendar-check") + '</span><div><p class="confirmacao__rotulo">Data e horário</p>' +
      '<p class="confirmacao__valor">' + esc(dataExtenso(dataDeChave(estado.data))) + "</p>" +
      '<p class="confirmacao__extra">' + hhmm(estado.hora) + " às " + hhmm(estado.hora + s.duracao) + "</p></div>" +
      '<button type="button" class="confirmacao__editar" data-ir="3">Alterar</button></div>' +
      '<div class="confirmacao__bloco"><span class="confirmacao__icone">' + icone("shopping-bag") + '</span><div><p class="confirmacao__rotulo">Produtos para retirar</p>' +
      '<p class="confirmacao__valor">' + (prods.length ? prods.map(function (id) { return estado.produtos[id] + "x " + esc(produtosPorId[id].nome); }).join(", ") : "Nenhum produto") + "</p>" +
      (prods.length ? '<p class="confirmacao__extra">Retirada na barbearia no dia do horário. Sem entrega.</p>' : "") + "</div>" +
      '<button type="button" class="confirmacao__editar" data-ir="4">Alterar</button></div>' +
      '<p class="aviso-demo aviso-demo--claro">' + icone("info") + "<span>Projeto demonstrativo: ao confirmar, nenhum dado é enviado. O pagamento seria feito na barbearia.</span></p>";
  }
  el.confirmacao.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ir]");
    if (b) irPara(+b.getAttribute("data-ir"), true);
  });

  /* ---------- Resumo do pedido (lateral) ---------- */
  function linhaResumo(rotulo, valor, classe) {
    return '<li class="' + (classe || "") + '"><span>' + rotulo + "</span><strong>" + valor + "</strong></li>";
  }
  function atualizarResumo() {
    var s = catalogo[estado.servico];
    var itens = [];
    if (!s && !qtdProdutos()) {
      el.resumo.innerHTML = '<p class="resumo-pedido__vazio">' + icone("scissors") + "<span>Escolha um serviço ou combo para começar.</span></p>";
      return;
    }
    if (s) {
      itens.push(linhaResumo(esc(s.nome) + "<small>" + esc(s.tipo) + " · " + dur(s.duracao) + "</small>", (s.aPartirDe ? "a partir de " : "") + moeda(s.preco), "resumo-pedido__servico"));
      if (s.avulso && s.avulso > s.preco) itens.push(linhaResumo("Economia do combo", "- " + moeda(s.avulso - s.preco), "resumo-pedido__economia"));
    }
    Object.keys(estado.produtos).forEach(function (id) {
      var p = produtosPorId[id];
      itens.push(linhaResumo(estado.produtos[id] + "x " + esc(p.nome) + "<small>Retirada na barbearia</small>", moeda(p.preco * estado.produtos[id]), "resumo-pedido__produto"));
    });
    var detalhes = [];
    if (estado.barbeiro) detalhes.push(icone("user-round") + "<span>" + esc(nomeBarbeiro(estado.barbeiro === "sem-preferencia" && estado.barbeiroAtribuido ? estado.barbeiroAtribuido : estado.barbeiro)) + "</span>");
    if (estado.data) detalhes.push(icone("calendar-days") + "<span>" + esc(dataCurta(dataDeChave(estado.data))) + (estado.hora !== null ? " às " + hhmm(estado.hora) : "") + "</span>");
    var total = (s ? s.preco : 0) + totalProdutos();
    el.resumo.innerHTML =
      '<ul class="resumo-pedido__itens">' + itens.join("") + "</ul>" +
      (detalhes.length ? '<p class="resumo-pedido__detalhes">' + detalhes.join("") + "</p>" : "") +
      '<p class="resumo-pedido__total"><span>Total' + (s && s.aPartirDe ? " estimado" : "") + "</span><strong>" + moeda(total) + "</strong></p>" +
      '<p class="resumo-pedido__pagamento">' + icone("store") + "<span>Pagamento na barbearia: Pix, cartão ou dinheiro.</span></p>";
    var tot = el.resumo.querySelector(".resumo-pedido__total strong");
    if (tot && tot.animate && !LF.reduzMovimento) tot.animate([{ transform: "scale(1.12)", color: "#c8a26b" }, { transform: "scale(1)" }], { duration: 350, easing: "ease-out" });
  }

  /* ---------- Navegação entre etapas ---------- */
  function irPara(n, focar) {
    var anterior = estado.etapa;
    estado.etapa = n;
    el.etapas.forEach(function (f) {
      var num = +f.getAttribute("data-etapa");
      f.hidden = num !== n;
      f.classList.toggle("vindo-de-tras", num === n && n < anterior);
    });
    el.passos.forEach(function (p, i) {
      var num = i + 1;
      if (num === n) p.setAttribute("aria-current", "step"); else p.removeAttribute("aria-current");
      p.classList.toggle("is-feito", num < n);
    });
    if (el.progresso) el.progresso.style.transform = "scaleX(" + ((n - 1) / (TOTAL_ETAPAS - 1)) + ")";
    if (el.indice) el.indice.textContent = "Etapa " + n + " de " + TOTAL_ETAPAS;
    el.voltar.hidden = n === 1;
    if (n === TOTAL_ETAPAS) el.avancar.innerHTML = icone("circle-check") + "Confirmar agendamento";
    else if (n === 4) el.avancar.innerHTML = (qtdProdutos() ? "Continuar" : "Pular e continuar") + icone("chevron-right");
    else el.avancar.innerHTML = "Avançar" + icone("chevron-right");
    if (n === 3) { renderCalendario(); renderHorarios(); }
    if (n === 4) renderProdutosAgenda();
    if (n === 5) renderConfirmacao();
    if (focar) {
      var legenda = form.querySelector('.agenda__etapa[data-etapa="' + n + '"] legend');
      if (legenda) { legenda.tabIndex = -1; legenda.focus({ preventScroll: true }); }
      var topo = form.getBoundingClientRect().top;
      if (topo < 80) form.scrollIntoView({ behavior: LF.reduzMovimento ? "auto" : "smooth", block: "start" });
    }
    atualizarResumo();
  }

  function validar() {
    if (estado.etapa === 1 && !estado.servico) return erro("Escolha um serviço ou combo para continuar.", "servico");
    if (estado.etapa === 2 && !estado.barbeiro) return erro("Escolha um barbeiro ou a opção Sem preferência.", "barbeiro");
    if (estado.etapa === 3) {
      if (!estado.data) return erro("Escolha um dia disponível no calendário.");
      if (estado.hora === null) return erro("Escolha um horário livre.", "hora");
    }
    return true;
  }
  function erro(msg, campo) {
    el.erro.innerHTML = icone("info") + "<span>" + esc(msg) + "</span>";
    form.classList.remove("tremer"); void form.offsetWidth; form.classList.add("tremer");
    var alvo = campo ? form.querySelector('input[name="' + campo + '"]:not(:disabled)') :
      el.corpoCal.querySelector('.dia[tabindex="0"]');
    if (alvo) alvo.focus();
    return false;
  }
  function limparErro() { el.erro.textContent = ""; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validar()) return;
    limparErro();
    if (estado.etapa < TOTAL_ETAPAS) irPara(estado.etapa + 1, true);
    else confirmar();
  });
  el.voltar.addEventListener("click", function () {
    limparErro();
    if (estado.etapa > 1) irPara(estado.etapa - 1, true);
  });

  /* ---------- Confirmação final ---------- */
  function confirmar() {
    var s = catalogo[estado.servico];
    var prods = Object.keys(estado.produtos).map(function (id) {
      return { nome: produtosPorId[id].nome, qtd: estado.produtos[id], valor: produtosPorId[id].preco * estado.produtos[id] };
    });
    var total = s.preco + totalProdutos();
    var registro = {
      servico: s.nome,
      tipo: s.tipo,
      barbeiro: nomeBarbeiro(barbeiroFinal()) + (estado.barbeiro === "sem-preferencia" ? " (sem preferência)" : ""),
      data: estado.data,
      hora: hhmm(estado.hora),
      fim: hhmm(estado.hora + s.duracao),
      produtos: prods,
      total: (s.aPartirDe ? "a partir de " : "") + moeda(total),
      criadoEm: new Date().toISOString()
    };
    el.listaResumo.innerHTML =
      linha(registro.tipo, registro.servico + " · " + moeda(s.preco)) +
      linha("Barbeiro", registro.barbeiro) +
      linha("Dia", dataExtenso(dataDeChave(registro.data))) +
      linha("Horário", registro.hora + " às " + registro.fim) +
      (prods.length ? linha("Produtos (retirada)", prods.map(function (p) { return p.qtd + "x " + p.nome; }).join(", ") + " · " + moeda(totalProdutos())) : "") +
      '<li class="resumo__total"><span>Total</span><strong>' + esc(registro.total) + "</strong></li>";
    var escolha = LF.armazenamento.ler("lf-cookies") || "";
    if (escolha.indexOf("recusado") !== 0) {
      LF.armazenamento.gravar(CHAVE, JSON.stringify(registro));
      mostrarUltimo();
    }
    LF.abrirDialog(el.modal);
  }
  function linha(r, v) { return "<li><span>" + esc(r) + "</span><strong>" + esc(v) + "</strong></li>"; }

  el.modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-novo-agendamento]")) {
      LF.fecharDialog(el.modal);
      reiniciar();
    }
  });

  function reiniciar(manterProdutos) {
    var produtos = manterProdutos ? estado.produtos : {};
    estado = estadoInicial();
    estado.produtos = produtos;
    form.reset();
    mesVisivel = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    irPara(1);
  }

  function mostrarUltimo() {
    var bruto = LF.armazenamento.ler(CHAVE);
    if (!bruto) { el.ultimo.hidden = true; return; }
    var r;
    try { r = JSON.parse(bruto); } catch (e) { el.ultimo.hidden = true; return; }
    if (!r || !r.data) { el.ultimo.hidden = true; return; }
    var prods = (r.produtos || []).length ? " Produtos para retirar: " + r.produtos.map(function (p) { return p.qtd + "x " + p.nome; }).join(", ") + "." : "";
    el.ultimo.innerHTML = icone("calendar-check") +
      "<p><strong>Seu último agendamento:</strong> " + esc(r.servico) + " com " + esc(r.barbeiro) + ", " +
      esc(dataExtenso(dataDeChave(r.data))) + " às " + esc(r.hora) + "." + esc(prods) + "</p>" +
      '<button type="button" data-limpar-ultimo>Esquecer este agendamento</button>';
    el.ultimo.hidden = false;
  }
  el.ultimo.addEventListener("click", function (e) {
    if (e.target.closest("[data-limpar-ultimo]")) {
      LF.armazenamento.remover(CHAVE);
      el.ultimo.hidden = true;
      el.avancar.focus();
    }
  });

  function rolarParaAgenda() {
    var secao = document.getElementById("agendamento");
    secao.scrollIntoView({ behavior: LF.reduzMovimento ? "auto" : "smooth", block: "start" });
  }

  /* ---------- "Agendar este combo" e "Adicionar ao agendamento" ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-agendar-combo]");
    if (b) {
      var id = b.getAttribute("data-agendar-combo");
      reiniciar(true);
      var radio = form.querySelector('input[name="servico"][value="' + id + '"]');
      if (radio) { radio.checked = true; estado.servico = id; }
      atualizarResumo();
      rolarParaAgenda();
      LF.toast(catalogo[id].nome + " selecionado. Agora escolha o barbeiro.");
      if (radio) radio.focus({ preventScroll: true });
      return;
    }
    var p = e.target.closest("[data-add-produto]");
    if (p) {
      var pid = p.getAttribute("data-add-produto");
      estado.produtos[pid] = Math.min(5, (estado.produtos[pid] || 0) + 1);
      if (estado.etapa === 4) renderProdutosAgenda();
      atualizarResumo();
      LF.toast(produtosPorId[pid].nome + " adicionado ao agendamento. Retire na barbearia.");
      p.classList.add("is-adicionado");
      setTimeout(function () { p.classList.remove("is-adicionado"); }, 900);
    }
  });

  irPara(1);
  mostrarUltimo();
})();
