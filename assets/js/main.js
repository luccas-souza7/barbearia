/* Lâmina Fina Barbearia: interações gerais (JS puro). */
(function () {
  "use strict";

  var D = window.DADOS || {};
  var doc = document;
  var reduzMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BASE_ICONES = (doc.documentElement.getAttribute("data-base") || "") + "assets/icons/sprite.svg";
  var BASE_IMG = (doc.documentElement.getAttribute("data-base") || "") + "assets/img/";

  doc.documentElement.classList.add("js");

  /* ---------- Utilidades ---------- */
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function icone(nome, classe) {
    return '<svg class="icone ' + (classe || "") + '" aria-hidden="true" focusable="false"><use href="' + BASE_ICONES + "#i-" + nome + '"></use></svg>';
  }
  function moeda(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: v % 1 ? 2 : 0 });
  }
  function duracaoTexto(min) {
    var h = Math.floor(min / 60), m = min % 60;
    if (!h) return m + " min";
    return h + "h" + (m ? String(m).padStart(2, "0") : "");
  }
  var armazenamento = {
    ler: function (chave) { try { return window.localStorage.getItem(chave); } catch (e) { return null; } },
    gravar: function (chave, valor) { try { window.localStorage.setItem(chave, valor); return true; } catch (e) { return false; } },
    remover: function (chave) { try { window.localStorage.removeItem(chave); } catch (e) { /* sem acesso */ } }
  };
  window.LF = { $: $, $$: $$, esc: esc, icone: icone, moeda: moeda, duracaoTexto: duracaoTexto, armazenamento: armazenamento };

  /* ---------- Frascos genéricos em SVG ---------- */
  function frascoSVG(tipo, rotulo) {
    var r = esc(rotulo);
    var label = function (x, y, w, h) {
      return '<rect class="frasco-creme" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"/>' +
        '<rect class="frasco-dourado" x="' + x + '" y="' + (y + 4) + '" width="' + w + '" height="2"/>' +
        '<rect class="frasco-dourado" x="' + x + '" y="' + (y + h - 6) + '" width="' + w + '" height="2"/>' +
        '<text class="frasco-texto" x="' + (x + w / 2) + '" y="' + (y + h / 2 - 1) + '" font-size="' + Math.min(7.5, w / 7.4).toFixed(1) + '" text-anchor="middle" letter-spacing="0.4">LÂMINA FINA</text>' +
        '<text class="frasco-texto" x="' + (x + w / 2) + '" y="' + (y + h / 2 + 9) + '" font-size="6" text-anchor="middle" letter-spacing="1">' + r + "</text>";
    };
    var corpo = "";
    if (tipo === "pote") {
      corpo = '<ellipse class="frasco-carvao" cx="60" cy="146" rx="40" ry="6" opacity=".5"/>' +
        '<rect class="frasco-grafite" x="20" y="74" width="80" height="70" rx="10"/>' +
        '<rect class="frasco-brilho" x="26" y="78" width="8" height="60" rx="4"/>' +
        '<rect class="frasco-dourado" x="16" y="56" width="88" height="22" rx="5"/>' +
        '<rect class="frasco-couro" x="16" y="72" width="88" height="4"/>' + label(30, 92, 60, 36);
    } else if (tipo === "conta-gotas") {
      corpo = '<ellipse class="frasco-carvao" cx="60" cy="150" rx="30" ry="5" opacity=".5"/>' +
        '<rect class="frasco-carvao" x="51" y="10" width="18" height="26" rx="9"/>' +
        '<rect class="frasco-dourado" x="46" y="34" width="28" height="20" rx="3"/>' +
        '<path class="frasco-grafite" d="M52 54h16v10c0 4 20 8 20 22v58a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6V86c0-14 20-18 20-22z"/>' +
        '<rect class="frasco-brilho" x="38" y="86" width="6" height="56" rx="3"/>' + label(38, 96, 44, 40);
    } else if (tipo === "tubo") {
      corpo = '<ellipse class="frasco-carvao" cx="60" cy="150" rx="28" ry="5" opacity=".5"/>' +
        '<path class="frasco-grafite" d="M30 18h60l-6 104c0 4-4 8-8 8H44c-4 0-8-4-8-8z"/>' +
        '<rect class="frasco-dourado" x="28" y="12" width="64" height="10" rx="2"/>' +
        '<rect class="frasco-dourado" x="46" y="128" width="28" height="22" rx="4"/>' +
        '<rect class="frasco-brilho" x="40" y="26" width="6" height="90" rx="3"/>' + label(40, 56, 40, 40);
    } else {
      corpo = '<ellipse class="frasco-carvao" cx="60" cy="152" rx="30" ry="5" opacity=".5"/>' +
        '<rect class="frasco-dourado" x="56" y="6" width="34" height="8" rx="3"/>' +
        '<rect class="frasco-dourado" x="54" y="10" width="8" height="22"/>' +
        '<rect class="frasco-carvao" x="48" y="30" width="24" height="16" rx="3"/>' +
        '<rect class="frasco-grafite" x="32" y="44" width="56" height="106" rx="12"/>' +
        '<rect class="frasco-brilho" x="38" y="52" width="6" height="90" rx="3"/>' + label(38, 78, 44, 44);
    }
    return '<svg viewBox="0 0 120 160" role="img" aria-label="Frasco genérico de ' + r.toLowerCase() + ' Lâmina Fina">' + corpo + "</svg>";
  }

  window.LF.frascoSVG = frascoSVG;

  /* ---------- Renderização das seções a partir de dados.js ---------- */
  function renderServicos() {
    var alvo = $("#lista-servicos");
    if (!alvo || !D.servicos) return;
    alvo.innerHTML = D.servicos.map(function (s) {
      return '<li class="servico" tabindex="0">' + icone("scissors") +
        '<span class="servico__nome">' + esc(s.nome) + "</span>" +
        '<span class="servico__pontos" aria-hidden="true"></span>' +
        '<span class="servico__preco">' + (s.aPartirDe ? "<small>a partir de </small>" : "") + moeda(s.preco) + "</span>" +
        '<span class="servico__duracao">' + icone("clock") + "<span>Duração: " + duracaoTexto(s.duracao) + "</span></span></li>";
    }).join("");
  }

  function renderCombos() {
    var alvo = $("#grade-combos");
    if (!alvo || !D.combos) return;
    alvo.innerHTML = D.combos.map(function (c, i) {
      return '<article class="combo brilho-borda revelar' + (c.destaque ? " combo--destaque" : "") + '" style="--atraso:' + i * 120 + 'ms">' +
        (c.destaque ? '<span class="combo__selo">' + esc(c.destaque) + "</span>" : "") +
        "<h3>" + esc(c.nome) + "</h3>" +
        '<p class="combo__preco">' + moeda(c.preco) + "</p>" +
        '<p class="combo__duracao">' + icone("clock") + duracaoTexto(c.duracao) + "</p>" +
        '<ul class="combo__itens">' + c.itens.map(function (it) { return "<li>" + icone("check") + esc(it) + "</li>"; }).join("") + "</ul>" +
        '<button type="button" class="btn btn--couro" data-agendar-combo="' + esc(c.id) + '">Agendar combo<span class="sr-only"> ' + esc(c.nome) + "</span></button>" +
        "</article>";
    }).join("");
  }

  function renderBarbeiros() {
    var alvo = $("#grade-barbeiros");
    if (!alvo || !D.barbeiros) return;
    alvo.innerHTML = D.barbeiros.map(function (b, i) {
      return '<article class="barbeiro revelar" style="--atraso:' + i * 100 + 'ms">' +
        '<div class="barbeiro__foto"><img src="' + BASE_IMG + esc(b.foto) + '" alt="Retrato do barbeiro ' + esc(b.nome) + '" width="600" height="750" loading="lazy" decoding="async"></div>' +
        '<div class="barbeiro__info"><h3>' + esc(b.nome) + "</h3><p>" + esc(b.especialidade) + "</p>" +
        '<button type="button" class="botao-icone" data-demo="Instagram" aria-label="Instagram de ' + esc(b.nome) + ' (demonstração)">' + icone("instagram") + "</button></div>" +
        "</article>";
    }).join("");
  }

  function renderClube() {
    var alvo = $("#planos-clube");
    if (!alvo || !D.planosClube) return;
    alvo.innerHTML = D.planosClube.map(function (p) {
      return '<li class="plano brilho-borda"><span class="plano__nome">' + esc(p.nome) + '</span><span class="plano__preco">' + moeda(p.preco) + "<small>/mês</small></span></li>";
    }).join("");
  }

  function renderProdutos() {
    var alvo = $("#grade-produtos");
    if (!alvo || !D.produtos) return;
    alvo.innerHTML = D.produtos.map(function (p, i) {
      return '<li class="produto brilho-borda revelar" style="--atraso:' + i * 90 + 'ms">' +
        '<div class="produto__img">' + frascoSVG(p.tipo, p.rotulo) + "</div>" +
        "<h3>" + esc(p.nome) + "</h3>" +
        '<p class="produto__preco">' + moeda(p.preco) + "</p>" +
        '<button type="button" class="btn btn--pequeno" data-demo="Reservar na loja">Reservar na loja<span class="sr-only">: ' + esc(p.nome) + "</span></button></li>";
    }).join("");
  }

  function renderDepoimentos() {
    var alvo = $("#trilho-depoimentos");
    if (!alvo || !D.depoimentos) return;
    var estrelas = '<div class="estrelas" role="img" aria-label="Nota 5 de 5">' + new Array(6).join(icone("star")) + "</div>";
    alvo.innerHTML = D.depoimentos.map(function (d, i) {
      return '<li class="depoimento" aria-roledescription="slide" aria-label="' + (i + 1) + " de " + D.depoimentos.length + '">' +
        '<div class="depoimento__topo"><span class="avatar" aria-hidden="true">' + esc(d.nome.charAt(0)) + "</span>" + estrelas + "</div>" +
        "<blockquote><p>“" + esc(d.texto) + "”</p></blockquote>" +
        "<cite>" + esc(d.nome) + ", cliente</cite></li>";
    }).join("");
  }

  function renderFaq() {
    var alvo = $("#lista-faq");
    if (!alvo || !D.perguntas) return;
    alvo.innerHTML = D.perguntas.map(function (p, i) {
      var resp = esc(p.resposta).replace("Regras do Clube", '<a href="regras-do-clube.html">Regras do Clube</a>');
      return "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(p.pergunta) + icone("chevron-down") + "</summary>" +
        '<div class="faq__resposta"><p>' + resp + "</p></div></details>";
    }).join("");
  }

  function renderGaleria() {
    var filtros = $("#filtros-galeria");
    var grade = $("#grade-galeria");
    if (!filtros || !grade || !D.galeria) return;
    filtros.innerHTML = D.filtrosGaleria.map(function (f, i) {
      return '<button type="button" class="filtro" data-filtro="' + f.id + '" aria-pressed="' + (i === 0) + '">' + esc(f.nome) + "</button>";
    }).join("");
    grade.innerHTML = D.galeria.map(function (g, i) {
      return '<li class="galeria__item" data-categoria="' + g.categoria + '">' +
        '<button type="button" class="galeria__botao" data-indice="' + i + '" aria-label="Ampliar foto: ' + esc(g.alt) + '">' +
        '<img src="' + BASE_IMG + g.arquivo + '" alt="' + esc(g.alt) + '" width="800" height="600" loading="lazy" decoding="async">' +
        '<span class="galeria__lupa" aria-hidden="true">Ampliar</span></button></li>';
    }).join("");
  }

  function renderFeed() {
    $$(".feed").forEach(function (lista) {
      var fotos = (D.galeria || []).slice(0, 6);
      lista.innerHTML = fotos.map(function (g) {
        return '<li><a href="#" data-demo="Instagram" aria-label="Post do Instagram: ' + esc(g.alt) + ' (demonstração)">' +
          '<img src="' + BASE_IMG + g.arquivo + '" alt="" width="200" height="200" loading="lazy" decoding="async"></a></li>';
      }).join("");
    });
  }

  /* ---------- Modais ---------- */
  var ultimoFoco = null;
  function abrirDialog(dialog) {
    if (!dialog) return;
    ultimoFoco = doc.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    var alvo = dialog.querySelector("[data-foco-inicial]") || dialog.querySelector("button, a[href]");
    if (alvo) alvo.focus();
  }
  function fecharDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }
  $$("dialog.modal").forEach(function (dlg) {
    dlg.addEventListener("close", function () {
      if (ultimoFoco && typeof ultimoFoco.focus === "function") ultimoFoco.focus();
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) fecharDialog(dlg);
      if (e.target.closest("[data-fechar]")) fecharDialog(dlg);
    });
  });
  window.LF.abrirDialog = abrirDialog;
  window.LF.fecharDialog = fecharDialog;

  function abrirDemo(acao) {
    var dlg = $("#modal-demo");
    if (!dlg) return;
    var titulo = $("#modal-demo-titulo");
    if (titulo) titulo.textContent = acao ? acao + ": demonstração" : "Projeto demonstrativo";
    abrirDialog(dlg);
  }
  window.LF.abrirDemo = abrirDemo;
  doc.addEventListener("click", function (e) {
    var gatilho = e.target.closest("[data-demo]");
    if (!gatilho) return;
    e.preventDefault();
    abrirDemo(gatilho.getAttribute("data-demo"));
  });

  /* ---------- Cabeçalho, menu e navegação ---------- */
  var cabecalho = $(".cabecalho");
  var menu = $("#menu-principal");
  var toggle = $(".menu-toggle");
  function fecharMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("is-aberto");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  }
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var aberto = toggle.getAttribute("aria-expanded") === "true";
      if (aberto) { fecharMenu(); return; }
      menu.classList.add("is-aberto");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu");
      var primeiro = menu.querySelector("a");
      if (primeiro) primeiro.focus();
    });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) fecharMenu(); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-aberto")) { fecharMenu(); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 1020) fecharMenu(); });
  }

  var botaoTopo = $(".flutuante--topo");
  function aoRolar() {
    var y = window.scrollY || window.pageYOffset;
    if (cabecalho) cabecalho.classList.toggle("is-rolado", y > 10);
    if (botaoTopo) botaoTopo.classList.toggle("is-visivel", y > 600);
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();
  if (botaoTopo) {
    botaoTopo.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduzMovimento ? "auto" : "smooth" });
      var pular = $(".pular-conteudo");
      if (pular) pular.focus({ preventScroll: true });
    });
  }

  // Link ativo no menu conforme a seção visível (só na home)
  var linksSecao = $$('.menu__link[href^="#"]');
  if (linksSecao.length && "IntersectionObserver" in window) {
    var mapa = {};
    linksSecao.forEach(function (l) { mapa[l.getAttribute("href").slice(1)] = l; });
    var obsMenu = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting && mapa[en.target.id]) {
          linksSecao.forEach(function (l) { l.removeAttribute("aria-current"); });
          mapa[en.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(mapa).forEach(function (id) { var s = doc.getElementById(id); if (s) obsMenu.observe(s); });
  }

  /* ---------- Contadores ---------- */
  function animarNumero(el) {
    var alvo = parseFloat(el.getAttribute("data-contar"));
    var casas = parseInt(el.getAttribute("data-casas") || "0", 10);
    var prefixo = el.getAttribute("data-prefixo") || "";
    var sufixo = el.getAttribute("data-sufixo") || "";
    var fmt = function (v) { return prefixo + v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }) + sufixo; };
    if (reduzMovimento) { el.textContent = fmt(alvo); return; }
    var inicio = null, dur = 1600;
    function passo(t) {
      if (!inicio) inicio = t;
      var p = Math.min((t - inicio) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(casas ? Math.round(alvo * e * 10) / 10 : Math.round(alvo * e));
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  var contadores = $$("[data-contar]");
  if (contadores.length) {
    if ("IntersectionObserver" in window) {
      var obsNum = new IntersectionObserver(function (ents, obs) {
        ents.forEach(function (en) { if (en.isIntersecting) { animarNumero(en.target); obs.unobserve(en.target); } });
      }, { threshold: 0.6 });
      contadores.forEach(function (c) { obsNum.observe(c); });
    } else {
      contadores.forEach(animarNumero);
    }
  }

  /* ---------- Galeria: filtros e lightbox ---------- */
  function iniciarGaleria() {
    var filtros = $("#filtros-galeria");
    var grade = $("#grade-galeria");
    if (!filtros || !grade) return;
    var status = $("#status-galeria");
    filtros.addEventListener("click", function (e) {
      var b = e.target.closest(".filtro");
      if (!b) return;
      var f = b.getAttribute("data-filtro");
      $$(".filtro", filtros).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var n = 0;
      $$(".galeria__item", grade).forEach(function (it) {
        var mostra = f === "todos" || it.getAttribute("data-categoria") === f;
        it.hidden = !mostra;
        if (mostra) { n++; it.style.animation = "none"; void it.offsetWidth; it.style.animation = ""; }
      });
      if (status) status.textContent = n + " fotos exibidas em " + b.textContent;
    });

    var lb = $("#lightbox");
    if (!lb) return;
    var img = $("#lightbox-img"), legenda = $("#lightbox-legenda");
    var visiveis = [], pos = 0;
    function mostrar(i) {
      pos = (i + visiveis.length) % visiveis.length;
      var g = D.galeria[visiveis[pos]];
      img.src = BASE_IMG + g.arquivo;
      img.alt = g.alt;
      legenda.textContent = g.alt + " (" + (pos + 1) + " de " + visiveis.length + ")";
    }
    grade.addEventListener("click", function (e) {
      var b = e.target.closest(".galeria__botao");
      if (!b) return;
      visiveis = $$(".galeria__item:not([hidden]) .galeria__botao", grade).map(function (x) { return +x.getAttribute("data-indice"); });
      abrirDialog(lb);
      mostrar(visiveis.indexOf(+b.getAttribute("data-indice")));
    });
    $(".lightbox__seta--ant", lb).addEventListener("click", function () { mostrar(pos - 1); });
    $(".lightbox__seta--prox", lb).addEventListener("click", function () { mostrar(pos + 1); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); mostrar(pos - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); mostrar(pos + 1); }
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mostrar(pos + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- Carrossel de depoimentos ---------- */
  function iniciarCarrossel() {
    var trilho = $("#trilho-depoimentos");
    if (!trilho) return;
    var ant = $(".carrossel__seta--ant"), prox = $(".carrossel__seta--prox");
    function passo() {
      var item = trilho.querySelector(".depoimento");
      return item ? item.getBoundingClientRect().width + 14 : 300;
    }
    function atualizar() {
      var max = trilho.scrollWidth - trilho.clientWidth - 2;
      if (ant) ant.disabled = trilho.scrollLeft <= 2;
      if (prox) prox.disabled = trilho.scrollLeft >= max;
    }
    var comportamento = reduzMovimento ? "auto" : "smooth";
    if (ant) ant.addEventListener("click", function () { trilho.scrollBy({ left: -passo(), behavior: comportamento }); });
    if (prox) prox.addEventListener("click", function () { trilho.scrollBy({ left: passo(), behavior: comportamento }); });
    trilho.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    trilho.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); trilho.scrollBy({ left: passo(), behavior: comportamento }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); trilho.scrollBy({ left: -passo(), behavior: comportamento }); }
    });
    // Arrasto com mouse (no toque o próprio scroll nativo cuida do arrasto)
    var arrastando = false, xIni = 0, scrollIni = 0, moveu = false;
    trilho.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      arrastando = true; moveu = false; xIni = e.clientX; scrollIni = trilho.scrollLeft;
      trilho.classList.add("is-arrastando");
    });
    window.addEventListener("pointermove", function (e) {
      if (!arrastando) return;
      var dx = e.clientX - xIni;
      if (Math.abs(dx) > 3) moveu = true;
      trilho.scrollLeft = scrollIni - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!arrastando) return;
      arrastando = false;
      trilho.classList.remove("is-arrastando");
      var p = passo();
      trilho.scrollTo({ left: Math.round(trilho.scrollLeft / p) * p, behavior: comportamento });
    });
    trilho.addEventListener("click", function (e) { if (moveu) { e.preventDefault(); e.stopPropagation(); } }, true);
    atualizar();
  }

  /* ---------- Banner de cookies ---------- */
  function iniciarCookies() {
    var banner = $("#banner-cookies");
    if (!banner) return;
    var escolha = armazenamento.ler("lf-cookies");
    if (escolha) return;
    banner.hidden = false;
    doc.body.classList.add("tem-cookies");
    banner.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cookies]");
      if (!b) return;
      armazenamento.gravar("lf-cookies", b.getAttribute("data-cookies") + "|" + new Date().toISOString());
      banner.hidden = true;
      doc.body.classList.remove("tem-cookies");
    });
  }

  /* ---------- Revelar ao rolar ---------- */
  function iniciarRevelar() {
    var itens = $$(".revelar");
    if (!itens.length) return;
    if (reduzMovimento || !("IntersectionObserver" in window)) {
      itens.forEach(function (i) { i.classList.add("is-visivel"); });
      return;
    }
    var obs = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visivel"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    itens.forEach(function (i) { obs.observe(i); });
  }

  /* ---------- Início ---------- */
  renderServicos();
  renderCombos();
  renderBarbeiros();
  renderClube();
  renderProdutos();
  renderDepoimentos();
  renderFaq();
  renderGaleria();
  renderFeed();
  iniciarGaleria();
  iniciarCarrossel();
  iniciarCookies();
  iniciarRevelar();
  doc.dispatchEvent(new CustomEvent("lf:pronto"));
})();

/* Brilho que segue o ponteiro na borda dos cards (só com mouse e sem movimento reduzido) */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(hover: hover)").matches) return;
  document.addEventListener("pointermove", function (e) {
    var card = e.target.closest && e.target.closest(".brilho-borda");
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });
})();
