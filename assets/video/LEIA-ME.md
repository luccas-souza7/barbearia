# Vídeo de fundo da hero

O vídeo atual é o **Mixkit #43222** ("Barber cutting the hair of a bearded man"), sob a Mixkit Free License (veja `CREDITOS.md`). Ele foi cortado em 12 segundos, sem áudio, em 1280 x 720:

- `hero.mp4` (H.264, cerca de 1 MB)
- `hero.webm` (VP9, cerca de 0,7 MB)

## Como trocar

1. Exporte o novo vídeo em **MP4 (H.264)** e **WebM (VP9)**, 1280 x 720 ou 1920 x 1080, de 8 a 15 segundos, sem áudio, com cada arquivo abaixo de 4 MB.
2. Substitua `assets/video/hero.mp4` e `assets/video/hero.webm` (ou ajuste os caminhos em `heroVideo`, em `assets/js/dados.js`).

O vídeo toca sem som, em loop, e usa `assets/img/hero.webp` como capa enquanto carrega.
Se o visitante preferir menos movimento (`prefers-reduced-motion`), estiver no modo de economia de dados ou o vídeo não carregar, fica só a foto.
