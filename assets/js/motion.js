/* Lâmina Fina Barbearia: animações com GSAP + ScrollTrigger.
 * Tudo aqui é decorativo: sem GSAP ou com "reduzir movimento", o site funciona igual,
 * só que sem as animações (a galeria vira um carrossel horizontal com rolagem nativa). */
(function () {
  "use strict";

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!gsap || !ScrollTrigger || reduz) return;

  gsap.registerPlugin(ScrollTrigger);
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Hero: parallax da mídia ao rolar (a entrada do texto é em CSS) ---------- */
  var hero = document.querySelector(".hero");
  if (hero) {
    gsap.to(".hero__midia", {
      yPercent: 14,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero__conteudo", {
      yPercent: -18, opacity: 0.2,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
    });
  }

  // Elementos que já estão na tela quando o motion carrega não são escondidos de novo
  function jaPassou(el) { return el.getBoundingClientRect().top < window.innerHeight * 0.86; }

  /* ---------- Entradas ao rolar ---------- */
  $$("[data-revelar]").forEach(function (el) {
    if (jaPassou(el)) return;
    var tipo = el.getAttribute("data-revelar");
    var de = { opacity: 0, y: 40 };
    if (tipo === "esquerda") de = { opacity: 0, x: -60 };
    if (tipo === "direita") de = { opacity: 0, x: 60 };
    gsap.from(el, Object.assign(de, {
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%", once: true }
    }));
  });

  $$("[data-stagger]").forEach(function (lista) {
    var filhos = Array.prototype.slice.call(lista.children);
    if (!filhos.length || jaPassou(lista)) return;
    gsap.from(filhos, {
      opacity: 0,
      y: 46,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: { trigger: lista, start: "top 86%", once: true }
    });
  });

  // Fotos dos barbeiros: revelação com máscara de baixo para cima
  $$(".barbeiro__foto").forEach(function (foto, i) {
    if (jaPassou(foto)) return;
    gsap.from(foto, {
      clipPath: "inset(100% 0% 0% 0%)",
      duration: 1.1,
      ease: "power4.out",
      delay: i * 0.08,
      scrollTrigger: { trigger: foto, start: "top 88%", once: true }
    });
  });

  // Títulos de seção: os filetes "abrem" a partir do centro
  $$(".titulo-secao").forEach(function (t) {
    t.classList.add("titulo-secao--anim");
    ScrollTrigger.create({ trigger: t, start: "top 88%", once: true, onEnter: function () { t.classList.add("is-visivel"); } });
  });

  // Coroa do clube e poste da faixa final acompanham a rolagem
  if (document.querySelector(".clube__coroa")) {
    gsap.fromTo(".clube__coroa", { rotate: -8, y: 10 }, {
      rotate: 6, y: -6, ease: "none",
      scrollTrigger: { trigger: ".clube", start: "top bottom", end: "bottom top", scrub: true }
    });
  }
  if (document.querySelector(".cta-faixa__poste")) {
    gsap.fromTo(".cta-faixa__poste", { yPercent: -60 }, {
      yPercent: -40, ease: "none",
      scrollTrigger: { trigger: ".cta-faixa", start: "top bottom", end: "bottom top", scrub: true }
    });
  }

  /* ---------- Galeria horizontal guiada pela rolagem vertical ---------- */
  var galeria = document.querySelector("#galeria");
  var trilho = document.querySelector("#trilho-galeria");
  if (galeria && trilho) {
    galeria.classList.add("galeria-h--pin");
    var janela = galeria.querySelector(".galeria-h__janela");
    var atual = document.querySelector("#galeria-atual");
    var barra = document.querySelector("#galeria-progresso");
    var total = trilho.children.length;
    var distancia = function () { return Math.max(0, trilho.scrollWidth - janela.clientWidth); };

    var horizontal = gsap.to(trilho, {
      x: function () { return -distancia(); },
      ease: "none",
      scrollTrigger: {
        trigger: galeria,
        start: "top top",
        end: function () { return "+=" + distancia(); },
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var n = Math.min(total, Math.floor(self.progress * total) + 1);
          if (atual) atual.textContent = String(n).padStart(2, "0");
          if (barra) barra.style.transform = "scaleX(" + self.progress.toFixed(3) + ")";
        }
      }
    });

    // Cada foto ganha um leve parallax enquanto atravessa a tela
    $$(".galeria-h__item", trilho).forEach(function (item) {
      var img = item.querySelector("img");
      gsap.fromTo(img, { scale: 1.18, xPercent: -6 }, {
        scale: 1.02, xPercent: 6, ease: "none",
        scrollTrigger: { trigger: item, containerAnimation: horizontal, start: "left right", end: "right left", scrub: true }
      });
    });
  }

  // Recalcula as posições depois que imagens e fontes carregam
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
