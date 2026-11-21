# Lâmina Fina Barbearia

> **Projeto fictício de portfólio.** A Lâmina Fina Barbearia não existe. Os barbeiros, clientes, depoimentos, avaliações, preços, números e contatos são inventados, e nenhum atendimento real é oferecido. Site desenvolvido por **LS Luccas Souza**.

Site estático completo de uma barbearia de bairro em São Paulo, com agendamento online que funciona de verdade no navegador. É feito em HTML, CSS e JavaScript puros, sem framework e sem etapa de build.

**Site publicado:** https://luccas-souza7.github.io/barbearia/

![Página inicial da Lâmina Fina Barbearia](assets/img/print-home.webp)

## Destaque: agendamento online funcional

O agendamento tem 5 etapas, todo em JavaScript puro (`assets/js/agendamento.js`):

1. **Serviço ou combo:** combos com o desconto calculado e serviços avulsos, com preço e duração.
2. **Barbeiro:** um dos quatro barbeiros, com foto, ou "Sem preferência" (o sistema escolhe o primeiro livre).
3. **Data e horário:** calendário gerado em JS. O dia de hoje fica destacado. Domingos, segundas e dias que já passaram ficam desabilitados. Os horários vão das 9h às 20h e respeitam a duração do serviço.
4. **Produtos (opcional):** pomada, óleo, balm e shampoo, com quantidade. O cliente **retira na barbearia** no dia do horário. Não há entrega.
5. **Seus dados e confirmação:** nome e telefone obrigatórios (com máscara e validação) e revisão de tudo, com botões para alterar cada parte. Quem assina o Clube marca "Sou assinante" e informa o **CPF** (validado pelos dígitos verificadores): os serviços do plano saem por R$ 0.

Ao lado do formulário, um **resumo do pedido** acompanha cada escolha: serviço, economia do combo, produtos e total.

Mais detalhes:

- Os horários "ocupados" saem de um hash determinístico da data, do barbeiro e do horário. A agenda parece real e é sempre a mesma a cada visita.
- Cada etapa tem validação, mensagem de erro acessível, ícone no indicador de progresso e animação de transição.
- O calendário funciona pelo teclado (setas, Home, End e Enter).
- "Agendar este combo" pré-seleciona o combo.
- A altura do formulário não "pula" entre as etapas: no desktop o painel não encolhe, e no celular a altura muda com animação suave.
- **Nenhum dado é enviado.** O último agendamento fica no `localStorage` (com `try/catch`) para mostrar "Seu último agendamento" na volta, **sem nome, telefone ou CPF**. Se o visitante recusar no aviso de cookies, nada é gravado.

## Outros recursos

- **Abertura com a marca:** na primeira visita da sessão, o emblema da Lâmina Fina se desenha em dourado e a tela se abre como uma cortina, revelando a hero. Dura menos de 2 segundos e some com qualquer clique, tecla ou rolagem.
- **Hero em tela cheia** (`100svh`) com **vídeo de fundo** da barbearia (veja `assets/video/LEIA-ME.md`) e foto de capa enquanto o vídeo carrega.
- **Clube Lâmina Fina** logo depois dos combos: planos com o que cada um cobre e o passo a passo de como o assinante agenda (CPF na confirmação).
- **Galeria horizontal guiada pela rolagem:** a seção trava no centro da tela e os cards com moldura passam enquanto a página rola, sem barra de rolagem visível, com contador e barra de progresso. Clique numa foto para ampliar (lightbox com setas, teclado e gesto).
- **Combos como seção de venda:** preço avulso riscado, economia calculada, itens com ícones e destaque para o combo principal.
- **Depoimentos** com nota 5,0 no Google, logo do Google, estrelas, data e carrossel que avança sozinho (pausa com mouse, foco ou toque).
- **Perguntas frequentes** em accordion animado, com uma pergunta aberta por vez.
- **Seção "Onde estamos"** com mapa escuro grande (Leaflet + OpenStreetMap), marcador no centro de São Paulo, endereço, horários e contato, carregada só quando chega perto da tela.
- **Formas de pagamento** com os logotipos de Visa, Mastercard e Pix, além de débito e dinheiro, e ícone oficial do WhatsApp nas cores do site.
- **Transição entre páginas:** View Transitions nativas nos navegadores compatíveis e uma cortina dourada nos demais.
- Animações de entrada ao rolar, hovers e microinterações em todo o site. Tudo respeita `prefers-reduced-motion`.
- Páginas de Termos de Uso, Política de Privacidade (LGPD), Política de Cookies, Regras do Clube (com o art. 49 do CDC), um guia de cuidados e uma página 404 personalizada.
- Catálogo do design system em [`design-system.html`](design-system.html).

## Tecnologias

- HTML5 semântico
- CSS puro com variáveis (custom properties), Grid e Flexbox
- JavaScript puro (ES5+)
- [GSAP + ScrollTrigger](https://gsap.com) para as animações ao rolar, carregados depois da primeira pintura
- [Leaflet](https://leafletjs.com) para o mapa
- SVG para emblema, postes de barbeiro, coroa, frascos e ícones (sprite Lucide local)
- GitHub Pages para a hospedagem

As bibliotecas ficam dentro do projeto (`assets/js/vendor/`), sem depender de CDN.

## Estrutura de pastas

```text
.
├── index.html                  # página inicial
├── termos-de-uso.html
├── politica-de-privacidade.html
├── politica-de-cookies.html
├── regras-do-clube.html
├── cuidados.html               # guia de cuidados entre as visitas
├── 404.html
├── design-system.html          # catálogo de componentes
├── assets/
│   ├── css/
│   │   ├── styles.css          # todo o visual do site
│   │   ├── design-system.css   # ajustes de layout do catálogo
│   │   └── vendor/             # CSS do Leaflet
│   ├── js/
│   │   ├── dados.js            # serviços, combos, barbeiros, produtos, depoimentos...
│   │   ├── main.js             # montagem das seções e interações
│   │   ├── agendamento.js      # agendamento em 5 etapas
│   │   ├── motion.js           # animações com GSAP + ScrollTrigger
│   │   ├── design-system.js
│   │   └── vendor/             # GSAP, ScrollTrigger e Leaflet
│   ├── img/                    # fotos em WebP, imagem de compartilhamento e print
│   ├── icons/                  # sprite de ícones e logotipos, favicon
│   └── video/                  # vídeo da hero (MP4 e WebM) e instruções
├── referencia/                 # imagem de referência e wireframe
├── sitemap.xml
├── robots.txt
├── CREDITOS.md
└── LICENSE
```

## Decisões de design

**Paleta.** Cinco cores, definidas como variáveis em `:root`:

| Token | Hex | Uso |
|---|---|---|
| `--preto-carvao` | `#151515` | fundo principal, cabeçalho, rodapé |
| `--grafite` | `#2A2A2A` | cards e seções alternadas |
| `--dourado` | `#C8A26B` | botões, ícones, destaques, filetes |
| `--couro` | `#6B4A32` | faixa do clube, etiquetas |
| `--creme` | `#F3EBDD` | títulos sobre fundo escuro, seções claras, texto |

As únicas exceções são as fotos, o poste clássico da abertura (vermelho e azul) e os logotipos de marcas (Google, Visa, Mastercard e Pix), que mantêm suas cores oficiais.

**Tipografia.** Roboto Slab nos títulos, Inter no texto e Oswald no logotipo. Todas do Google Fonts (licença OFL), com `display=swap`.

**Acessibilidade.**

- Contraste AA conferido. O dourado só aparece em texto sobre carvão e grafite. Nas seções claras, os destaques usam couro.
- Foco visível em todos os elementos interativos.
- Navegação por teclado no menu, no agendamento, no calendário, nos modais (`<dialog>`), no lightbox, no carrossel e no accordion.
- `aria-*` nos componentes dinâmicos, `alt` descrevendo o que aparece em cada foto e `lang="pt-BR"`.
- Com `prefers-reduced-motion`, a abertura, o parallax e a galeria fixa são desligados. A galeria vira um carrossel horizontal comum.

**Desempenho.** Imagens em WebP com `width`, `height` e `srcset`, `loading="lazy"` fora da hero, GSAP carregado só depois da primeira pintura, mapa carregado só perto da tela e nenhum framework.

**SEO.** `title` e `meta description` por página, Open Graph com imagem de compartilhamento, favicon SVG do emblema, `sitemap.xml`, `robots.txt` e JSON-LD do tipo `WebSite`.

## Como adaptar para outra barbearia

Quase tudo o que muda de um cliente para outro está em **`assets/js/dados.js`**:

- `negocio`: nome, telefone, e-mail, endereço, coordenadas do mapa, dias fechados e horário de funcionamento.
- `heroVideo`: caminhos do vídeo de fundo da hero.
- `servicos`: nome, preço, duração e ícone.
- `combos`: lista de serviços incluídos (por id) e preço. O preço avulso e a economia são calculados sozinhos.
- `barbeiros`: nome, especialidade, foto e enquadramento da foto (`posicao`).
- `planosClube`: preço e lista do que cada plano cobre (ids de serviços e combos).
- `produtos`, `avaliacoes`, `depoimentos`, `galeria` e `perguntas`.

Para mudar a identidade visual, troque as cinco variáveis de cor no início de `assets/css/styles.css` e as fontes no `<link>` do Google Fonts. Os textos fixos (hero, sobre, rodapé e páginas legais) estão direto nos arquivos HTML.

## Como rodar localmente

Não precisa instalar nada. Na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra http://localhost:8000 no navegador.

## Créditos e licença

- Fotos em domínio público (CC0), vídeo e quadros do Mixkit (licença gratuita), fontes OFL, ícones Lucide (ISC), GSAP (licença gratuita) e Leaflet (BSD). A lista completa está em [CREDITOS.md](CREDITOS.md).
- Código e textos: todos os direitos reservados, Luccas Souza, 2026. É permitida apenas a visualização para avaliação de portfólio. Veja [LICENSE](LICENSE).

## Autor

**Luccas Souza** (LS Luccas Souza)

- GitHub: [github.com/luccas-souza7](https://github.com/luccas-souza7)
- LinkedIn: [linkedin.com/in/luccas-souza7](https://www.linkedin.com/in/luccas-souza7)
