/* Lâmina Fina Barbearia: montagem das seções e interações gerais (JS puro). */
(function () {
  "use strict";

  var D = window.DADOS || {};
  var doc = document;
  var html = doc.documentElement;
  var reduzMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BASE = html.getAttribute("data-base") || "";
  var BASE_ICONES = BASE + "assets/icons/sprite.svg";
  var BASE_IMG = BASE + "assets/img/";

  html.classList.add("js");

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
  function logo(nome, classe, rotulo) {
    var vb = nome === "mastercard" ? "0 0 38 24" : "0 0 24 24";
    return '<svg class="' + (classe || "") + '" viewBox="' + vb + '"' + (rotulo ? ' role="img" aria-label="' + esc(rotulo) + '"' : ' aria-hidden="true" focusable="false"') +
      '><use href="' + BASE_ICONES + "#logo-" + nome + '"></use></svg>';
  }
  function moeda(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
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
  var servicoPorId = {};
  (D.servicos || []).forEach(function (s) { servicoPorId[s.id] = s; });
  function precoAvulso(combo) {
    return combo.inclui.reduce(function (t, id) { return t + (servicoPorId[id] ? servicoPorId[id].preco : 0); }, 0);
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    t.innerHTML = icone("circle-check") + "<span>" + esc(msg) + "</span>";
    t.hidden = false;
    requestAnimationFrame(function () { t.classList.add("is-visivel"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("is-visivel");
      setTimeout(function () { t.hidden = true; }, 300);
    }, 3200);
  }

  window.LF = {
    $: $, $$: $$, esc: esc, icone: icone, logo: logo, moeda: moeda, duracaoTexto: duracaoTexto,
    armazenamento: armazenamento, precoAvulso: precoAvulso, toast: toast, reduzMovimento: reduzMovimento
  };

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
      return '<li class="servico" tabindex="0">' +
        '<span class="servico__icone">' + icone(s.icone || "scissors") + "</span>" +
        '<span class="servico__info"><span class="servico__linha">' +
        '<span class="servico__nome">' + esc(s.nome) + "</span>" +
        '<span class="servico__pontos" aria-hidden="true"></span>' +
        '<span class="servico__preco">' + (s.aPartirDe ? "<small>a partir de </small>" : "") + moeda(s.preco) + "</span></span>" +
        '<span class="servico__duracao">' + icone("clock") + "<span>" + duracaoTexto(s.duracao) + "</span></span></span></li>";
    }).join("");
  }

  function renderCombos() {
    var alvo = $("#grade-combos");
    if (!alvo || !D.combos) return;
    alvo.innerHTML = D.combos.map(function (c) {
      var avulso = precoAvulso(c);
      var economia = avulso - c.preco;
      var itens = c.inclui.map(function (id) {
        var s = servicoPorId[id] || { nome: id, icone: "check" };
        return '<li><span class="combo__item-icone">' + icone(s.icone || "check") + "</span><span>" + esc(s.nome) + '</span><span class="combo__item-preco">' + moeda(s.preco) + "</span></li>";
      }).join("") + (c.extras || []).map(function (x) {
        return '<li class="combo__extra"><span class="combo__item-icone">' + icone("gift") + "</span><span>" + esc(x) + '</span><span class="combo__item-preco">cortesia</span></li>';
      }).join("");
      return '<article class="combo brilho-borda' + (c.destaque ? " combo--destaque" : "") + '">' +
        (c.destaque ? '<span class="combo__selo">' + icone("star") + esc(c.destaque) + "</span>" : "") +
        '<header class="combo__cabeca"><p class="combo__chamada">' + esc(c.chamada || "") + "</p><h3>" + esc(c.nome) + "</h3></header>" +
        '<div class="combo__preco">' +
        '<span class="combo__de">Avulso <s>' + moeda(avulso) + "</s></span>" +
        '<strong class="combo__valor">' + moeda(c.preco) + "</strong>" +
        (economia > 0 ? '<span class="combo__economia">' + icone("badge-percent") + "Economize " + moeda(economia) + "</span>" : "") +
        "</div>" +
        '<p class="combo__duracao">' + icone("clock") + "Cerca de " + duracaoTexto(c.duracao) + "</p>" +
        '<p class="combo__inclui">Inclui</p>' +
        '<ul class="combo__itens">' + itens + "</ul>" +
        '<button type="button" class="btn ' + (c.destaque ? "btn--escuro" : "btn--couro") + ' combo__cta" data-agendar-combo="' + esc(c.id) + '">' +
        icone("calendar-check") + "Agendar este combo<span class=\"sr-only\">: " + esc(c.nome) + "</span></button>" +
        "</article>";
    }).join("");
  }

  function renderBarbeiros() {
    var alvo = $("#grade-barbeiros");
    if (!alvo || !D.barbeiros) return;
    alvo.innerHTML = D.barbeiros.map(function (b) {
      return '<article class="barbeiro">' +
        '<div class="barbeiro__foto"><img src="' + BASE_IMG + esc(b.foto) + '" alt="Retrato do barbeiro ' + esc(b.nome) + '" width="720" height="900" loading="lazy" decoding="async" style="object-position:' + esc(b.posicao || "50% 25%") + '"></div>' +
        '<div class="barbeiro__info"><h3>' + esc(b.nome) + '</h3><p class="barbeiro__funcao">' + esc(b.especialidade) + "</p>" +
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
    alvo.innerHTML = D.produtos.map(function (p) {
      return '<li class="produto brilho-borda">' +
        '<div class="produto__img">' + frascoSVG(p.tipo, p.rotulo) + "</div>" +
        "<h3>" + esc(p.nome) + "</h3>" +
        '<p class="produto__desc">' + esc(p.descricao || "") + "</p>" +
        '<p class="produto__preco">' + moeda(p.preco) + "</p>" +
        '<button type="button" class="btn btn--pequeno" data-add-produto="' + esc(p.id) + '">' + icone("plus") + "Adicionar ao agendamento<span class=\"sr-only\">: " + esc(p.nome) + "</span></button></li>";
    }).join("");
  }

  function estrelas(n, classe) {
    var s = "";
    for (var i = 0; i < 5; i++) s += icone("star", i < n ? "cheia" : "");
    return '<span class="estrelas ' + (classe || "") + '" role="img" aria-label="Nota ' + n + ' de 5">' + s + "</span>";
  }

  function renderDepoimentos() {
    var nota = $("#nota-google");
    var av = D.avaliacoes;
    if (nota && av) {
      nota.innerHTML = logo("google", "nota-google__logo", "Google") +
        '<div class="nota-google__dados"><p class="nota-google__nota"><strong>' + av.nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 }) + "</strong>" + estrelas(5) + "</p>" +
        '<p class="nota-google__total">' + av.total + " avaliações no Google</p></div>";
    }
    var alvo = $("#trilho-depoimentos");
    if (!alvo || !D.depoimentos) return;
    alvo.innerHTML = D.depoimentos.map(function (d, i) {
      var partes = d.nome.split(" ");
      var iniciais = (partes[0].charAt(0) + (partes[1] ? partes[1].charAt(0) : "")).toUpperCase();
      return '<li class="depoimento" aria-roledescription="slide" aria-label="' + (i + 1) + " de " + D.depoimentos.length + '">' +
        '<div class="depoimento__topo"><span class="avatar avatar--' + (i % 3) + '" aria-hidden="true">' + esc(iniciais) + "</span>" +
        '<div class="depoimento__autor"><cite class="depoimento__nome">' + esc(d.nome) + '</cite><span class="depoimento__quando">' + esc(d.quando) + "</span></div>" +
        logo("google", "depoimento__google", "Avaliação no Google") + "</div>" +
        estrelas(5) +
        "<blockquote><p>" + esc(d.texto) + "</p></blockquote></li>";
    }).join("");
  }

  function renderFaq() {
    var alvo = $("#lista-faq");
    if (!alvo || !D.perguntas) return;
    alvo.innerHTML = D.perguntas.map(function (p, i) {
      var resp = esc(p.resposta).replace("Regras do Clube", '<a href="regras-do-clube.html">Regras do Clube</a>');
      return '<details name="faq"' + (i === 0 ? " open" : "") + "><summary><span>" + esc(p.pergunta) + '</span><span class="faq__icone">' + icone("plus") + "</span></summary>" +
        '<div class="faq__resposta"><div class="faq__resposta-interna"><p>' + resp + "</p></div></div></details>";
    }).join("");
  }

  function renderGaleria() {
    var trilho = $("#trilho-galeria");
    if (!trilho || !D.galeria) return;
    trilho.innerHTML = D.galeria.map(function (g, i) {
      var n = String(i + 1).padStart(2, "0");
      return '<li class="galeria-h__item">' +
        '<button type="button" class="galeria-h__botao" data-indice="' + i + '" aria-label="Ampliar foto ' + (i + 1) + ": " + esc(g.alt) + '">' +
        '<img src="' + BASE_IMG + g.arquivo + '-800.webp" srcset="' + BASE_IMG + g.arquivo + "-800.webp 800w, " + BASE_IMG + g.arquivo + '.webp 1600w" sizes="(max-width: 760px) 84vw, 58vw" alt="' + esc(g.alt) + '" width="1600" height="900" loading="lazy" decoding="async">' +
        '<span class="galeria-h__num" aria-hidden="true">' + n + "</span>" +
        '<span class="galeria-h__lupa" aria-hidden="true">' + icone("plus") + "</span></button></li>";
    }).join("");
    var total = $("#galeria-total");
    if (total) total.textContent = String(D.galeria.length).padStart(2, "0");
  }

  function renderFeed() {
    $$(".feed").forEach(function (lista) {
      var fotos = (D.galeria || []).slice(0, 6);
      lista.innerHTML = fotos.map(function (g) {
        return '<li><a href="#" data-demo="Instagram" aria-label="Post do Instagram: ' + esc(g.alt) + ' (demonstração)">' +
          '<img src="' + BASE_IMG + g.arquivo + '-800.webp" alt="" width="200" height="200" loading="lazy" decoding="async"></a></li>';
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

  function aoRolar() {
    var y = window.scrollY || window.pageYOffset;
    if (cabecalho) cabecalho.classList.toggle("is-rolado", y > 10);
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  // Link ativo no menu conforme a seção visível (só na home)
  var linksSecao = $$('.menu__link[href^="#"]');
  if (linksSecao.length && "IntersectionObserver" in window) {
    var mapaLinks = {};
    linksSecao.forEach(function (l) { mapaLinks[l.getAttribute("href").slice(1)] = l; });
    var obsMenu = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting && mapaLinks[en.target.id]) {
          linksSecao.forEach(function (l) { l.removeAttribute("aria-current"); });
          mapaLinks[en.target.id].setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(mapaLinks).forEach(function (id) { var s = doc.getElementById(id); if (s) obsMenu.observe(s); });
  }

  /* ---------- Abertura com o poste de barbeiro ---------- */
  function iniciarAbertura() {
    var el = $("#abertura");
    if (!el) return;
    if (!html.classList.contains("com-abertura")) { el.remove(); return; }
    var terminou = false;
    function fim() {
      if (terminou) return;
      terminou = true;
      html.classList.add("abertura-fim");
      setTimeout(function () {
        el.remove();
        html.classList.remove("com-abertura", "abertura-fim");
      }, 900);
    }
    setTimeout(fim, 1150);
    el.addEventListener("click", fim);
    doc.addEventListener("keydown", fim, { once: true });
    window.addEventListener("wheel", fim, { once: true, passive: true });
    window.addEventListener("touchstart", fim, { once: true, passive: true });
  }

  /* ---------- Vídeo de fundo da hero ---------- */
  function iniciarVideoHero() {
    var video = $(".hero__video");
    var cfg = D.heroVideo || {};
    if (!video || (!cfg.mp4 && !cfg.webm)) return;
    var economia = navigator.connection && navigator.connection.saveData;
    if (reduzMovimento || economia) return;
    [["webm", "video/webm"], ["mp4", "video/mp4"]].forEach(function (par) {
      if (!cfg[par[0]]) return;
      var src = doc.createElement("source");
      src.src = BASE + cfg[par[0]];
      src.type = par[1];
      video.appendChild(src);
    });
    video.poster = BASE_IMG + "hero.webp";
    video.hidden = false;
    video.addEventListener("playing", function () { video.parentNode.classList.add("is-video"); }, { once: true });
    video.addEventListener("error", function () { video.hidden = true; }, true);
    video.load();
    var p = video.play();
    if (p && p.catch) p.catch(function () { video.hidden = true; });
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
  function iniciarContadores() {
    var contadores = $$("[data-contar]");
    if (!contadores.length) return;
    if (!("IntersectionObserver" in window)) { contadores.forEach(animarNumero); return; }
    var obsNum = new IntersectionObserver(function (ents, obs) {
      ents.forEach(function (en) { if (en.isIntersecting) { animarNumero(en.target); obs.unobserve(en.target); } });
    }, { threshold: 0.6 });
    contadores.forEach(function (c) { obsNum.observe(c); });
  }

  /* ---------- Galeria: lightbox e carregamento antecipado ---------- */
  function iniciarGaleria() {
    var trilho = $("#trilho-galeria");
    if (!trilho) return;
    // As fotos ficam fora da tela na horizontal: carrega todas quando a seção se aproxima
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (ents) {
        if (ents[0].isIntersecting) {
          $$("img", trilho).forEach(function (img) { img.loading = "eager"; });
          obs.disconnect();
        }
      }, { rootMargin: "800px 0px" });
      obs.observe(trilho);
    }
    var lb = $("#lightbox");
    if (!lb) return;
    var img = $("#lightbox-img"), legenda = $("#lightbox-legenda");
    var pos = 0, total = D.galeria.length;
    function mostrar(i) {
      pos = (i + total) % total;
      var g = D.galeria[pos];
      img.src = BASE_IMG + g.arquivo + ".webp";
      img.alt = g.alt;
      legenda.textContent = g.alt + " (" + (pos + 1) + " de " + total + ")";
    }
    trilho.addEventListener("click", function (e) {
      var b = e.target.closest(".galeria-h__botao");
      if (!b) return;
      abrirDialog(lb);
      mostrar(+b.getAttribute("data-indice"));
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
      return item ? item.getBoundingClientRect().width + 18 : 300;
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

  /* ---------- FAQ: uma pergunta aberta por vez, com animação ---------- */
  function iniciarFaq() {
    var itens = $$(".faq details");
    if (!itens.length) return;
    itens.forEach(function (d) { d.removeAttribute("name"); });
    function conteudo(d) { return d.querySelector(".faq__resposta"); }
    function fechar(d) {
      if (!d.open) return;
      var c = conteudo(d);
      if (reduzMovimento || !c.animate) { d.open = false; return; }
      d.classList.add("is-fechando");
      var a = c.animate([{ height: c.offsetHeight + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 260, easing: "cubic-bezier(.4,0,.2,1)" });
      a.onfinish = function () { d.open = false; d.classList.remove("is-fechando"); };
    }
    function abrir(d) {
      d.open = true;
      var c = conteudo(d);
      if (reduzMovimento || !c.animate) return;
      c.animate([{ height: "0px", opacity: 0 }, { height: c.scrollHeight + "px", opacity: 1 }], { duration: 320, easing: "cubic-bezier(.2,.7,.2,1)" });
    }
    itens.forEach(function (d) {
      d.querySelector("summary").addEventListener("click", function (e) {
        e.preventDefault();
        if (d.classList.contains("is-fechando")) return;
        if (d.open) { fechar(d); return; }
        itens.forEach(function (o) { if (o !== d) fechar(o); });
        abrir(d);
      });
    });
  }

  /* ---------- Banner de cookies ---------- */
  function iniciarCookies() {
    var banner = $("#banner-cookies");
    if (!banner) return;
    if (armazenamento.ler("lf-cookies")) return;
    banner.hidden = false;
    banner.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cookies]");
      if (!b) return;
      armazenamento.gravar("lf-cookies", b.getAttribute("data-cookies") + "|" + new Date().toISOString());
      banner.classList.add("is-saindo");
      setTimeout(function () { banner.hidden = true; }, 300);
    });
  }

  /* ---------- Transição entre páginas ---------- */
  function iniciarTransicoes() {
    var suportaVT = "onpagereveal" in window; // transição nativa entre documentos (CSS @view-transition)
    var chave = "lf-transicao";
    if (!suportaVT && !reduzMovimento) {
      var veioDeLink = false;
      try { veioDeLink = !!sessionStorage.getItem(chave); sessionStorage.removeItem(chave); } catch (e) { /* sem acesso */ }
      if (veioDeLink) {
        html.classList.add("chegando");
        setTimeout(function () { html.classList.remove("chegando"); }, 700);
      }
    }
    window.addEventListener("pageshow", function (e) { if (e.persisted) html.classList.remove("saindo"); });
    doc.addEventListener("click", function (e) {
      if (suportaVT || reduzMovimento || e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest("a[href]");
      if (!a || a.target || a.hasAttribute("download") || a.hasAttribute("data-demo")) return;
      var url;
      try { url = new URL(a.getAttribute("href"), location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // âncora na mesma página: rolagem suave
      if (!/(\.html|\/)$/.test(url.pathname)) return;
      e.preventDefault();
      try { sessionStorage.setItem(chave, "1"); } catch (err) { /* sem acesso */ }
      html.classList.add("saindo");
      setTimeout(function () { location.href = url.href; }, 420);
    });
  }

  /* ---------- Mapa (Leaflet + OpenStreetMap com tema escuro), carregado só perto da tela ---------- */
  function carregar(tipo, src) {
    return new Promise(function (ok, erro) {
      var el;
      if (tipo === "css") {
        el = doc.createElement("link"); el.rel = "stylesheet"; el.href = src;
      } else {
        el = doc.createElement("script"); el.src = src; el.async = true;
      }
      el.onload = ok; el.onerror = erro;
      doc.head.appendChild(el);
    });
  }
  function iniciarMapa() {
    var el = $("#mapa");
    var cfg = D.negocio && D.negocio.mapa;
    if (!el || !cfg || !("IntersectionObserver" in window)) return;
    var obs = new IntersectionObserver(function (ents) {
      if (!ents[0].isIntersecting) return;
      obs.disconnect();
      Promise.all([carregar("css", BASE + "assets/css/vendor/leaflet.css"), carregar("js", BASE + "assets/js/vendor/leaflet.js")]).then(function () {
        var L = window.L;
        var mapa = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true }).setView([cfg.lat, cfg.lng], cfg.zoom);
        mapa.attributionControl.setPrefix(false);
        // Tiles padrão do OpenStreetMap; o tema escuro vem de um filtro CSS (.mapa .leaflet-tile-pane)
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">colaboradores do OpenStreetMap</a>'
        }).addTo(mapa);
        var pino = L.divIcon({
          className: "mapa__pino",
          html: '<span class="mapa__pino-pulso"></span>' + icone("map-pin"),
          iconSize: [40, 40],
          iconAnchor: [20, 38],
          popupAnchor: [0, -34]
        });
        L.marker([cfg.lat, cfg.lng], { icon: pino, title: "Lâmina Fina Barbearia", alt: "Marcador da Lâmina Fina Barbearia" })
          .addTo(mapa)
          .bindPopup("<strong>Lâmina Fina Barbearia</strong><br>" + esc(D.negocio.endereco) + "<br><small>" + esc(D.negocio.enderecoNota || "") + "</small>");
        el.classList.add("mapa--ativo");
      }).catch(function () { /* fica o link de fallback */ });
    }, { rootMargin: "300px 0px" });
    obs.observe(el);
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
  iniciarAbertura();
  iniciarVideoHero();
  iniciarContadores();
  iniciarGaleria();
  iniciarCarrossel();
  iniciarFaq();
  iniciarCookies();
  iniciarTransicoes();
  iniciarMapa();
  doc.dispatchEvent(new CustomEvent("lf:pronto"));

  /* ---------- Animações (GSAP) carregadas depois da primeira pintura ---------- */
  // O conteúdo já aparece sem elas; assim a página fica rápida e o motion entra em seguida.
  function carregarMotion() {
    if (reduzMovimento || !$("[data-revelar], [data-stagger], #galeria")) return;
    var v = BASE + "assets/js/";
    carregar("js", v + "vendor/gsap.min.js")
      .then(function () { return carregar("js", v + "vendor/ScrollTrigger.min.js"); })
      .then(function () { return carregar("js", v + "motion.js"); })
      .catch(function () { /* sem animações extras */ });
  }
  function quandoOcioso(fn) {
    if ("requestIdleCallback" in window) window.requestIdleCallback(fn, { timeout: 1500 });
    else setTimeout(fn, 200);
  }
  if (doc.readyState === "complete") quandoOcioso(carregarMotion);
  else window.addEventListener("load", function () { quandoOcioso(carregarMotion); });
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
