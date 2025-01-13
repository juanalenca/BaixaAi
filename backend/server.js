const express = require("express");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const TEMP_DIR = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR); // Cria diretório temporário
}

// Rota para conversão
app.get("/convert", async (req, res) => {
    const { url, format, quality } = req.query;
  
    if (!ytdl.validateURL(url)) {
      console.error("URL inválida:", url);
      return res.status(400).json({ error: "URL inválida" });
    }
  
    try {
      const videoInfo = await ytdl.getInfo(url);
      console.log("Informações do vídeo:", videoInfo.videoDetails.title);
  
      const videoTitle = videoInfo.videoDetails.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const outputFileName = `${videoTitle}.${format}`;
      const outputPath = path.join(TEMP_DIR, outputFileName);
  
      // Criação do vídeo stream com User-Agent personalizado
      const videoStream = ytdl(url, {
        quality: quality === "high" ? "highest" : quality === "medium" ? "highestaudio" : "lowestaudio",
        filter: format === "mp3" ? "audioonly" : undefined,
        requestOptions: {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        },
      });
  
      if (format === "mp3") {
        ffmpeg(videoStream)
          .audioCodec("libmp3lame")
          .save(outputPath)
          .on("end", () => {
            console.log("Arquivo MP3 criado com sucesso:", outputPath);
            res.download(outputPath, outputFileName, (err) => {
              if (!err) fs.unlinkSync(outputPath);
            });
          })
          .on("error", (err) => {
            console.error("Erro no FFmpeg:", err);
            res.status(500).json({ error: "Erro ao converter para MP3." });
          });
      } else if (format === "mp4") {
        videoStream.pipe(fs.createWriteStream(outputPath)).on("finish", () => {
          console.log("Arquivo MP4 criado com sucesso:", outputPath);
          res.download(outputPath, outputFileName, (err) => {
            if (!err) fs.unlinkSync(outputPath);
          });
        }).on("error", (err) => {
          console.error("Erro ao salvar arquivo MP4:", err);
          res.status(500).json({ error: "Erro ao converter para MP4." });
        });
      } else {
        console.error("Formato inválido:", format);
        res.status(400).json({ error: "Formato inválido." });
      }
    } catch (error) {
      console.error("Erro ao processar o vídeo:", error);
      res.status(500).json({ error: "Erro ao processar o vídeo." });
    }
  });
  

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
