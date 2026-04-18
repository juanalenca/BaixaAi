const express = require("express");
const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const TEMP_DIR = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

const VALID_FORMATS = ["mp3", "mp4"];
const VALID_QUALITIES = ["high", "medium", "low"];

// Rota para conversão
app.get("/convert", async (req, res) => {
    const { url, format, quality } = req.query;

    if (!url || !ytdl.validateURL(url)) {
      console.error("URL inválida:", url);
      return res.status(400).json({ error: "URL inválida" });
    }

    if (!VALID_FORMATS.includes(format)) {
      console.error("Formato inválido:", format);
      return res.status(400).json({ error: `Formato inválido. Use: ${VALID_FORMATS.join(", ")}` });
    }

    if (!VALID_QUALITIES.includes(quality)) {
      console.error("Qualidade inválida:", quality);
      return res.status(400).json({ error: `Qualidade inválida. Use: ${VALID_QUALITIES.join(", ")}` });
    }

    try {
      const videoInfo = await ytdl.getInfo(url);
      console.log("Informações do vídeo:", videoInfo.videoDetails.title);

      const videoTitle = videoInfo.videoDetails.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const outputFileName = `${videoTitle}.${format}`;
      const outputPath = path.join(TEMP_DIR, outputFileName);

      const qualityMap = {
        high: "highest",
        medium: "highestaudio",
        low: "lowestaudio"
      };

      const videoStream = ytdl(url, {
        quality: qualityMap[quality],
        filter: format === "mp3" ? "audioonly" : undefined,
      });

      const cleanupFile = (filePath) => {
        try {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Erro ao limpar arquivo temporário:", err.message);
        }
      };

      if (format === "mp3") {
        ffmpeg(videoStream)
          .audioCodec("libmp3lame")
          .save(outputPath)
          .on("end", () => {
            console.log("Arquivo MP3 criado com sucesso:", outputPath);
            res.download(outputPath, outputFileName, () => cleanupFile(outputPath));
          })
          .on("error", (err) => {
            console.error("Erro no FFmpeg:", err);
            cleanupFile(outputPath);
            if (!res.headersSent) {
              res.status(500).json({ error: "Erro ao converter para MP3." });
            }
          });
      } else {
        videoStream.pipe(fs.createWriteStream(outputPath)).on("finish", () => {
          console.log("Arquivo MP4 criado com sucesso:", outputPath);
          res.download(outputPath, outputFileName, () => cleanupFile(outputPath));
        }).on("error", (err) => {
          console.error("Erro ao salvar arquivo MP4:", err);
          cleanupFile(outputPath);
          if (!res.headersSent) {
            res.status(500).json({ error: "Erro ao converter para MP4." });
          }
        });
      }
    } catch (error) {
      console.error("Erro ao processar o vídeo:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Erro ao processar o vídeo." });
      }
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
