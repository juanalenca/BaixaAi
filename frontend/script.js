const API_BASE_URL = "http://localhost:3000";

const convertButton = document.getElementById("convertButton");
const downloadButton = document.getElementById("downloadButton");
const youtubeLink = document.getElementById("youtubeLink");
const conversionType = document.getElementById("conversionType");
const quality = document.getElementById("quality");
const loading = document.getElementById("loading");
const downloadSection = document.getElementById("downloadSection");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

function resetToInitialState() {
  youtubeLink.value = "";
  conversionType.value = "mp3";
  quality.value = "high";
  loading.classList.add("hidden");
  downloadSection.classList.add("hidden");
  youtubeLink.focus();
}

convertButton.addEventListener("click", async () => {
  const url = youtubeLink.value.trim();
  const format = conversionType.value;
  const qualityValue = quality.value;

  if (!url) {
    alert("Por favor, insira o link do YouTube.");
    return;
  }

  // Validação básica de URL do YouTube no client
  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/;
  if (!ytRegex.test(url)) {
    alert("Por favor, insira um link válido do YouTube.");
    return;
  }

  // Mostra estado de carregamento
  loading.classList.remove("hidden");
  downloadSection.classList.add("hidden");
  convertButton.disabled = true;

  try {
    const response = await fetch(
      `${API_BASE_URL}/convert?url=${encodeURIComponent(url)}&format=${format}&quality=${qualityValue}`
    );

    loading.classList.add("hidden");
    convertButton.disabled = false;

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      downloadButton.href = downloadUrl;
      downloadButton.download = `converted.${format}`;
      downloadButton.textContent = "Baixar Arquivo";
      downloadSection.classList.remove("hidden");
    } else {
      const errorData = await response.json().catch(() => null);
      alert(errorData?.error || "Erro ao converter o vídeo. Tente novamente.");
    }
  } catch (error) {
    alert("Erro ao conectar ao servidor. Verifique se o backend está rodando.");
    loading.classList.add("hidden");
    convertButton.disabled = false;
  }
});

// Botão "Sim" — reseta o formulário para nova conversão
yesButton.addEventListener("click", () => {
  resetToInitialState();
});

// Botão "Não" — esconde a seção de download e exibe mensagem de encerramento
noButton.addEventListener("click", () => {
  downloadSection.classList.add("hidden");
  const msg = document.getElementById("newConversionMessage");
  if (msg) {
    msg.textContent = "Obrigado por usar o BaixaAí!";
    msg.classList.remove("hidden");
  }
});
