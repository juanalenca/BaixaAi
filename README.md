# BaixaAí ⬇️

Conversor e downloader de vídeos do YouTube para **MP3** e **MP4** com seleção de qualidade. Aplicação full-stack composta por um backend em **Node.js/Express** que processa streams de vídeo via `ytdl-core` e transcodifica áudio com **FFmpeg**, servindo os arquivos para um frontend leve escrito em HTML + JavaScript.

---

## Funcionalidades

- **Conversão para MP3:** Extrai o áudio do vídeo do YouTube e transcodifica para MP3 utilizando o codec `libmp3lame` via FFmpeg em pipeline de stream.
- **Download em MP4:** Captura o stream de vídeo completo e entrega o arquivo direto ao navegador.
- **Seleção de Qualidade:** Três níveis de qualidade configuráveis (Alta, Média, Baixa) que mapeiam para os filtros de bitrate do `ytdl-core`.
- **Processamento em Memória Temporária:** O backend grava o arquivo convertido em um diretório `temp/` e o deleta automaticamente via `fs.unlinkSync` após o download ser concluído, evitando acumulação de lixo no disco.
- **Feedback Visual:** Barra de carregamento animada durante a conversão e seção de download pós-conclusão com opção de nova conversão.

---

## Arquitetura

```text
BaixaAi/
├── backend/
│   ├── server.js           # API Express: rota GET /convert com params (url, format, quality)
│   ├── package.json        # Dependências: express, ytdl-core, fluent-ffmpeg, cors
│   └── package-lock.json
├── frontend/
│   ├── index.html          # Interface visual (TailwindCSS via CDN)
│   └── script.js           # Lógica de fetch para o backend e manipulação do DOM
├── .gitignore
└── README.md
```

### Fluxo de Operação

```
[Frontend]                          [Backend - Express]
    │                                       │
    ├─ GET /convert?url=...&format=...  ──► │
    │                                       ├─ ytdl.validateURL()
    │                                       ├─ ytdl.getInfo() → metadados
    │                                       ├─ ytdl() → stream de vídeo/áudio
    │                                       │
    │                                       ├─ [MP3] ffmpeg(stream).audioCodec('libmp3lame')
    │                                       ├─ [MP4] stream.pipe(writeStream)
    │                                       │
    │                                       ├─ res.download(arquivo)
    │  ◄── Blob response ─────────────────  ├─ fs.unlinkSync(arquivo)  ← limpeza
    │                                       │
    ├─ URL.createObjectURL(blob)            │
    └─ Botão "Baixar Arquivo"               │
```

---

## Stack Tecnológica

| Camada | Tecnologia | Função |
|---|---|---|
| Backend | Node.js + Express | API REST para processamento de streams |
| Transcodificação | fluent-ffmpeg | Wrapper Node.js para FFmpeg (conversão MP3) |
| Extração de Vídeo | ytdl-core | Download de streams do YouTube |
| CORS | cors | Permite comunicação cross-origin frontend ↔ backend |
| Frontend | HTML + TailwindCSS (CDN) | Interface responsiva dark mode |
| Lógica Frontend | JavaScript Vanilla | Fetch API, DOM manipulation, ObjectURL |

---

## Pré-requisitos

- **Node.js** (v14+)
- **FFmpeg** instalado e acessível no PATH do sistema (necessário para conversões MP3)

### Instalação do FFmpeg

- **Windows:** Baixe em [ffmpeg.org](https://ffmpeg.org/download.html) e adicione ao PATH do sistema.
- **Linux:** `sudo apt install ffmpeg`
- **macOS:** `brew install ffmpeg`

---

## Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/juanalenca/BaixaAi.git
   cd BaixaAi
   ```

2. Instale as dependências do backend:
   ```bash
   cd backend
   npm install
   ```

3. Inicie o servidor:
   ```bash
   npm start
   ```
   O servidor estará disponível em `http://localhost:3000`.

4. Abra o frontend no navegador:
   ```bash
   # Abra diretamente o arquivo no navegador
   frontend/index.html
   ```

5. Cole o link do YouTube, selecione o formato (MP3/MP4) e a qualidade desejada, então clique em **Converter**.

---

## Observações Importantes

- O `ytdl-core` pode apresentar instabilidades periódicas devido a mudanças frequentes na API interna do YouTube. Em caso de erros de extração, verifique se a versão do pacote está atualizada (`npm update ytdl-core`).
- Arquivos temporários são armazenados em `backend/temp/` e excluídos automaticamente após cada download bem-sucedido.
