// Integração com o backend
const convertButton = document.getElementById("convertButton");
const downloadButton = document.getElementById("downloadButton");
const youtubeLink = document.getElementById("youtubeLink");
const conversionType = document.getElementById("conversionType");
const quality = document.getElementById("quality");
const loading = document.getElementById("loading");
const downloadSection = document.getElementById("downloadSection");

convertButton.addEventListener("click", async () => {
  const url = youtubeLink.value.trim();
  const format = conversionType.value;
  const qualityValue = quality.value;

  if (!url) {
    alert("Por favor, insira o link do YouTube.");
    return;
  }

  // Mostra estado de carregamento
  loading.classList.remove("hidden");
  downloadSection.classList.add("hidden");

  try {
    const response = await fetch(
      `http://localhost:3000/convert?url=${encodeURIComponent(url)}&format=${format}&quality=${qualityValue}`
    );
    loading.classList.add("hidden");

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      downloadButton.href = downloadUrl;
      downloadButton.download = `converted.${format}`;
      downloadButton.textContent = "Baixar Arquivo";
      downloadSection.classList.remove("hidden");
    } else {
      alert("Erro ao converter o vídeo. Tente novamente.");
    }
  } catch (error) {
    alert("Erro ao conectar ao servidor. Verifique se o backend está rodando.");
    loading.classList.add("hidden");
  }
});
