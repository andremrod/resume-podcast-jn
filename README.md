# Resume Podcast - JN

**Publicada na Chrome Web Store: [instalar Resume Podcast - JN](https://chromewebstore.google.com/detail/resume-podcast-jn/ioocoajakjjkpcjbbkbcmpfkpcicgmkm)**

[![build](https://github.com/andremrod/resume-podcast-jn/actions/workflows/release.yml/badge.svg)](https://github.com/andremrod/resume-podcast-jn/actions/workflows/release.yml)

Extensão do Chrome que **lembra onde você parou** nos podcasts do [jovemnerd.com.br](https://jovemnerd.com.br). Feche a aba no meio do episódio, abra de novo depois, e o player continua do mesmo ponto.

> Extensão independente, sem vínculo oficial com o Jovem Nerd.

*English: a Chrome extension, [available on the Chrome Web Store](https://chromewebstore.google.com/detail/resume-podcast-jn/ioocoajakjjkpcjbbkbcmpfkpcicgmkm) (Manifest V3), that saves and restores your playback position on jovemnerd.com.br podcasts. No permissions beyond that site, no network requests, no remote code.*

## Como funciona

- **Salva o progresso** quando você pausa, quando o episódio termina e a cada 5 minutos enquanto ele toca.
- **Retoma sozinha** quando você abre o mesmo episódio de novo, assim que o áudio carrega.
- **Guarda um episódio por vez.** Ao começar outro, o progresso do anterior é apagado.
- **Não retoma no final.** Se você parou a menos de 10 segundos do fim, o episódio começa do zero.
- **Funciona com a navegação do site,** que troca de página sem recarregar. A extensão observa o player (`#audio`, `#link`, `#title`) e percebe quando o episódio muda.

## Privacidade

Tudo fica no seu navegador, no `localStorage` do site jovemnerd.com.br: o endereço do episódio, o título, o ponto em que você parou e a data. A extensão:

- só roda em `*.jovemnerd.com.br`;
- não pede nenhuma permissão extra;
- não faz nenhuma requisição de rede;
- não usa código remoto.

[Política de privacidade completa](https://andremrod.github.io/resumepodcast-jn.github.io/)

## Instalar

**Pela Chrome Web Store (recomendado)**

Abra a [página da extensão](https://chromewebstore.google.com/detail/resume-podcast-jn/ioocoajakjjkpcjbbkbcmpfkpcicgmkm) e clique em **Usar no Chrome**. As atualizações chegam sozinhas.

**Pelo pacote pronto**
1. Baixe `resume-podcast-jn.zip` na [última Release](https://github.com/andremrod/resume-podcast-jn/releases/latest) e descompacte.
2. Abra `chrome://extensions` e ligue o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e escolha a pasta descompactada.

**Pelo código**
```bash
git clone https://github.com/andremrod/resume-podcast-jn.git
```
Depois siga os passos 2 e 3 escolhendo a pasta clonada.

## Estrutura

```
manifest.json   Manifest V3: content script só em *.jovemnerd.com.br
content.js      salva e restaura o progresso (sem dependências, sem build)
icons/          ícones 16, 48 e 128 px
docs/           página da política de privacidade
```

## Publicar uma versão nova

1. Aumente `version` no `manifest.json`.
2. Crie a tag com o mesmo número:
   ```bash
   git tag v1.0.1 && git push origin v1.0.1
   ```

O GitHub Actions confere o manifest e a sintaxe do script, gera o `.zip` e cria a Release com ele anexado. Esse mesmo `.zip` serve para enviar à Chrome Web Store.

## Licença

[MIT](LICENSE)
