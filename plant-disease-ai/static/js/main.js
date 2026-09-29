/**
 * SmartAgro AI - Frontend Client Controller
 * Bilingual (English + Telugu), Real-time Diagnosis, Camera Capture,
 * Top-3 Visualizer, and Pesticide Knowledge Directory.
 */

// Bilingual Translation Dictionary
const I18N = {
  en: {
    tagline: "Crop Disease Diagnostic & Pesticide Recommendation System",
    pesticideDirectory: "Pesticide Guide",
    uploadTitle: "📸 Upload Crop Leaf Photo",
    uploadSubtitle: "Supports Rice, Wheat, Cotton, Tomato, Potato leaves",
    dragText: "<strong>Click to upload</strong> or drag & drop leaf photo",
    useCamera: "Use Camera",
    diagnoseBtn: "🔍 Diagnose Disease",
    diagnosingBtn: "Analyzing Leaf...",
    quickTest: "⚡ Quick 1-Click Test Samples:",
    resultsTitle: "🔬 Diagnostic Advisory",
    statusWaiting: "Awaiting Leaf Scan",
    statusAnalyzed: "Diagnosis Complete",
    emptyTitle: "No Leaf Scanned Yet",
    emptyDesc: "Select an image from your device or click a 1-click sample to run the deep learning diagnosis and receive precise chemical & organic remedies.",
    lowConfTitle: "Low Confidence Scan (<60%)",
    pathogen: "Pathogen",
    confidence: "Confidence",
    top3Title: "📊 Top 3 Differential Diagnoses",
    chemPesticide: "Chemical Pesticide",
    dosageTitle: "Recommended Dosage",
    precautionsTitle: "Application Precautions",
    organicTitle: "Organic / Bio-Alternative",
    capturePhoto: "📷 Live Leaf Capture",
    takeSnap: "Capture Photo",
    directoryTitle: "📚 Crop Protection & Pesticide Directory",
    toggleBtnText: "తెలుగు",
    chatBotTitle: "AI Agronomist Bot",
    chatBotSubtitle: "✨ 24/7 Smart Farm Assistant",
    chatBannerText: "Pest or Disease Outbreak?",
    chatReportBtn: "+ Report Incident",
    chatWelcome: "Hello! I'm your <strong>Fieldnote AI Agronomist Assistant</strong>. How can I help you manage your fields today?",
    chatAction1: "Report Pest Incident",
    chatAction2: "Fall Armyworm Diagnosis",
    chatAction3: "Weather Crop Risk",
    chatAction4: "Soil Moisture Advice",
    chatPlaceholder: "Ask AI or type symptoms..."
  },
  te: {
    tagline: "పంట తెగుళ్ల నిర్ధారణ మరియు పురుగుమందుల సిఫార్సు వ్యవస్థ",
    pesticideDirectory: "పురుగుమందుల సమాచారం",
    uploadTitle: "📸 పంట ఆకు ఫోటోను అప్‌లోడ్ చేయండి",
    uploadSubtitle: "వరి, గోధుమ, పత్తి, టమోటా, బంగాళాదుంప పంటలకు మద్దతు",
    dragText: "<strong>ఫోటో ఎంచుకోవడానికి క్లిక్ చేయండి</strong> లేదా ఇక్కడకు లాగి వదలండి",
    useCamera: "కెమెరా వాడండి",
    diagnoseBtn: "🔍 తెగులును గుర్తించండి",
    diagnosingBtn: "పరిశీలిస్తోంది...",
    quickTest: "⚡ నమూనా ఆకులతో తక్షణ పరీక్ష:",
    resultsTitle: "🔬 వ్యాధి నిర్ధారణ & సలహా",
    statusWaiting: "ఆకు స్కాన్ కొరకు వేచిచూస్తోంది",
    statusAnalyzed: "నిర్ధారణ పూర్తయింది",
    emptyTitle: "ఇంకా ఏ ఆకును స్కాన్ చేయలేదు",
    emptyDesc: "మీ పరికరం నుండి ఫోటోను ఎంచుకోండి లేదా నమూనాపై క్లిక్ చేసి తెగులు గుర్తింపు మరియు రసాయన/సేంద్రీయ నివారణ చర్యలను పొందండి.",
    lowConfTitle: "ఖచ్చితత్వం తక్కువగా ఉంది (<60%)",
    pathogen: "రోగకారకం",
    confidence: "ఖచ్చితత్వం",
    top3Title: "📊 టాప్ 3 సంభావ్య తెగుళ్లు",
    chemPesticide: "రసాయన పురుగుమందు",
    dosageTitle: "సిఫార్సు చేసిన మోతాదు",
    precautionsTitle: "ముందు జాగ్రత్తలు",
    organicTitle: "సేంద్రీయ / జీవ నియంత్రణ ప్రత్యామ్నాయం",
    capturePhoto: "📷 ప్రత్యక్ష ఆకు ఫోటో తీయండి",
    takeSnap: "ఫోటో తీయండి",
    directoryTitle: "📚 సమగ్ర పంట రక్షణ & పురుగుమందుల గైడ్",
    toggleBtnText: "English",
    chatBotTitle: "AI అగ్రోనమిస్ట్ బాట్",
    chatBotSubtitle: "✨ 24/7 స్మార్ట్ ఫార్మ్ అసిస్టెంట్",
    chatBannerText: "తెగులు లేదా వ్యాధి వ్యాప్తి ఉందా?",
    chatReportBtn: "+ ఘటనను నివేదించండి",
    chatWelcome: "నమస్కారం! నేను మీ <strong>ఫీల్డ్‌నోట్ AI అగ్రోనమిస్ట్ అసిస్టెంట్‌ని</strong>. మీ పొలం నిర్వహణ మరియు పంటల సంరక్షణలో మీకు ఎలా సహాయపడగలను?",
    chatAction1: "తెగులు ఘటనను నివేదించండి",
    chatAction2: "కత్తెర పురుగు నిర్ధారణ",
    chatAction3: "వాతావరణ పంట ప్రమాద సూచన",
    chatAction4: "నేల తేమ & నీటి యాజమాన్యం",
    chatPlaceholder: "AI ని అడగండి లేదా లక్షణాలు రాయండి..."
  }
};

let currentLang = "en";
let currentImageFile = null;
let currentPredictionData = null;
let pesticideDB = null;
let cameraStream = null;

// DOM Elements
const langToggleBtn = document.getElementById("langToggleBtn");
const currentLangText = document.getElementById("currentLangText");
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const dropzonePrompt = document.getElementById("dropzonePrompt");
const previewContainer = document.getElementById("previewContainer");
const imagePreview = document.getElementById("imagePreview");
const clearImageBtn = document.getElementById("clearImageBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const analyzeBtnText = document.getElementById("analyzeBtnText");
const analyzeSpinner = document.getElementById("analyzeSpinner");
const statusBadge = document.getElementById("statusBadge");

const emptyState = document.getElementById("emptyState");
const resultsBody = document.getElementById("resultsBody");
const lowConfWarning = document.getElementById("lowConfWarning");
const lowConfDesc = document.getElementById("lowConfDesc");

const resCropBadge = document.getElementById("resCropBadge");
const resDiseaseName = document.getElementById("resDiseaseName");
const resPathogen = document.getElementById("resPathogen");
const resSymptoms = document.getElementById("resSymptoms");
const resConfidence = document.getElementById("resConfidence");
const top3List = document.getElementById("top3List");

const resPesticide = document.getElementById("resPesticide");
const resDosage = document.getElementById("resDosage");
const resPrecaution = document.getElementById("resPrecaution");
const resAlternative = document.getElementById("resAlternative");

// Camera Modal Elements
const cameraBtn = document.getElementById("cameraBtn");
const cameraModal = document.getElementById("cameraModal");
const closeCameraBtn = document.getElementById("closeCameraBtn");
const cameraVideo = document.getElementById("cameraVideo");
const snapPhotoBtn = document.getElementById("snapPhotoBtn");

// Directory Modal Elements
const encyclopediaBtn = document.getElementById("encyclopediaBtn");
const directoryModal = document.getElementById("directoryModal");
const closeDirectoryBtn = document.getElementById("closeDirectoryBtn");
const cropTabs = document.getElementById("cropTabs");
const directoryList = document.getElementById("directoryList");

// Sample Preset Buttons
const sampleChips = document.querySelectorAll(".chip");

// --- Initialization ---
function initApp() {
  setupLanguageToggle();
  setupDropzone();
  setupAnalyze();
  setupCamera();
  setupDirectory();
  setupSampleChips();
  setupChatbot();
  fetchPesticideDatabase();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// --- Language Toggle ---
function setupLanguageToggle() {
  langToggleBtn.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "te" : "en";
    document.body.setAttribute("data-lang", currentLang);
    applyTranslations();
    if (currentPredictionData) {
      renderPrediction(currentPredictionData);
    }
  });
}

function applyTranslations() {
  const dict = I18N[currentLang];
  currentLangText.textContent = dict.toggleBtnText;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) {
      el.setAttribute("placeholder", dict[key]);
    }
  });
}

// --- Dropzone & File Handling ---
function setupDropzone() {
  dropzone.addEventListener("click", (e) => {
    if (e.target !== clearImageBtn) fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  clearImageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    resetUpload();
  });
}

function handleFile(file) {
  currentImageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    dropzonePrompt.classList.add("hidden");
    previewContainer.classList.remove("hidden");
    analyzeBtn.disabled = false;
  };
  reader.readAsDataURL(file);
}

function resetUpload() {
  currentImageFile = null;
  fileInput.value = "";
  imagePreview.src = "";
  previewContainer.classList.add("hidden");
  dropzonePrompt.classList.remove("hidden");
  analyzeBtn.disabled = true;
  emptyState.classList.remove("hidden");
  resultsBody.classList.add("hidden");
  statusBadge.className = "status-badge idle";
  statusBadge.textContent = I18N[currentLang].statusWaiting;
}

// --- Diagnosis Prediction ---
function setupAnalyze() {
  analyzeBtn.addEventListener("click", async () => {
    if (!currentImageFile) return;

    // Loading State
    analyzeBtn.disabled = true;
    analyzeSpinner.classList.remove("hidden");
    analyzeBtnText.textContent = I18N[currentLang].diagnosingBtn;

    const formData = new FormData();
    formData.append("image", currentImageFile);

    try {
      const resp = await fetch("/predict", {
        method: "POST",
        body: formData
      });

      if (!resp.ok) {
        throw new Error(`Server returned HTTP ${resp.status}`);
      }

      const data = await resp.json();
      currentPredictionData = data;
      renderPrediction(data);
    } catch (err) {
      alert("Error diagnosing leaf image: " + err.message);
    } finally {
      analyzeBtn.disabled = false;
      analyzeSpinner.classList.add("hidden");
      analyzeBtnText.textContent = I18N[currentLang].diagnoseBtn;
    }
  });
}

function renderPrediction(data) {
  emptyState.classList.add("hidden");
  resultsBody.classList.remove("hidden");

  statusBadge.className = "status-badge success";
  statusBadge.textContent = I18N[currentLang].statusAnalyzed;

  const isTe = currentLang === "te";

  // Crop & Disease Name
  resCropBadge.textContent = isTe ? data.crop_telugu : data.crop;
  resDiseaseName.textContent = isTe ? data.disease_telugu : data.disease;
  resPathogen.textContent = data.pathogen_type;
  resSymptoms.textContent = isTe ? data.symptoms_telugu : data.symptoms;

  // Confidence
  resConfidence.textContent = `${data.confidence}%`;
  const confRing = document.getElementById("confidenceRing");
  if (data.confidence >= 80) {
    confRing.style.borderColor = "var(--emerald-light)";
  } else if (data.confidence >= 60) {
    confRing.style.borderColor = "var(--gold-accent)";
  } else {
    confRing.style.borderColor = "var(--amber-warning)";
  }

  // Low confidence warning
  if (data.low_confidence_warning) {
    lowConfWarning.classList.remove("hidden");
    lowConfDesc.textContent = isTe ? data.warning_message_telugu : data.warning_message;
  } else {
    lowConfWarning.classList.add("hidden");
  }

  // Top 3 Diagnoses
  top3List.innerHTML = "";
  if (data.top3 && data.top3.length > 0) {
    data.top3.forEach((item, index) => {
      const cropLabel = isTe ? item.crop_te : item.crop;
      const disLabel = isTe ? item.disease_te : item.disease;
      const itemEl = document.createElement("div");
      itemEl.className = "top3-item";
      itemEl.innerHTML = `
        <div class="top3-labels">
          <span>${index + 1}. ${cropLabel} — ${disLabel}</span>
          <span>${item.confidence}%</span>
        </div>
        <div class="top3-bar-wrap">
          <div class="top3-bar" style="width: ${item.confidence}%"></div>
        </div>
      `;
      top3List.appendChild(itemEl);
    });
  }

  // Treatment Recommendations
  resPesticide.textContent = isTe ? data.pesticide_telugu : data.pesticide;
  resDosage.textContent = isTe ? data.dosage_telugu : data.dosage;
  resPrecaution.textContent = isTe ? data.precaution_telugu : data.precaution;
  resAlternative.textContent = isTe ? data.alternative_telugu : data.alternative;
}

// --- Quick 1-Click Samples ---
function setupSampleChips() {
  sampleChips.forEach(chip => {
    chip.addEventListener("click", async () => {
      const sampleKey = chip.getAttribute("data-sample");
      const parts = sampleKey.split("_");
      const crop = parts[0];
      const disease = parts.slice(1).join("_");

      // Generate a canvas-based sample leaf preview instantly
      const canvas = document.createElement("canvas");
      canvas.width = 224;
      canvas.height = 224;
      const ctx = canvas.getContext("2d");

      // Draw stylized background
      ctx.fillStyle = "#1e392a";
      ctx.fillRect(0, 0, 224, 224);

      // Draw leaf blade
      ctx.fillStyle = "#2d7a42";
      ctx.beginPath();
      ctx.ellipse(112, 112, 45, 95, 0.1, 0, 2 * Math.PI);
      ctx.fill();

      // Draw midrib
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(112, 20);
      ctx.lineTo(112, 204);
      ctx.stroke();

      // Draw disease lesions
      ctx.fillStyle = disease.includes("rust") ? "#f59e0b" : (disease.includes("white") ? "#ffffff" : "#78350f");
      for (let i = 0; i < 12; i++) {
        const x = 95 + Math.random() * 35;
        const y = 40 + Math.random() * 140;
        ctx.beginPath();
        ctx.arc(x, y, 4 + Math.random() * 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      canvas.toBlob(blob => {
        const file = new File([blob], `${sampleKey}_sample.jpg`, { type: "image/jpeg" });
        handleFile(file);
        // Trigger instant analysis
        analyzeBtn.click();
      }, "image/jpeg");
    });
  });
}

// --- Camera Integration ---
function setupCamera() {
  cameraBtn.addEventListener("click", async () => {
    cameraModal.classList.remove("hidden");
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      cameraVideo.srcObject = cameraStream;
    } catch (err) {
      alert("Unable to access camera: " + err.message);
      cameraModal.classList.add("hidden");
    }
  });

  closeCameraBtn.addEventListener("click", stopCamera);

  snapPhotoBtn.addEventListener("click", () => {
    const canvas = document.getElementById("cameraCanvas");
    canvas.width = cameraVideo.videoWidth || 640;
    canvas.height = cameraVideo.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
      handleFile(file);
      stopCamera();
    }, "image/jpeg");
  });
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  cameraModal.classList.add("hidden");
}

// --- Pesticide Directory ---
async function fetchPesticideDatabase() {
  try {
    const res = await fetch("/api/pesticides");
    pesticideDB = await res.json();
    buildDirectoryTabs();
  } catch (e) {
    console.warn("Could not load pesticide database:", e);
  }
}

function setupDirectory() {
  encyclopediaBtn.addEventListener("click", () => {
    directoryModal.classList.remove("hidden");
  });

  closeDirectoryBtn.addEventListener("click", () => {
    directoryModal.classList.add("hidden");
  });
}

function buildDirectoryTabs() {
  if (!pesticideDB) return;
  cropTabs.innerHTML = "";
  const cropKeys = Object.keys(pesticideDB);

  cropKeys.forEach((cropKey, idx) => {
    const crop = pesticideDB[cropKey];
    const btn = document.createElement("button");
    btn.className = `tab-btn ${idx === 0 ? "active" : ""}`;
    btn.textContent = crop.crop_name_en;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCropDiseases(cropKey);
    });
    cropTabs.appendChild(btn);
  });

  if (cropKeys.length > 0) {
    renderCropDiseases(cropKeys[0]);
  }
}

function renderCropDiseases(cropKey) {
  const crop = pesticideDB[cropKey];
  directoryList.innerHTML = "";
  const isTe = currentLang === "te";

  Object.entries(crop.diseases).forEach(([dKey, dVal]) => {
    const card = document.createElement("div");
    card.className = "dir-disease-card";
    card.innerHTML = `
      <h4 class="dir-disease-title">${isTe ? dVal.disease_name_te : dVal.disease_name_en}</h4>
      <p style="font-size:0.8rem; color:var(--text-muted);"><strong>Symptoms:</strong> ${isTe ? dVal.symptoms_te : dVal.symptoms_en}</p>
      <p style="font-size:0.8rem; color:var(--emerald-light);"><strong>Pesticide:</strong> ${isTe ? dVal.pesticide_te : dVal.pesticide}</p>
      <p style="font-size:0.8rem;"><strong>Dosage:</strong> ${isTe ? dVal.dosage_te : dVal.dosage}</p>
      <p style="font-size:0.8rem; color:var(--amber-warning);"><strong>Precautions:</strong> ${isTe ? dVal.precaution_te : dVal.precaution}</p>
      <p style="font-size:0.8rem; color:#86efac;"><strong>Organic Option:</strong> ${isTe ? dVal.alternative_te : dVal.alternative}</p>
    `;
    directoryList.appendChild(card);
  });
}

// --- AI Agronomist Chatbot Implementation ---
function setupChatbot() {
  const chatbotToggleBtn = document.getElementById("chatbotToggleBtn");
  const chatbotBox = document.getElementById("chatbotBox");
  const chatbotCloseBtn = document.getElementById("chatbotCloseBtn");
  const chatbotForm = document.getElementById("chatbotForm");
  const chatbotInput = document.getElementById("chatbotInput");
  const chatbotMessages = document.getElementById("chatbotMessages");
  const chatReportIncidentBtn = document.getElementById("chatReportIncidentBtn");
  const quickPillBtns = document.querySelectorAll(".quick-pill-btn");

  if (!chatbotToggleBtn || !chatbotBox) return;

  // Global toggle function for in-page popup
  window.toggleChatbot = (show) => {
    if (show) {
      chatbotBox.classList.remove("hidden");
      chatbotBox.style.display = "flex";
      chatbotToggleBtn.classList.add("hidden");
      chatbotToggleBtn.style.display = "none";
      if (chatbotInput) setTimeout(() => chatbotInput.focus(), 100);
    } else {
      chatbotBox.classList.add("hidden");
      chatbotBox.style.display = "none";
      chatbotToggleBtn.classList.remove("hidden");
      chatbotToggleBtn.style.display = "flex";
    }
  };

  // Toggle chatbot open/close handlers
  chatbotToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.toggleChatbot(true);
  });

  chatbotCloseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.toggleChatbot(false);
  });

  // Outbreak "+ Report Incident" button
  if (chatReportIncidentBtn) {
    chatReportIncidentBtn.addEventListener("click", () => {
      appendUserChatMessage(currentLang === "te" ? "ఘటనను నివేదించండి" : "Report Pest Incident");
      setTimeout(() => {
        appendBotChatMessage(
          currentLang === "te"
            ? "⚠️ తెగులు లేదా వ్యాధి తీవ్రతను విశ్లేషించడానికి దయచేసి పంట ఆకు ఫోటోను అప్‌లోడ్ చేయండి. నేను డీప్ లెర్నింగ్ మోడల్ ద్వారా విశ్లేషిస్తాను!"
            : "⚠️ To diagnose and report the pest or disease outbreak, please select or capture a high-resolution leaf photo. Opening scanner now!"
        );
        const dropzoneEl = document.getElementById("dropzone");
        if (dropzoneEl) {
          dropzoneEl.scrollIntoView({ behavior: "smooth", block: "center" });
          if (fileInput) fileInput.click();
        }
      }, 300);
    });
  }

  // Quick Action Pills
  quickPillBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const query = btn.getAttribute("data-query");
      const text = btn.querySelector(".pill-text") ? btn.querySelector(".pill-text").textContent : query;
      handleUserQuery(query, text);
    });
  });

  // Form submit
  chatbotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = chatbotInput.value.trim();
    if (!query) return;
    chatbotInput.value = "";
    handleUserQuery(query, query);
  });

  async function handleUserQuery(queryKey, displayText) {
    appendUserChatMessage(displayText);

    // Add thinking placeholder
    const thinkingEl = document.createElement("div");
    thinkingEl.className = "chat-msg bot-msg";
    thinkingEl.innerHTML = `<div class="chat-bubble" style="opacity: 0.7;"><em>🌱 ${currentLang === "te" ? "విశ్లేషిస్తోంది..." : "Consulting agronomist engine..."}</em></div>`;
    chatbotMessages.appendChild(thinkingEl);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: queryKey, lang: currentLang })
      });
      const data = await res.json();
      thinkingEl.remove();

      appendBotChatMessage(data.reply);

      if (data.action === "trigger_upload") {
        setTimeout(() => {
          const dropzoneEl = document.getElementById("dropzone");
          if (dropzoneEl) {
            dropzoneEl.scrollIntoView({ behavior: "smooth", block: "center" });
            if (fileInput) fileInput.click();
          }
        }, 500);
      }
    } catch (err) {
      thinkingEl.remove();
      appendBotChatMessage(
        currentLang === "te"
          ? "క్షమించండి, సర్వర్ స్పందించడం లేదు. దయచేసి కాసేపటి తర్వాత ప్రయత్నించండి."
          : "Sorry, I had trouble connecting to the agronomy engine. Please try again shortly."
      );
    }
  }

  function appendUserChatMessage(text) {
    const msg = document.createElement("div");
    msg.className = "chat-msg user-msg";
    msg.innerHTML = `<div class="chat-bubble"><p>${escapeHtml(text)}</p></div>`;
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function appendBotChatMessage(text) {
    const msg = document.createElement("div");
    msg.className = "chat-msg bot-msg";

    let formatted = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n• /g, "<br>• ")
      .replace(/\n/g, "<br>");

    msg.innerHTML = `<div class="chat-bubble"><p>${formatted}</p></div>`;
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

