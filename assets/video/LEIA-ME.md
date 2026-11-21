# Vídeo de fundo da hero

Coloque aqui o vídeo da barbearia que aparece atrás do título da página inicial.

1. Exporte o vídeo em **MP4 (H.264)** e, se possível, também em **WebM (VP9)**.
   - 1920 x 1080 (ou 1280 x 720 para ficar mais leve), de 8 a 15 segundos, sem áudio.
   - Tente manter cada arquivo abaixo de 4 MB.
2. Salve como `assets/video/hero.mp4` e `assets/video/hero.webm`.
3. Em `assets/js/dados.js`, preencha:

```js
heroVideo: {
  webm: "assets/video/hero.webm",
  mp4: "assets/video/hero.mp4"
},
```

O vídeo toca sem som, em loop, e usa `assets/img/hero.webp` como capa enquanto carrega.
Se o visitante preferir menos movimento (`prefers-reduced-motion`) ou o vídeo não carregar, fica só a foto.
