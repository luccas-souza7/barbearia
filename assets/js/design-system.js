/* Abas Overview e Components do design system, com histórico do navegador. */
(function () {
  "use strict";
  var abas = { overview: document.getElementById("overview"), components: document.getElementById("components") };
  var links = document.querySelectorAll("[data-aba]");
  function mostrar() {
    var h = location.hash.replace("#", "");
    var aba = h === "components" || h.indexOf("ds-") === 0 ? "components" : "overview";
    Object.keys(abas).forEach(function (k) { abas[k].hidden = k !== aba; });
    links.forEach(function (l) {
      if (l.getAttribute("data-aba") === aba) l.setAttribute("aria-current", "page"); else l.removeAttribute("aria-current");
    });
    if (h.indexOf("ds-") === 0) { var alvo = document.getElementById(h); if (alvo) alvo.scrollIntoView(); }
  }
  window.addEventListener("hashchange", mostrar);
  mostrar();
  var p = document.getElementById("ds-produto");
  if (p && window.LF && window.DADOS) {
    var d = window.DADOS.produtos[0];
    p.innerHTML = '<li class="produto brilho-borda"><div class="produto__img">' + window.LF.frascoSVG(d.tipo, d.rotulo) +
      "</div><h3>" + d.nome + '</h3><p class="produto__preco">' + window.LF.moeda(d.preco) + '</p><button type="button" class="btn btn--pequeno">Reservar na loja</button></li>';
  }
})();
