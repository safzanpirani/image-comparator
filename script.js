document.addEventListener("DOMContentLoaded", () => {
  const checkbox = document.getElementById("checkbox");
  const body = document.body;

  // Load saved theme preference
  function initializeTheme() {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        body.classList.toggle("light-theme", savedTheme === "light");
        checkbox.checked = savedTheme === "light";
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  }

  function initializeCarouselCreator() {
    const carouselForm = document.getElementById("carousel-form");
    const carouselImages = document.getElementById("carousel-images");
    const carouselPreview = document.getElementById("carousel-preview");
    const createCarouselBtn = document.getElementById("create-carousel");
    const carouselResult = document.getElementById("carousel-result");
    const qualitySlider = document.getElementById("carousel-quality");
    const qualityValue = document.getElementById("quality-value");
    const aspectRatioSelect = document.getElementById("carousel-ratio");

    let originalImage = null;

    qualitySlider.addEventListener("input", () => {
      qualityValue.textContent = `${qualitySlider.value}%`;
    });

    carouselImages.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file || !file.type.startsWith("image/")) {
        alert("please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          originalImage = img;
          showPreview();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    function showPreview() {
      const previewCanvas = document.createElement("canvas");
      const ctx = previewCanvas.getContext("2d");

      // Set preview canvas size
      previewCanvas.width = originalImage.width;
      previewCanvas.height = originalImage.height;

      // Draw original image
      ctx.drawImage(originalImage, 0, 0);

      // Calculate number of segments based on image width and selected ratio
      const ratio = aspectRatioSelect.value;
      const segmentWidth = getRatioWidth(ratio, originalImage.height);
      const numberOfSegments = Math.ceil(originalImage.width / segmentWidth);

      // Draw grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;

      for (let i = 1; i < numberOfSegments; i++) {
        const x = i * segmentWidth;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, originalImage.height);
        ctx.stroke();
      }

      carouselPreview.innerHTML = "";
      carouselPreview.appendChild(previewCanvas);
    }

    createCarouselBtn.addEventListener("click", async () => {
      if (!originalImage) {
        alert("please select an image first");
        return;
      }

      const quality = parseInt(qualitySlider.value) / 100;
      const ratio = aspectRatioSelect.value;
      const segmentWidth = getRatioWidth(ratio, originalImage.height);
      const numberOfSegments = Math.ceil(originalImage.width / segmentWidth);

      carouselResult.innerHTML = "<p>Creating carousel segments...</p>";

      try {
        const segments = [];

        for (let i = 0; i < numberOfSegments; i++) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set dimensions based on selected ratio
          const [width, height] = getCarouselDimensions();
          canvas.width = width;
          canvas.height = height;

          // Fill with white background
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);

          // Draw segment of original image
          ctx.drawImage(
            originalImage,
            i * segmentWidth, // source x
            0, // source y
            segmentWidth, // source width
            originalImage.height, // source height
            0, // dest x
            0, // dest y
            width, // dest width
            height, // dest height
          );

          segments.push(canvas.toDataURL("image/jpeg", quality));
        }

        // Display results
        carouselResult.innerHTML = "<h3>Carousel Segments</h3>";
        segments.forEach((dataUrl, index) => {
          const wrapper = document.createElement("div");
          wrapper.className = "segment-wrapper";

          const img = document.createElement("img");
          img.src = dataUrl;
          img.className = "segment-preview";

          const downloadBtn = document.createElement("a");
          downloadBtn.href = dataUrl;
          downloadBtn.download = `carousel-${index + 1}.jpg`;
          downloadBtn.className = "button";
          downloadBtn.textContent = `Download Segment ${index + 1}`;

          wrapper.appendChild(img);
          wrapper.appendChild(downloadBtn);
          carouselResult.appendChild(wrapper);
        });
      } catch (error) {
        console.error("Error creating segments:", error);
        carouselResult.innerHTML = `
                  <p class="error">Error creating carousel segments: ${error.message}</p>
              `;
      }
    });

    function getRatioWidth(ratio, height) {
      switch (ratio) {
        case "1:1":
          return height;
        case "4:5":
          return (height * 4) / 5;
        case "16:9":
          return (height * 16) / 9;
        default:
          return height;
      }
    }

    function getCarouselDimensions() {
      const ratio = aspectRatioSelect.value;
      switch (ratio) {
        case "1:1":
          return [1080, 1080];
        case "4:5":
          return [1080, 1350];
        case "16:9":
          return [1080, 607];
        default:
          return [1080, 1080];
      }
    }

    function processImage(src, targetWidth, targetHeight, quality) {
      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext("2d");

            // Calculate dimensions to maintain aspect ratio
            const scale = Math.max(
              targetWidth / img.width,
              targetHeight / img.height,
            );
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const x = (targetWidth - scaledWidth) / 2;
            const y = (targetHeight - scaledHeight) / 2;

            // Fill background with white
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // Draw image
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

            resolve(canvas.toDataURL("image/jpeg", quality));
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };

        img.src = src;
      });
    }
  }

  // Handle theme toggle
  function handleThemeToggle() {
    try {
      body.classList.toggle("light-theme");
      localStorage.setItem(
        "theme",
        body.classList.contains("light-theme") ? "light" : "dark",
      );
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }

  // Add event listener to checkbox
  if (checkbox) {
    checkbox.addEventListener("change", handleThemeToggle);
    initializeTheme(); // Initialize theme when page loads
  } else {
    console.error("Theme toggle checkbox not found!");
  }

  /* ================== Tab Navigation ================== */
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");

  tabLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const tabName = event.currentTarget.getAttribute("data-tab");
      openTab(event, tabName);
    });
  });

  console.log("Script version:", "0.1.0");
  console.log("Last updated:", new Date().toISOString());

  function isLocalStorageAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Initialize storage with a fallback for incognito mode
  let storageType = isLocalStorageAvailable()
    ? localStorage
    : {
        _data: {},
        setItem(id, val) {
          this._data[id] = val;
        },
        getItem(id) {
          return this._data[id] || null;
        },
        removeItem(id) {
          delete this._data[id];
        },
      };

  function setupDragAndDrop() {
    const fileInputs = document.querySelectorAll(".file-input");

    fileInputs.forEach((fileInput) => {
      const wrapper = fileInput.closest(".file-input-wrapper");

      wrapper.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        wrapper.classList.add("dragover");
      });

      wrapper.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        wrapper.classList.remove("dragover");
      });

      wrapper.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        wrapper.classList.remove("dragover");

        if (e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          updateFileInputLabel(fileInput);

          // Trigger change event to update preview if needed
          const changeEvent = new Event("change");
          fileInput.dispatchEvent(changeEvent);
        }
      });
    });
  }

  const fileInput = document.getElementById("image-files");
  const fileLabel = document.getElementById("file-label");

  fileInput.addEventListener("change", (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      fileLabel.textContent =
        files.length > 1 ? `${files.length} files selected` : files[0].name;
    } else {
      fileLabel.textContent = "no files chosen";
    }
  });
  setupDragAndDrop();

  // Update all file input change listeners to use updateFileInputLabel
  document.querySelectorAll(".file-input").forEach((fileInput) => {
    fileInput.addEventListener("change", () => {
      updateFileInputLabel(fileInput);
    });
  });

  function openTab(evt, tabName) {
    tabContents.forEach((content) => {
      content.classList.remove("active");
    });
    tabLinks.forEach((link) => {
      link.classList.remove("active");
    });
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
  }

  // Automatically open the first tab
  if (tabLinks.length > 0) {
    tabLinks[0].click();
  }

  // Setup custom file inputs
  function setupCustomFileInputs() {
    const fileInputs = document.querySelectorAll(".file-input");

    fileInputs.forEach((fileInput) => {
      const wrapper = fileInput.closest(".file-input-wrapper");
      const button = wrapper.querySelector(".file-input-button");
      const label = wrapper.querySelector(".file-input-label");

      button.addEventListener("click", () => {
        fileInput.click();
      });

      fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
          if (fileInput.multiple) {
            label.textContent = `${fileInput.files.length} file(s) selected`;
          } else {
            label.textContent = fileInput.files[0].name;
          }
        } else {
          label.textContent = "No file chosen";
        }
      });

      // Drag and Drop
      wrapper.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.stopPropagation();
        wrapper.classList.add("dragover");
      });

      wrapper.addEventListener("dragleave", (e) => {
        e.preventDefault();
        e.stopPropagation();
        wrapper.classList.remove("dragover");
      });

      wrapper.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();
        wrapper.classList.remove("dragover");

        if (e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          label.textContent = e.dataTransfer.files[0].name;
          const changeEvent = new Event("change");
          fileInput.dispatchEvent(changeEvent);
        }
      });
    });
  }
  setupCustomFileInputs();

  function debugStorage(action, key, value) {
    console.log(`Storage ${action}:`, { key, value });
    console.log("Current localStorage state:", localStorage);
  }

  let conversationHistory = [];

  // GROQ API key elements
  const groqApiKeyInput = document.getElementById("groq-api-key");
  const saveGroqApiKeyBtn = document.getElementById("save-api-key");
  const clearGroqApiKeyBtn = document.getElementById("clear-api-key");
  const groqApiKeyStatus = document.getElementById("api-key-status");
  const groqChatInterface = document.getElementById("chat-interface");
  const groqChatForm = document.getElementById("chat-form");
  const groqChatInput = document.getElementById("chat-input");
  const groqChatMessages = document.getElementById("chat-messages");

  // General API key and settings elements
  const generalApiKeyInput = document.getElementById("general-api-key");
  const generalEndpointInput = document.getElementById("general-endpoint");
  const generalModelInput = document.getElementById("general-model");
  const saveGeneralApiKeyBtn = document.getElementById("save-general-api-key");
  const clearGeneralApiKeyBtn = document.getElementById(
    "clear-general-api-key",
  );
  const generalApiKeyStatus = document.getElementById("general-api-key-status");
  const generalChatInterface = document.getElementById(
    "general-chat-interface",
  );
  const generalChatForm = document.getElementById("general-chat-form");
  const generalChatInput = document.getElementById("general-chat-input");
  const generalChatMessages = document.getElementById("general-chat-messages");

  // Initialize API keys and settings immediately
  function initializeApiKeys() {
    const savedGroqApiKey = storageType.getItem("groq_api_key");
    if (savedGroqApiKey) {
      GROQ_API_KEY = savedGroqApiKey;
      groqApiKeyInput.value = GROQ_API_KEY;
      groqChatInterface.style.display = "block";
      groqApiKeyStatus.textContent = "using saved API key";
      groqApiKeyStatus.className = "status-success";
      console.log("loaded saved GROQ API key");
      loadConversationHistory("groq");
    } else {
      groqChatInterface.style.display = "none";
      groqApiKeyStatus.textContent = "please enter a GROQ API key";
      groqApiKeyStatus.className = "status-error";
    }

    const savedGeneralApiKey = storageType.getItem("general_api_key");
    const savedGeneralEndpoint = storageType.getItem("general_endpoint");
    const savedGeneralModel = storageType.getItem("general_model");
    if (savedGeneralApiKey && savedGeneralEndpoint && savedGeneralModel) {
      GENERAL_API_KEY = savedGeneralApiKey;
      GENERAL_ENDPOINT = savedGeneralEndpoint;
      GENERAL_MODEL = savedGeneralModel;
      generalApiKeyInput.value = GENERAL_API_KEY;
      generalEndpointInput.value = GENERAL_ENDPOINT;
      generalModelInput.value = GENERAL_MODEL;
      generalChatInterface.style.display = "block";
      generalApiKeyStatus.textContent = "using saved settings";
      generalApiKeyStatus.className = "status-success";
      console.log("loaded saved general API settings");
      loadConversationHistory("general");
    } else {
      generalChatInterface.style.display = "none";
      generalApiKeyStatus.textContent = "please enter your API settings";
      generalApiKeyStatus.className = "status-error";
    }
  }

  // Save GROQ API key
  function saveGroqApiKey() {
    const apiKey = groqApiKeyInput.value.trim();

    if (!apiKey) {
      groqApiKeyStatus.textContent = "please enter a GROQ API key";
      groqApiKeyStatus.className = "status-error";
      groqChatInterface.style.display = "none";
      return;
    }

    if (!apiKey.startsWith("gsk_")) {
      groqApiKeyStatus.textContent =
        "invalid API key format. should start with 'gsk_'";
      groqApiKeyStatus.className = "status-error";
      groqChatInterface.style.display = "none";
      return;
    }

    try {
      // Save the API key
      storageType.setItem("groq_api_key", apiKey);
      GROQ_API_KEY = apiKey;

      // Update UI
      groqApiKeyStatus.textContent = "API key saved successfully!";
      groqApiKeyStatus.className = "status-success";
      groqChatInterface.style.display = "block";

      console.log("GROQ API key saved successfully");
    } catch (error) {
      console.error("error saving GROQ API key:", error);
      groqApiKeyStatus.textContent =
        "error saving GROQ API key. please try again.";
      groqApiKeyStatus.className = "status-error";
    }
  }

  // Clear GROQ API key
  function clearGroqApiKey() {
    try {
      storageType.removeItem("groq_api_key");
      GROQ_API_KEY = "";
      groqApiKeyInput.value = "";
      groqChatInterface.style.display = "none";
      groqApiKeyStatus.textContent = "API key cleared";
      groqApiKeyStatus.className = "status-success";
      console.log("GROQ API key cleared");
    } catch (error) {
      console.error("Error clearing GROQ API key:", error);
      groqApiKeyStatus.textContent =
        "error clearing GROQ API key. please try again.";
      groqApiKeyStatus.className = "status-error";
    }
  }

  // Save general API settings
  function saveGeneralApiSettings() {
    const apiKey = generalApiKeyInput.value.trim();
    const endpoint = generalEndpointInput.value.trim();
    const model = generalModelInput.value.trim();

    if (!apiKey || !endpoint || !model) {
      generalApiKeyStatus.textContent = "please enter all required fields";
      generalApiKeyStatus.className = "status-error";
      generalChatInterface.style.display = "none";
      return;
    }

    try {
      // Save the API key, endpoint, and model
      storageType.setItem("general_api_key", apiKey);
      storageType.setItem("general_endpoint", endpoint);
      storageType.setItem("general_model", model);
      GENERAL_API_KEY = apiKey;
      GENERAL_ENDPOINT = endpoint;
      GENERAL_MODEL = model;

      // Update UI
      generalApiKeyStatus.textContent = "API settings saved successfully!";
      generalApiKeyStatus.className = "status-success";
      generalChatInterface.style.display = "block";

      console.log("General API settings saved successfully");
    } catch (error) {
      console.error("error saving general API settings:", error);
      generalApiKeyStatus.textContent =
        "error saving API settings. please try again.";
      generalApiKeyStatus.className = "status-error";
    }
  }

  // Clear general API settings
  function clearGeneralApiSettings() {
    try {
      storageType.removeItem("general_api_key");
      storageType.removeItem("general_endpoint");
      storageType.removeItem("general_model");
      GENERAL_API_KEY = "";
      GENERAL_ENDPOINT = "";
      GENERAL_MODEL = "";
      generalApiKeyInput.value = "";
      generalEndpointInput.value = "";
      generalModelInput.value = "";
      generalChatInterface.style.display = "none";
      generalApiKeyStatus.textContent = "API settings cleared";
      generalApiKeyStatus.className = "status-success";
      console.log("General API settings cleared");
    } catch (error) {
      console.error("Error clearing general API settings:", error);
      generalApiKeyStatus.textContent =
        "error clearing API settings. please try again.";
      generalApiKeyStatus.className = "status-error";
    }
  }

  // Initialize the API keys and settings on page load
  initializeApiKeys();
  initializeCarouselCreator();

  // Add event listeners
  saveGroqApiKeyBtn.addEventListener("click", saveGroqApiKey);
  clearGroqApiKeyBtn.addEventListener("click", clearGroqApiKey);

  saveGeneralApiKeyBtn.addEventListener("click", saveGeneralApiSettings);
  clearGeneralApiKeyBtn.addEventListener("click", clearGeneralApiSettings);

  // Message sending functions
  async function sendMessageToGroq(message) {
    if (!GROQ_API_KEY) {
      throw new Error("please enter your GROQ API key first");
    }

    return sendMessage(message, "groq");
  }

  async function sendMessageToGeneral(message) {
    if (!GENERAL_API_KEY || !GENERAL_ENDPOINT || !GENERAL_MODEL) {
      throw new Error("please enter all general API settings first");
    }

    return sendMessage(message, "general");
  }

  async function sendMessage(message, type) {
    const apiKey = type === "groq" ? GROQ_API_KEY : GENERAL_API_KEY;
    const endpoint =
      type === "groq"
        ? "https://api.groq.com/openai/v1/chat/completions"
        : GENERAL_ENDPOINT;
    const model =
      type === "groq" ? "llama-3.2-90b-text-preview" : GENERAL_MODEL;
    const historyKey =
      type === "groq" ? "groq_chat_history" : "general_chat_history";

    try {
      // Add user's message to conversation history
      conversationHistory.push({
        role: "user",
        content: message,
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: conversationHistory,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "failed to get response from API",
        );
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      // Add assistant's response to conversation history
      conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      saveConversationHistory(historyKey);
      return assistantMessage;
    } catch (error) {
      console.error("Error:", error);
      if (error.message.includes("authentication")) {
        if (type === "groq") {
          GROQ_API_KEY = "";
          storageType.removeItem("groq_api_key");
          showApiKeyError(
            "invalid GROQ API key. please enter a valid key.",
            groqApiKeyStatus,
          );
        } else {
          GENERAL_API_KEY = "";
          storageType.removeItem("general_api_key");
          GENERAL_ENDPOINT = "";
          storageType.removeItem("general_endpoint");
          GENERAL_MODEL = "";
          storageType.removeItem("general_model");
          showApiKeyError(
            "invalid general API settings. please enter valid settings.",
            generalApiKeyStatus,
          );
        }
      }
      return `Error: ${error.message}`;
    }
  }

  function saveConversationHistory(key) {
    try {
      storageType.setItem(key, JSON.stringify(conversationHistory));
    } catch (error) {
      console.error("error saving chat history:", error);
    }
  }

  function loadConversationHistory(type) {
    try {
      const historyKey =
        type === "groq" ? "groq_chat_history" : "general_chat_history";
      const savedHistory = storageType.getItem(historyKey);
      if (savedHistory) {
        conversationHistory = JSON.parse(savedHistory);
        conversationHistory.forEach((msg) => {
          addMessage(msg.content, msg.role === "user", type);
        });
      }
    } catch (error) {
      console.error("error loading chat history:", error);
      conversationHistory = [];
    }
  }

  function addMessage(message, isUser = false, type = "groq") {
    const target = type === "groq" ? groqChatMessages : generalChatMessages;

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(isUser ? "user-message" : "bot-message");
    messageDiv.textContent = message;
    target.appendChild(messageDiv);
    target.scrollTop = target.scrollHeight;
  }

  if (groqChatForm) {
    groqChatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = groqChatInput.value.trim();
      if (!message) return;

      if (!GROQ_API_KEY) {
        showApiKeyError(
          "please enter your GROQ API key first",
          groqApiKeyStatus,
        );
        return;
      }

      // Add user message to chat
      addMessage(message, true, "groq");
      groqChatInput.value = "";

      // Show typing indicator
      const loadingDiv = createTypingIndicator();
      groqChatMessages.appendChild(loadingDiv);
      groqChatMessages.scrollTop = groqChatMessages.scrollHeight;

      try {
        // Get response from GROQ
        const response = await sendMessageToGroq(message);

        // Remove typing indicator and add bot response
        groqChatMessages.removeChild(loadingDiv);
        addMessage(response, false, "groq");

        // Save conversation history after each message
        saveConversationHistory("groq_chat_history");
      } catch (error) {
        // Remove typing indicator and show error
        groqChatMessages.removeChild(loadingDiv);
        addMessage(`Error: ${error.message}`, false, "groq");
      }
    });
  }

  if (generalChatForm) {
    generalChatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = generalChatInput.value.trim();
      if (!message) return;

      if (!GENERAL_API_KEY || !GENERAL_ENDPOINT || !GENERAL_MODEL) {
        showApiKeyError(
          "please enter all general API settings first",
          generalApiKeyStatus,
        );
        return;
      }

      // Add user message to chat
      addMessage(message, true, "general");
      generalChatInput.value = "";

      // Show typing indicator
      const loadingDiv = createTypingIndicator();
      generalChatMessages.appendChild(loadingDiv);
      generalChatMessages.scrollTop = generalChatMessages.scrollHeight;

      try {
        // Get response from general API
        const response = await sendMessageToGeneral(message);

        // Remove typing indicator and add bot response
        generalChatMessages.removeChild(loadingDiv);
        addMessage(response, false, "general");

        // Save conversation history after each message
        saveConversationHistory("general_chat_history");
      } catch (error) {
        // Remove typing indicator and show error
        generalChatMessages.removeChild(loadingDiv);
        addMessage(`Error: ${error.message}`, false, "general");
      }
    });
  }

  // Helper function to create typing indicator
  function createTypingIndicator() {
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("typing-container");
    loadingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    return loadingDiv;
  }

  // Helper function to display errors related to API keys
  function showApiKeyError(message, statusElement) {
    statusElement.textContent = message;
    statusElement.className = "status-error";

    if (statusElement === groqApiKeyStatus) {
      groqChatInterface.style.display = "none";
    } else {
      generalChatInterface.style.display = "none";
    }
  }
  // PDF Merge functionality
  const mergePdfForm = document.getElementById("merge-pdf-form");
  const mergePdfBtn = document.getElementById("merge-pdf-btn");
  const mergePdfResult = document.getElementById("merge-pdf-result");

  mergePdfBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const pdfFiles = document.getElementById("pdf-files").files;

    if (pdfFiles.length < 2) {
      alert("please select at least two PDF files to merge.");
      return;
    }

    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const pdfFile of pdfFiles) {
      const pdfBytes = await readFileAsArrayBuffer(pdfFile);
      const pdf = await PDFLib.PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    mergePdfResult.innerHTML = `
      <p>PDFs merged successfully!</p>
      <a href="${url}" download="merged.pdf" class="button">download merged PDF</a>
    `;
  });

  // PDF Split functionality
  const splitPdfForm = document.getElementById("split-pdf-form");
  const splitPdfBtn = document.getElementById("split-pdf-btn");
  const splitPdfResult = document.getElementById("split-pdf-result");
  const splitMethod = document.getElementById("split-method");
  const pageRangeInput = document.getElementById("page-range-input");
  const mergeSplitPdfsDiv = document.getElementById("merge-split-pdfs");
  const mergeSplitPdfsBtn = document.getElementById("merge-split-pdfs-btn");

  let splitPdfUrls = []; // Array to store split PDF URLs

  splitMethod.addEventListener("change", () => {
    pageRangeInput.style.display =
      splitMethod.value === "range" ? "block" : "none";
  });

  splitPdfBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const pdfFileInput = document.getElementById("pdf-to-split");
    const pdfFile = pdfFileInput.files[0];

    if (!pdfFile) {
      alert("please select a PDF file to split.");
      return;
    }

    const pdfBytes = await readFileAsArrayBuffer(pdfFile);
    const pdf = await PDFLib.PDFDocument.load(pdfBytes);
    const pageCount = pdf.getPageCount();

    let pagesToExtract = [];

    if (splitMethod.value === "all") {
      pagesToExtract = Array.from({ length: pageCount }, (_, i) => [i]);
    } else {
      const pageRange = document.getElementById("page-range").value;
      pagesToExtract = parsePageRange(pageRange, pageCount);
    }

    splitPdfResult.innerHTML = "<p>PDF split successfully!</p>";
    splitPdfUrls = []; // Clear previous split URLs

    for (const range of pagesToExtract) {
      const newPdf = await PDFLib.PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, range);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      splitPdfUrls.push(url); // Store the URL of each split PDF

      const rangeText =
        range.length > 1
          ? `${range[0] + 1}-${range[range.length - 1] + 1}`
          : `${range[0] + 1}`;
      splitPdfResult.innerHTML += `
        <a href="${url}" download="split_pages_${rangeText}.pdf" class="button">download pages ${rangeText}</a>
      `;
    }

    // Show the merge button after splitting
    mergeSplitPdfsDiv.style.display = "block";
  });

  mergeSplitPdfsBtn.addEventListener("click", async () => {
    if (splitPdfUrls.length < 2) {
      alert("please split a PDF into at least two parts before merging.");
      return;
    }

    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const url of splitPdfUrls) {
      const pdfBytes = await fetch(url).then((res) => res.arrayBuffer());
      const pdf = await PDFLib.PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    splitPdfResult.innerHTML += `
      <p>Split PDFs merged successfully!</p>
      <a href="${url}" download="merged_split_pdfs.pdf" class="button">download merged split PDFs</a>
    `;
  });

  function parsePageRange(range, pageCount) {
    const ranges = [];
    const parts = range.split(",");

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        const rangeArray = [];
        for (let i = start - 1; i < end && i < pageCount; i++) {
          rangeArray.push(i);
        }
        if (rangeArray.length > 0) {
          ranges.push(rangeArray);
        }
      } else {
        const page = Number(part) - 1;
        if (page < pageCount && page >= 0) {
          ranges.push([page]);
        }
      }
    }

    return ranges;
  }

  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // Image Comparison Logic
  const form = document.getElementById("image-form");
  const imageContainer = document.getElementById("image-container");
  const compareBtn = document.getElementById("compare");
  const downloadBtn = document.getElementById("download");
  let images = [];

  compareBtn.addEventListener("click", (e) => {
    e.preventDefault();
    images = [];

    const imageFiles = document.getElementById("image-files").files;

    if (imageFiles.length < 2) {
      alert("please select at least two images to compare.");
      return;
    }

    Array.from(imageFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.classList.add("image-preview");
        images.push(img);
        if (images.length === imageFiles.length) {
          displayImages();
        }
      };
      reader.readAsDataURL(file);
    });
  });

  function displayImages() {
    imageContainer.innerHTML = "";

    images.forEach((image) => {
      const img = document.createElement("img");
      img.src = image.src;
      img.classList.add("image-preview");
      imageContainer.appendChild(img);
    });

    downloadBtn.style.display = "block";
  }

  downloadBtn.addEventListener("click", () => {
    const imageWidth = 960; // adjust this value to change the image width
    let totalWidth = 0;
    let maxHeight = 0;

    images.forEach((image) => {
      const aspectRatio = image.width / image.height;
      const newHeight = imageWidth / aspectRatio;
      totalWidth += imageWidth;
      maxHeight = Math.max(maxHeight, newHeight);
    });

    const canvas = document.createElement("canvas");
    canvas.width = totalWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext("2d");

    let x = 0;
    images.forEach((image) => {
      const aspectRatio = image.width / image.height;
      const newHeight = imageWidth / aspectRatio;
      const y = (maxHeight - newHeight) / 2;
      ctx.drawImage(image, x, y, imageWidth, newHeight);
      x += imageWidth;
    });

    const dataURL = canvas.toDataURL();
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "combined-image.png";
    a.click();
  });

  // Crop Logic
  const cropForm = document.getElementById("crop-form");
  const cropBtn = document.getElementById("crop-btn");
  const cropResult = document.getElementById("crop-result");
  const cropImage = document.getElementById("crop-image");
  const aspectRatioSelect = document.getElementById("aspect-ratio");
  let cropper;

  document
    .getElementById("image-to-crop")
    .addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          cropImage.src = event.target.result;
          if (cropper) {
            cropper.destroy();
          }
          cropper = new Cropper(cropImage, {
            aspectRatio: getAspectRatio(),
            viewMode: 1,
            minCropBoxWidth: 100,
            minCropBoxHeight: 100,
          });
        };
        reader.readAsDataURL(file);
      }
    });

  aspectRatioSelect.addEventListener("change", () => {
    if (cropper) {
      cropper.setAspectRatio(getAspectRatio());
    }
  });

  function getAspectRatio() {
    const selectedAspectRatio = aspectRatioSelect.value;
    if (selectedAspectRatio === "free") {
      return NaN;
    } else if (selectedAspectRatio === "1") {
      return 1;
    } else {
      const [width, height] = selectedAspectRatio.split("/").map(Number);
      return width / height;
    }
  }

  cropBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      const dataURL = canvas.toDataURL("image/png");

      cropResult.innerHTML = "";

      const resultContainer = document.createElement("div");
      resultContainer.classList.add("result-container");

      const croppedImg = new Image();
      croppedImg.src = dataURL;
      croppedImg.classList.add("image-preview");
      resultContainer.appendChild(croppedImg);

      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("button-container");

      const a = document.createElement("a");
      a.href = dataURL;
      a.download = "cropped-image.png";
      a.className = "button";
      a.innerText = "download cropped image";

      buttonContainer.appendChild(a);
      resultContainer.appendChild(buttonContainer);

      cropResult.appendChild(resultContainer);
    }
  });

  // Image Compression Logic (JPG)
  const compressionFormJPG = document.getElementById("compression-form-jpg");
  const compressBtnJPG = document.getElementById("compress-jpg");
  const compressionResultJPG = document.getElementById(
    "compression-result-jpg",
  );
  const jpgQualitySlider = document.getElementById("jpg-quality-slider");
  const jpgQualityInput = document.getElementById("jpg-quality-input");

  // Sync slider and input
  jpgQualitySlider.addEventListener("input", () => {
    jpgQualityInput.value = jpgQualitySlider.value;
  });

  jpgQualityInput.addEventListener("input", () => {
    let value = parseInt(jpgQualityInput.value);
    if (value < 1) value = 1;
    if (value > 100) value = 100;
    jpgQualityInput.value = value;
    jpgQualitySlider.value = value;
  });

  compressBtnJPG.addEventListener("click", (e) => {
    e.preventDefault();
    const input = document.getElementById("image-to-compress-jpg");
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const quality = parseInt(jpgQualityInput.value) / 100;
          const dataURL = canvas.toDataURL("image/jpeg", quality);
          const compressedImg = new Image();
          compressedImg.src = dataURL;
          compressedImg.classList.add("image-preview");
          compressionResultJPG.innerHTML = "";
          compressionResultJPG.appendChild(compressedImg);

          const a = document.createElement("a");
          a.href = dataURL;
          a.download = "compressed-image.jpg";
          a.className = "button";
          a.innerText = "download compressed image";

          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");
          buttonContainer.appendChild(a);

          compressionResultJPG.innerHTML = "";
          compressionResultJPG.appendChild(compressedImg);
          compressionResultJPG.appendChild(buttonContainer);

          const originalSize = new Blob([reader.result]).size;
          const compressedSize = new Blob([dataURL]).size;
          const compressionRatio = (
            (1 - compressedSize / originalSize) *
            100
          ).toFixed(2);
          const infoText = document.createElement("p");
          infoText.textContent = `Original size: ${(originalSize / 1024).toFixed(2)}KB, Compressed size: ${(compressedSize / 1024).toFixed(2)}KB, Compression ratio: ${compressionRatio}%`;
          compressionResultJPG.appendChild(infoText);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });
  // Image Compression Logic (PNG)
  const compressionFormPNG = document.getElementById("compression-form-png");
  const compressBtnPNG = document.getElementById("compress-png");
  const compressionResultPNG = document.getElementById(
    "compression-result-png",
  );
  const pngResizeFactor = document.getElementById("png-resize-factor");
  const pngResizeInput = document.getElementById("png-resize-input");
  const pngColorQuality = document.getElementById("png-color-quality");

  // Sync slider and input
  pngResizeFactor.addEventListener("input", () => {
    pngResizeInput.value = pngResizeFactor.value;
  });

  pngResizeInput.addEventListener("input", () => {
    let value = parseInt(pngResizeInput.value);
    if (value < 10) value = 10;
    if (value > 100) value = 100;
    pngResizeInput.value = value;
    pngResizeFactor.value = value;
  });

  compressBtnPNG.addEventListener("click", (e) => {
    e.preventDefault();
    const input = document.getElementById("image-to-compress-png");
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const scale = parseInt(pngResizeInput.value) / 100;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const quality = pngColorQuality.value;
          if (quality === "medium") {
            applyColorQuantization(imageData.data, 16);
          } else if (quality === "low") {
            applyColorQuantization(imageData.data, 8);
          }
          ctx.putImageData(imageData, 0, 0);

          const dataURL = canvas.toDataURL("image/png");
          const compressedImg = new Image();
          compressedImg.src = dataURL;
          compressedImg.classList.add("image-preview");
          compressionResultPNG.innerHTML = "";
          compressionResultPNG.appendChild(compressedImg);

          const a = document.createElement("a");
          a.href = dataURL;
          a.download = "compressed-image.png";
          a.className = "button";
          a.innerText = "download compressed image";

          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");
          buttonContainer.appendChild(a);

          compressionResultPNG.innerHTML = "";
          compressionResultPNG.appendChild(compressedImg);
          compressionResultPNG.appendChild(buttonContainer);

          const originalSize = new Blob([reader.result]).size;
          const compressedSize = new Blob([dataURL]).size;
          const compressionRatio = (
            (1 - compressedSize / originalSize) *
            100
          ).toFixed(2);
          const infoText = document.createElement("p");
          infoText.textContent = `Original size: ${(originalSize / 1024).toFixed(2)}KB, Compressed size: ${(compressedSize / 1024).toFixed(2)}KB, Compression ratio: ${compressionRatio}%`;
          compressionResultPNG.appendChild(infoText);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  function applyColorQuantization(data, bits) {
    const factor = 256 / (1 << bits);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.floor(data[i] / factor) * factor;
      data[i + 1] = Math.floor(data[i + 1] / factor) * factor;
      data[i + 2] = Math.floor(data[i + 2] / factor) * factor;
    }
  }

  // Resize Logic
  const resizeForm = document.getElementById("resize-form");
  const resizeBtn = document.getElementById("resize-image");
  const resizeResult = document.getElementById("resize-result");
  const resizePreview = document.getElementById("resize-preview");

  document.getElementById("image-to-resize").addEventListener("change", (e) => {
    const input = e.target;
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.classList.add("image-preview");
        resizePreview.innerHTML = "";
        resizePreview.appendChild(img);
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  resizeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const input = document.getElementById("image-to-resize");
    const widthInput = document.getElementById("resize-width");
    const heightInput = document.getElementById("resize-height");
    const percentageInput = document.getElementById("resize-percentage");

    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const percentage = percentageInput.value / 100;

          if (widthInput.value) {
            width = parseInt(widthInput.value);
            height = (width / img.width) * img.height;
          } else if (heightInput.value) {
            height = parseInt(heightInput.value);
            width = (height / img.height) * img.width;
          } else {
            width *= percentage;
            height *= percentage;
          }

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const dataURL = canvas.toDataURL("image/png");

          const resizeResult = document.getElementById("resize-result");
          resizeResult.innerHTML = "";

          const resultContainer = document.createElement("div");
          resultContainer.classList.add("result-container");

          const resizedImg = new Image();
          resizedImg.src = dataURL;
          resizedImg.classList.add("image-preview");
          resultContainer.appendChild(resizedImg);

          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");

          const a = document.createElement("a");
          a.href = dataURL;
          a.download = "resized-image.png";
          a.className = "button";
          a.innerText = "download resized image";

          buttonContainer.appendChild(a);
          resultContainer.appendChild(buttonContainer);

          resizeResult.appendChild(resultContainer);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  // Flip Logic
  const flipForm = document.getElementById("flip-form");
  const flipResult = document.getElementById("flip-result");
  const flipDirectionSelect = document.getElementById("flip-direction");

  flipDirectionSelect.addEventListener("change", updateFlippedImage);

  document
    .getElementById("image-to-flip")
    .addEventListener("change", updateFlippedImage);

  function updateFlippedImage() {
    const input = document.getElementById("image-to-flip");
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          flipImage(img, flipDirectionSelect.value);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  function flipImage(img, flipDirection) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;

    if (flipDirection === "horizontal") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    } else if (flipDirection === "vertical") {
      ctx.translate(0, canvas.height);
      ctx.scale(1, -1);
    }

    ctx.drawImage(img, 0, 0);

    const flippedDataURL = canvas.toDataURL();
    const flippedImg = new Image();
    flippedImg.src = flippedDataURL;
    flippedImg.classList.add("image-preview");
    flipResult.innerHTML = "";
    flipResult.appendChild(flippedImg);

    const a = document.createElement("a");
    a.href = flippedDataURL;
    a.download = "flipped-image.png";
    a.className = "button";
    a.innerText = "download flipped image";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(a);

    flipResult.appendChild(buttonContainer);
  }

  // Rotate Logic
  const rotateForm = document.getElementById("rotate-form");
  const rotateBtn = document.getElementById("rotate-btn");
  const rotateResult = document.getElementById("rotate-result");
  const rotateAngleInput = document.getElementById("rotate-angle");

  rotateForm.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  rotateAngleInput.addEventListener("input", () => {
    let angle = parseInt(rotateAngleInput.value);
    if (isNaN(angle)) angle = 0;
    if (angle < 0) angle = 0;
    if (angle > 360) angle = 360;
    rotateAngleInput.value = angle;
    updateRotatedImage();
  });

  rotateForm
    .querySelectorAll("button[type='button'][data-rotate]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const angle = parseInt(button.dataset.rotate);
        rotateAngleInput.value = angle;
        updateRotatedImage();
      });
    });

  function updateRotatedImage() {
    const input = document.getElementById("image-to-rotate");
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          rotateImage(img, parseInt(rotateAngleInput.value));
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  function rotateImage(img, rotation) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const radians = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    canvas.width = img.width * cos + img.height * sin;
    canvas.height = img.width * sin + img.height * cos;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    const rotatedDataURL = canvas.toDataURL();
    const rotatedImg = new Image();
    rotatedImg.src = rotatedDataURL;
    rotatedImg.classList.add("image-preview");
    rotateResult.innerHTML = "";
    rotateResult.appendChild(rotatedImg);

    const a = document.createElement("a");
    a.href = rotatedDataURL;
    a.download = "rotated-image.png";
    a.className = "button";
    a.innerText = "download rotated image";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(a);

    rotateResult.appendChild(buttonContainer);
  }

  rotateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    updateRotatedImage();
  });

  document
    .getElementById("image-to-rotate")
    .addEventListener("change", updateRotatedImage);

  // PDF to Word conversion logic
  const pdfToWordForm = document.getElementById("pdf-to-word-form");
  const convertPdfToWordBtn = document.getElementById(
    "convert-pdf-to-word-btn",
  );
  const pdfToWordResult = document.getElementById("pdf-to-word-result");
  const pdfFileInput = document.getElementById("pdf-file-to-word");

  // PDF to Text conversion logic
  const pdfToTextForm = document.getElementById("pdf-to-text-form");
  const extractTextBtn = document.getElementById("extract-text-btn");
  const pdfToTextResult = document.getElementById("pdf-to-text-result");
  const pdfFileInputText = document.getElementById("pdf-file-to-text");

  // Update file input label when file is selected for PDF to Word
  pdfFileInput.addEventListener("change", function () {
    const label = this.closest(".file-input-wrapper").querySelector(
      ".file-input-label",
    );
    if (this.files.length > 0) {
      label.textContent = this.files[0].name;
    } else {
      label.textContent = "no file chosen";
    }
  });

  // Handle conversion button click for PDF to Word
  convertPdfToWordBtn.addEventListener("click", async () => {
    if (!pdfFileInput.files.length) {
      alert("please select a PDF file");
      return;
    }

    const file = pdfFileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    // Show loading message
    pdfToWordResult.innerHTML = `
          <p>converting your PDF to word...</p>
          <p>this may take a few moments depending on the file size.</p>
      `;

    try {
      const response = await fetch("https://api.safzan.tech/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "conversion failed");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".pdf", ".docx");
      a.className = "button";
      a.textContent = "download word document";

      // Clear previous result and add download button
      pdfToWordResult.innerHTML = "<p>conversion successful!</p>";
      pdfToWordResult.appendChild(a);

      // Add event listener to clean up the URL object after download
      a.addEventListener("click", () => {
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      });
    } catch (error) {
      pdfToWordResult.innerHTML = `
              <p style="color: red;">Error: ${error.message}</p>
              <p>please try again or contact safzan directly. :'(</p>
          `;
    }
  });

  // Update file input label when file is selected for PDF to Text
  pdfFileInputText.addEventListener("change", function () {
    const label = this.closest(".file-input-wrapper").querySelector(
      ".file-input-label",
    );
    if (this.files.length > 0) {
      label.textContent = this.files[0].name;
    } else {
      label.textContent = "no file chosen";
    }
  });

  // Handle extraction button click for PDF to Text
  extractTextBtn.addEventListener("click", async () => {
    if (!pdfFileInputText.files.length) {
      alert("please select a PDF file");
      return;
    }

    const file = pdfFileInputText.files[0];
    const formData = new FormData();
    formData.append("file", file);

    // Show loading message
    pdfToTextResult.innerHTML = `
          <p>extracting text from your PDF...</p>
          <p>this may take a few moments depending on the file size.</p>
      `;

    try {
      const response = await fetch("https://api.safzan.tech/extract_text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "extraction failed");
      }

      // Get the text from the response
      const data = await response.json();
      const text = data.text;

      // Display the extracted text
      pdfToTextResult.innerHTML = `
          <p>extraction successful!</p>
          <textarea readonly>${text}</textarea>
      `;
    } catch (error) {
      pdfToTextResult.innerHTML = `
              <p style="color: red;">Error: ${error.message}</p>
              <p>please try again or contact safzan directly. :'(</p>
          `;
    }
  });

  // Add drag and drop functionality for PDF files for PDF to Word
  const pdfDropZoneWord = pdfFileInput.closest(".file-input-wrapper");

  pdfDropZoneWord.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pdfDropZoneWord.classList.add("dragover");
  });

  pdfDropZoneWord.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pdfDropZoneWord.classList.remove("dragover");
  });

  pdfDropZoneWord.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pdfDropZoneWord.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length) {
      if (files[0].type === "application/pdf") {
        pdfFileInput.files = files;
        const label = pdfDropZoneWord.querySelector(".file-input-label");
        label.textContent = files[0].name;
      } else {
        alert("please drop a PDF file");
      }
    }
  });

  // Add drag and drop functionality for PDF files for PDF to Text
  const pdfDropZoneText = pdfFileInputText.closest(".file-input-wrapper");

  pdfDropZoneText.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pdfDropZoneText.classList.add("dragover");
  });

  pdfDropZoneText.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pdfDropZoneText.classList.remove("dragover");
  });

  pdfDropZoneText.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    pdfDropZoneText.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length) {
      if (files[0].type === "application/pdf") {
        pdfFileInputText.files = files;
        const label = pdfDropZoneText.querySelector(".file-input-label");
        label.textContent = files[0].name;
      } else {
        alert("please drop a PDF file");
      }
    }
  });

  // Color Adjustment Logic
  const colorAdjustmentForm = document.getElementById("color-adjustment-form");
  const adjustColorsBtn = document.getElementById("adjust-colors-btn");
  const colorAdjustmentResult = document.getElementById(
    "color-adjustment-result",
  );
  const brightnessSlider = document.getElementById("brightness-slider");
  const contrastSlider = document.getElementById("contrast-slider");
  const saturationSlider = document.getElementById("saturation-slider");
  const hueSlider = document.getElementById("hue-slider");

  brightnessSlider.addEventListener("input", () => {
    document.getElementById("brightness-value").innerText =
      brightnessSlider.value;
  });
  contrastSlider.addEventListener("input", () => {
    document.getElementById("contrast-value").innerText = contrastSlider.value;
  });
  saturationSlider.addEventListener("input", () => {
    document.getElementById("saturation-value").innerText =
      saturationSlider.value;
  });
  hueSlider.addEventListener("input", () => {
    document.getElementById("hue-value").innerText = hueSlider.value;
  });

  adjustColorsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const input = document.getElementById("image-to-adjust");
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

          for (let i = 0; i < pixels.data.length; i += 4) {
            let r = pixels.data[i];
            let g = pixels.data[i + 1];
            let b = pixels.data[i + 2];

            const hue = parseInt(hueSlider.value);
            const hsl = rgbToHsl(r, g, b);
            hsl[0] += hue / 360;
            if (hsl[0] > 1) hsl[0] -= 1;
            const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
            r = rgb[0];
            g = rgb[1];
            b = rgb[2];

            const brightness = parseInt(brightnessSlider.value);
            r = Math.max(0, Math.min(255, r + brightness));
            g = Math.max(0, Math.min(255, g + brightness));
            b = Math.max(0, Math.min(255, b + brightness));

            const contrast = parseInt(contrastSlider.value);
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
            g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
            b = Math.max(0, Math.min(255, factor * (b - 128) + 128));

            const saturation = parseInt(saturationSlider.value);
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            if (delta !== 0) {
              const lightness = (max + min) / 2;
              const s =
                lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
              const newS = s + saturation / 100;
              const newMax = lightness + newS * (1 - lightness);
              const newMin = lightness - newS * lightness;
              r = Math.max(
                0,
                Math.min(255, ((r - min) / delta) * (newMax - newMin) + newMin),
              );
              g = Math.max(
                0,
                Math.min(255, ((g - min) / delta) * (newMax - newMin) + newMin),
              );
              b = Math.max(
                0,
                Math.min(255, ((b - min) / delta) * (newMax - newMin) + newMin),
              );
            }

            pixels.data[i] = r;
            pixels.data[i + 1] = g;
            pixels.data[i + 2] = b;
          }

          ctx.putImageData(pixels, 0, 0);

          const adjustedDataURL = canvas.toDataURL();
          const adjustedImg = new Image();
          adjustedImg.src = adjustedDataURL;
          adjustedImg.classList.add("image-preview");
          colorAdjustmentResult.innerHTML = "";
          colorAdjustmentResult.appendChild(adjustedImg);

          const a = document.createElement("a");
          a.href = adjustedDataURL;
          a.download = "adjusted-image.png";
          a.className = "button";
          a.innerText = "download adjusted image";

          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");
          buttonContainer.appendChild(a);

          colorAdjustmentResult.appendChild(buttonContainer);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h, s, l;
    if (delta === 0) {
      h = 0;
    } else if (max === r) {
      h = (g - b) / delta;
    } else if (max === g) {
      h = 2 + (b - r) / delta;
    } else {
      h = 4 + (r - g) / delta;
    }
    h *= 60;
    if (h < 0) h += 360;
    l = (max + min) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    return [h / 360, s, l];
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
    return p;
  }

  // Color Curves Logic
  const colorCurvesForm = document.getElementById("color-curves-form");
  const curvesCanvas = document.getElementById("curves-canvas");
  const ctx = curvesCanvas.getContext("2d");
  const curveType = document.getElementById("curve-type");
  const applyCurvesBtn = document.getElementById("apply-curves");
  const resetCurvesBtn = document.getElementById("reset-curves");
  const curvesResult = document.getElementById("curves-result");

  let points = [
    [0, 0],
    [255, 255],
  ];
  let isDragging = false;
  let dragIndex = -1;

  function drawCurve() {
    ctx.clearRect(0, 0, 256, 256);
    ctx.beginPath();
    ctx.moveTo(0, 255);

    for (let i = 0; i < points.length; i++) {
      ctx.lineTo(points[i][0], 255 - points[i][1]);
    }

    ctx.lineTo(255, 0);
    ctx.strokeStyle = "#000";
    ctx.stroke();

    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point[0], 255 - point[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = "#f00";
      ctx.fill();
    });
  }

  curvesCanvas.addEventListener("mousedown", (e) => {
    const rect = curvesCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = 255 - (e.clientY - rect.top);

    for (let i = 0; i < points.length; i++) {
      if (Math.abs(points[i][0] - x) < 5 && Math.abs(points[i][1] - y) < 5) {
        isDragging = true;
        dragIndex = i;
        return;
      }
    }

    points.push([x, y]);
    points.sort((a, b) => a[0] - b[0]);
    drawCurve();
  });

  curvesCanvas.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const rect = curvesCanvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(255, e.clientX - rect.left));
    const y = Math.max(0, Math.min(255, 255 - (e.clientY - rect.top)));

    points[dragIndex] = [x, y];
    drawCurve();
  });

  curvesCanvas.addEventListener("mouseup", () => {
    isDragging = false;
    dragIndex = -1;
  });

  resetCurvesBtn.addEventListener("click", () => {
    points = [
      [0, 0],
      [255, 255],
    ];
    drawCurve();
  });

  applyCurvesBtn.addEventListener("click", () => {
    const input = document.getElementById("image-for-curves");
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          const lookupTable = new Uint8Array(256);
          for (let i = 0; i < 256; i++) {
            let j = 0;
            while (j < points.length - 1 && points[j + 1][0] < i) j++;
            const t = (i - points[j][0]) / (points[j + 1][0] - points[j][0]);
            lookupTable[i] = Math.round(
              (1 - t) * points[j][1] + t * points[j + 1][1],
            );
          }

          for (let i = 0; i < data.length; i += 4) {
            if (curveType.value === "rgb" || curveType.value === "r") {
              data[i] = lookupTable[data[i]];
            }
            if (curveType.value === "rgb" || curveType.value === "g") {
              data[i + 1] = lookupTable[data[i + 1]];
            }
            if (curveType.value === "rgb" || curveType.value === "b") {
              data[i + 2] = lookupTable[data[i + 2]];
            }
          }

          ctx.putImageData(imageData, 0, 0);

          const adjustedDataURL = canvas.toDataURL();
          const adjustedImg = new Image();
          adjustedImg.src = adjustedDataURL;
          adjustedImg.classList.add("image-preview");
          curvesResult.innerHTML = "";
          curvesResult.appendChild(adjustedImg);

          const a = document.createElement("a");
          a.href = adjustedDataURL;
          a.download = "curves-adjusted-image.png";
          a.className = "button";
          a.innerText = "download adjusted image";

          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");
          buttonContainer.appendChild(a);

          curvesResult.appendChild(buttonContainer);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  drawCurve();

  document.getElementById("image-for-curves").addEventListener("change", () => {
    points = [
      [0, 0],
      [255, 255],
    ];
    drawCurve();
  });

  // Metadata Logic
  const metadataForm = document.getElementById("metadata-form");
  const metadataDisplay = document.getElementById("metadata-display");
  const metadataEdit = document.getElementById("metadata-edit");
  const metadataEditForm = document.getElementById("metadata-edit-form");
  const saveMetadataBtn = document.getElementById("save-metadata");

  document
    .getElementById("image-for-metadata")
    .addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        EXIF.getData(file, function () {
          const allMetadata = EXIF.getAllTags(this);
          displayMetadata(allMetadata);
        });
      }
    });

  function displayMetadata(metadata) {
    metadataDisplay.innerHTML = "<h2>Image Metadata</h2>";
    metadataEditForm.innerHTML = "";

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value !== "object" && value !== undefined) {
        metadataDisplay.innerHTML += `<p><strong>${key}:</strong> ${value}</p>`;

        if (
          ["Make", "Model", "DateTimeOriginal", "Copyright", "Artist"].includes(
            key,
          )
        ) {
          const input = document.createElement("input");
          input.type = "text";
          input.id = `edit-${key}`;
          input.value = value;
          const label = document.createElement("label");
          label.htmlFor = `edit-${key}`;
          label.textContent = key;
          metadataEditForm.appendChild(label);
          metadataEditForm.appendChild(input);
          metadataEditForm.appendChild(document.createElement("br"));
        }
      }
    }

    metadataEdit.style.display = "block";
  }

  saveMetadataBtn.addEventListener("click", () => {
    let updatedMetadata = {};
    metadataEditForm.querySelectorAll("input").forEach((input) => {
      updatedMetadata[input.id.replace("edit-", "")] = input.value;
    });

    alert(
      "Metadata would be updated with these values:\n" +
        JSON.stringify(updatedMetadata, null, 2),
    );
  });

  document.getElementsByTagName("form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  });
});
