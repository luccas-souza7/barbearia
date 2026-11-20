/* Lâmina Fina Barbearia: agendamento online demonstrativo (nenhum dado é enviado). */
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

  var estado = { etapa: 1, servico: null, barbeiro: null, data: null, hora: null, barbeiroAtribuido: null };
  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  var mesVisivel = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  var el = {
    etapas: $$(".agenda__etapa", form),
    passos: $$(".passos .passo"),
    servicos: $("#opcoes-servico"),
    barbeiros: $("#opcoes-barbeiro"),
    mes: $("#calendario-mes"),
    corpoCal: $("#calendario-corpo"),
    ant: $("#calendario-ant"),
    prox: $("#calendario-prox"),
    horarios: $("#grade-horarios"),
    horariosTitulo: $("#horarios-titulo"),
    resumo: $("#resumo-linha"),
    erro: $("#agenda-erro"),
    voltar: $("#agenda-voltar"),
    avancar: $("#agenda-avancar"),
    ultimo: $("#ultimo-agendamento"),
    modal: $("#modal-resumo"),
    listaResumo: $("#lista-resumo")
  };

  /* ---------- Catálogo ---------- */
  var catalogo = {};
  D.servicos.forEach(function (s) { catalogo[s.id] = { id: s.id, nome: s.nome, preco: s.preco, duracao: s.duracao, aPartirDe: !!s.aPartirDe, tipo: "Serviço" }; });
  D.combos.forEach(function (c) { catalogo[c.id] = { id: c.id, nome: c.nome, preco: c.preco, duracao: c.duracao, tipo: "Combo", itens: c.itens }; });
  var barbeirosPorId = {};
  D.barbeiros.forEach(function (b) { barbeirosPorId[b.id] = b; });

  /* ---------- Utilidades de data e hora ---------- */
  function chaveData(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function dataDeChave(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function hhmm(min) { return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0"); }
  function dataExtenso(d) {
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  }
  function dataCurta(d) { return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }); }

  // Hash FNV-1a: gera horários "ocupados" sempre iguais para a mesma data e barbeiro.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    // Finalizador (murmur3) para espalhar melhor os bits
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return h >>> 0;
  }
  function blocoOcupado(barbeiroId, dataK, minuto) {
    var lotacao = 22 + (hash(dataK) % 18); // entre 22% e 39% de ocupação por dia
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

  /* ---------- Etapa 1 e 2: opções ---------- */
  function opcaoServico(item, nomeGrupo) {
    return '<label class="opcao"><input type="radio" name="' + nomeGrupo + '" value="' + item.id + '">' +
      '<span class="opcao__caixa"><span class="opcao__nome">' + esc(item.nome) +
      (item.itens ? '<small class="sr-only">: ' + esc(item.itens.join(", ")) + "</small>" : "") + "</span>" +
      '<span class="opcao__meta"><strong>' + (item.aPartirDe ? "a partir de " : "") + moeda(item.preco) + "</strong>" + dur(item.duracao) + "</span></span></label>";
  }
  el.servicos.innerHTML =
    '<p class="opcoes__grupo" aria-hidden="true">Serviços</p>' +
    D.servicos.map(function (s) { return opcaoServico(catalogo[s.id], "servico"); }).join("") +
    '<p class="opcoes__grupo" aria-hidden="true">Combos</p>' +
    D.combos.map(function (c) { return opcaoServico(catalogo[c.id], "servico"); }).join("");

  el.barbeiros.innerHTML =
    D.barbeiros.map(function (b) {
      return '<label class="opcao"><input type="radio" name="barbeiro" value="' + b.id + '">' +
        '<span class="opcao__caixa"><img class="opcao__avatar" src="assets/img/' + esc(b.foto) + '" alt="" width="44" height="44" loading="lazy">' +
        '<span class="opcao__nome">' + esc(b.nome) + '<br><small>' + esc(b.especialidade) + "</small></span></span></label>";
    }).join("") +
    '<label class="opcao"><input type="radio" name="barbeiro" value="sem-preferencia">' +
    '<span class="opcao__caixa"><span class="opcao__avatar avatar" aria-hidden="true">' + icone("users") + "</span>" +
    '<span class="opcao__nome">Sem preferência<br><small>Primeiro barbeiro livre</small></span></span></label>';

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
  var nomesDias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
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
    var tabAlvo = null;
    var candidatos = [];
    for (var d = 1; d <= totalDias; d++) {
      var data = new Date(ano, mes, d);
      var k = chaveData(data);
      var indis = diaIndisponivel(data);
      if (!indis) candidatos.push(k);
      var classes = "dia" + (k === chaveData(hoje) ? " is-hoje" : "");
      var motivo = data < hoje ? ", já passou" : diaFechado(data) ? ", fechado" : "";
      html += '<td><button type="button" class="' + classes + '" data-data="' + k + '"' +
        (indis ? " disabled" : "") +
        ' aria-pressed="' + (estado.data === k) + '"' +
        (k === chaveData(hoje) ? ' aria-current="date"' : "") +
        ' aria-label="' + esc(dataExtenso(data) + (k === chaveData(hoje) ? ", hoje" : "") + motivo) + '" tabindex="-1">' + d + "</button></td>";
      if ((primeiro + d) % 7 === 0 && d < totalDias) html += "</tr><tr>";
    }
    html += "</tr>";
    el.corpoCal.innerHTML = html;
    // Tabulação "roving": só um dia recebe tab por vez
    tabAlvo = (focarData && candidatos.indexOf(focarData) !== -1 && focarData) ||
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
    var atual = dataDeChave(b.getAttribute("data-data"));
    var limiteFim = new Date(hoje.getFullYear(), hoje.getMonth() + MESES_A_FRENTE + 1, 0);
    var tentativa = new Date(atual);
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
      el.horarios.innerHTML = '<p class="horarios__vazio">Escolha um dia no calendário para ver os horários.</p>';
      return;
    }
    var lista = horariosDoDia(estado.data);
    var livres = lista.filter(function (h) { return h.barbeiro; }).length;
    el.horariosTitulo.textContent = "Horários em " + dataCurta(dataDeChave(estado.data)) + " (" + livres + " livres)";
    if (!livres) {
      el.horarios.innerHTML = '<p class="horarios__vazio">Nenhum horário livre neste dia para o serviço escolhido. Tente outra data.</p>';
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

  /* ---------- Navegação entre etapas ---------- */
  function irPara(n, focar) {
    estado.etapa = n;
    el.etapas.forEach(function (f) { f.hidden = +f.getAttribute("data-etapa") !== n; });
    el.passos.forEach(function (p, i) {
      var num = i + 1;
      if (num === n) p.setAttribute("aria-current", "step"); else p.removeAttribute("aria-current");
      p.classList.toggle("is-feito", num < n);
    });
    el.voltar.hidden = n === 1;
    el.avancar.innerHTML = n === 3 ? "Confirmar agendamento" : "Avançar" + icone("chevron-right");
    if (n === 3) { renderCalendario(); renderHorarios(); }
    if (focar) {
      var legenda = form.querySelector('.agenda__etapa[data-etapa="' + n + '"] legend');
      if (legenda) { legenda.tabIndex = -1; legenda.focus({ preventScroll: true }); }
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
    if (estado.etapa < 3) irPara(estado.etapa + 1, true);
    else confirmar();
  });
  el.voltar.addEventListener("click", function () {
    limparErro();
    if (estado.etapa > 1) irPara(estado.etapa - 1, true);
  });

  function atualizarResumo() {
    var partes = [];
    var s = catalogo[estado.servico];
    if (s) partes.push("<span>" + esc(s.tipo) + ": <strong>" + esc(s.nome) + "</strong></span>");
    if (estado.barbeiro) partes.push("<span>Barbeiro: <strong>" + esc(nomeBarbeiro(estado.barbeiro)) + "</strong></span>");
    if (estado.data) partes.push("<span>Dia: <strong>" + esc(dataCurta(dataDeChave(estado.data))) + "</strong></span>");
    if (estado.hora !== null) partes.push("<span>Horário: <strong>" + hhmm(estado.hora) + "</strong></span>");
    if (s) partes.push("<span>Valor: <strong>" + (s.aPartirDe ? "a partir de " : "") + moeda(s.preco) + "</strong></span>");
    el.resumo.innerHTML = partes.join("");
    el.resumo.hidden = !partes.length;
  }
  function nomeBarbeiro(id) { return id === "sem-preferencia" ? "Sem preferência" : (barbeirosPorId[id] || {}).nome || ""; }

  /* ---------- Confirmação ---------- */
  function confirmar() {
    var s = catalogo[estado.servico];
    var barbeiroFinal = estado.barbeiro === "sem-preferencia" ? estado.barbeiroAtribuido : estado.barbeiro;
    var registro = {
      servico: s.nome,
      tipo: s.tipo,
      barbeiro: nomeBarbeiro(barbeiroFinal) + (estado.barbeiro === "sem-preferencia" ? " (sem preferência)" : ""),
      data: estado.data,
      hora: hhmm(estado.hora),
      fim: hhmm(estado.hora + s.duracao),
      valor: (s.aPartirDe ? "a partir de " : "") + moeda(s.preco),
      criadoEm: new Date().toISOString()
    };
    el.listaResumo.innerHTML =
      linha(registro.tipo, registro.servico) +
      linha("Barbeiro", registro.barbeiro) +
      linha("Dia", dataExtenso(dataDeChave(registro.data))) +
      linha("Horário", registro.hora + " às " + registro.fim) +
      '<li class="resumo__total"><span>Valor</span><strong>' + esc(registro.valor) + "</strong></li>";
    // Só guarda o resumo se o visitante não recusou o armazenamento no aviso de cookies
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

  function reiniciar() {
    estado = { etapa: 1, servico: null, barbeiro: null, data: null, hora: null, barbeiroAtribuido: null };
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
    el.ultimo.innerHTML = icone("calendar-days") +
      "<p><strong>Seu último agendamento:</strong> " + esc(r.servico) + " com " + esc(r.barbeiro) + ", " +
      esc(dataExtenso(dataDeChave(r.data))) + " às " + esc(r.hora) + ".</p>" +
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

  /* ---------- Integração com os botões "Agendar combo" ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-agendar-combo]");
    if (!b) return;
    var id = b.getAttribute("data-agendar-combo");
    reiniciar();
    var radio = form.querySelector('input[name="servico"][value="' + id + '"]');
    if (radio) { radio.checked = true; estado.servico = id; }
    atualizarResumo();
    var secao = document.getElementById("agendamento");
    var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    secao.scrollIntoView({ behavior: reduz ? "auto" : "smooth", block: "start" });
    if (radio) radio.focus({ preventScroll: true });
  });

  irPara(1);
  mostrarUltimo();
})();
