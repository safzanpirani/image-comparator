document.addEventListener("DOMContentLoaded", () => {
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");

  tabLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const tabName = event.currentTarget.getAttribute("data-tab");
      if (tabName === "compression-video") {
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank"); // Example: Opens a new tab
      } else {
        openTab(event, tabName);
      }
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

  // Open the image comparison tab by default
  const defaultTab = document.querySelector('[data-tab="comparison"]');
  if (defaultTab) {
    openTab({ currentTarget: defaultTab }, "comparison");
  }

  // Automatically open the first tab
  if (tabLinks.length > 0) {
    tabLinks[0].click();
  }

  // Image Comparison Logic
  const form = document.getElementById("image-form");
  const imageContainer = document.getElementById("image-container");
  const addImageBtn = document.getElementById("add-image");
  const compareBtn = document.getElementById("compare");
  const downloadBtn = document.getElementById("download");
  let images = [];
  let imageInputs = [];

  addImageBtn.addEventListener("click", () => {
    const newInput = document.createElement("input");
    newInput.type = "file";
    newInput.accept = "image/*";
    form.insertBefore(newInput, compareBtn);
    imageInputs.push(newInput);
  });

  compareBtn.addEventListener("click", (e) => {
    e.preventDefault();
    images = [];

    imageInputs = document.querySelectorAll('#image-form input[type="file"]');

    imageInputs.forEach((input) => {
      if (input.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.classList.add("image-preview");
          images.push(img);
          if (images.length === imageInputs.length) {
            displayImages();
          }
        };
        reader.readAsDataURL(input.files[0]);
      }
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
  const aspectRatioSelect = document.getElementById("aspect-ratio");
  const cropForm = document.getElementById("crop-form");
  const cropBtn = document.getElementById("crop-btn");
  const cropResult = document.getElementById("crop-result");
  const cropImage = document.getElementById("crop-image");
  let cropper;

  aspectRatioSelect.addEventListener("change", () => {
    if (cropper) {
      const selectedAspectRatio = aspectRatioSelect.value;
      if (selectedAspectRatio === "free") {
        cropper.setAspectRatio(NaN);
      } else if (selectedAspectRatio === "1") {
        cropper.setAspectRatio(1);
      } else {
        const [width, height] = selectedAspectRatio.split("/").map(Number);
        cropper.setAspectRatio(width / height);
      }
    }
  });

  cropForm.addEventListener("change", (e) => {
    const input = e.target;
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        cropImage.src = reader.result;
        if (cropper) {
          cropper.destroy();
        }
        const selectedAspectRatio = aspectRatioSelect.value;
        let aspectRatio;
        if (selectedAspectRatio === "free") {
          aspectRatio = NaN;
        } else if (selectedAspectRatio === "1") {
          aspectRatio = 1;
        } else {
          const [width, height] = selectedAspectRatio.split("/").map(Number);
          aspectRatio = width / height;
        }
        cropper = new Cropper(cropImage, {
          aspectRatio: aspectRatio,
          crop: (event) => {
            console.log(
              event.detail.x,
              event.detail.y,
              event.detail.width,
              event.detail.height,
            );
          },
        });
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  cropBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      const dataURL = canvas.toDataURL("image/png");

      const cropResult = document.getElementById("crop-result");
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
          const dataURL = canvas.toDataURL("image/jpeg", 0.7); // adjust compression quality here
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

          // Wrap the button in a container div
          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");
          buttonContainer.appendChild(a);

          // Append the container to the result div
          compressionResultJPG.innerHTML = "";
          compressionResultJPG.appendChild(compressedImg);
          compressionResultJPG.appendChild(buttonContainer);
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
          // Reduce the dimensions of the image
          const scale = 0.7; // adjust the scale factor as needed
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL("image/png"); // adjust compression quality here
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

          // Wrap the button in a container div
          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");
          buttonContainer.appendChild(a);

          // Append the container to the result div
          compressionResultPNG.innerHTML = "";
          compressionResultPNG.appendChild(compressedImg);
          compressionResultPNG.appendChild(buttonContainer);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

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
          const dataURL = canvas.toDataURL("image/png"); // Output resized image as PNG

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

  const flipForm = document.getElementById("flip-form");
  const flipBtn = document.getElementById("flip-btn");
  const flipResult = document.getElementById("flip-result");
  const flipDirectionSelect = document.getElementById("flip-direction");

  flipBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const input = document.getElementById("image-to-flip");
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
          const flipDirection = flipDirectionSelect.value;
          if (flipDirection === "horizontal") {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0);
          } else if (flipDirection === "vertical") {
            ctx.translate(0, canvas.height);
            ctx.scale(1, -1);
            ctx.drawImage(img, 0, 0);
          }
          const flippedDataURL = canvas.toDataURL();

          const flipResult = document.getElementById("flip-result");
          flipResult.innerHTML = "";

          const resultContainer = document.createElement("div");
          resultContainer.classList.add("result-container");

          const flippedImg = new Image();
          flippedImg.src = flippedDataURL;
          flippedImg.classList.add("image-preview");
          resultContainer.appendChild(flippedImg);

          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");

          const a = document.createElement("a");
          a.href = flippedDataURL;
          a.download = "flipped-image.png";
          a.className = "button";
          a.innerText = "download flipped image";

          buttonContainer.appendChild(a);
          resultContainer.appendChild(buttonContainer);

          flipResult.appendChild(resultContainer);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  // Rotate Logic
  const rotateForm = document.getElementById("rotate-form");
  const rotateBtn = document.getElementById("rotate-btn");
  const rotateResult = document.getElementById("rotate-result");
  const rotateSlider = document.getElementById("rotate-slider");
  const rotateAngleInput = document.getElementById("rotate-angle");
  const rotateValue = document.getElementById("rotate-value");

  // Prevent form submission for image rotation
  rotateForm.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  // Event listener for slider
  rotateSlider.addEventListener("input", () => {
    const angle = parseInt(rotateSlider.value);
    rotateValue.textContent = `${angle}°`;
    rotateAngleInput.value = angle;
  });

  // Event listener for angle input
  rotateAngleInput.addEventListener("input", () => {
    const angle = parseInt(rotateAngleInput.value);
    // Keep angle value within 0-360 range
    if (angle < 0) {
      rotateAngleInput.value = 0;
    } else if (angle > 360) {
      rotateAngleInput.value = 360;
    }
    rotateSlider.value = rotateAngleInput.value;
    rotateValue.textContent = `${rotateAngleInput.value}°`;
  });

  // Event listeners for preset buttons
  rotateForm.querySelectorAll("button[data-rotate]").forEach((button) => {
    button.addEventListener("click", () => {
      rotateSlider.value = parseInt(button.dataset.rotate);
      rotateValue.textContent = `${rotateSlider.value}°`;
      rotateAngleInput.value = rotateSlider.value; // Update the angle input field as well
    });
  });

  rotateBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const input = document.getElementById("image-to-rotate");
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const rotation = parseInt(rotateAngleInput.value);

          // Calculate canvas dimensions to accommodate rotated image
          const radians = (rotation * Math.PI) / 180;
          const sin = Math.abs(Math.sin(radians));
          const cos = Math.abs(Math.cos(radians));
          canvas.width = img.width * cos + img.height * sin;
          canvas.height = img.width * sin + img.height * cos;

          // Rotate around the center
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

          // Wrap the button in a container div
          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");
          buttonContainer.appendChild(a);

          // Append the container to the result div
          rotateResult.innerHTML = "";
          rotateResult.appendChild(rotatedImg);
          rotateResult.appendChild(buttonContainer);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  // Image Color Adjustment Logic
  const colorAdjustmentForm = document.getElementById("color-adjustment-form");
  const adjustColorsBtn = document.getElementById("adjust-colors-btn");
  const colorAdjustmentResult = document.getElementById(
    "color-adjustment-result",
  );
  const brightnessSlider = document.getElementById("brightness-slider");
  const contrastSlider = document.getElementById("contrast-slider");
  const saturationSlider = document.getElementById("saturation-slider");
  const hueSlider = document.getElementById("hue-slider");

  // Update value labels
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

          // Get pixel data
          const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Apply color adjustments
          for (let i = 0; i < pixels.data.length; i += 4) {
            let r = pixels.data[i];
            let g = pixels.data[i + 1];
            let b = pixels.data[i + 2];

            // Hue
            const hue = parseInt(hueSlider.value);
            const hsl = rgbToHsl(r, g, b);
            hsl[0] += hue / 360;
            if (hsl[0] > 1) hsl[0] -= 1;
            const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
            r = rgb[0];
            g = rgb[1];
            b = rgb[2];

            // Brightness
            const brightness = parseInt(brightnessSlider.value);
            r = Math.max(0, Math.min(255, r + brightness));
            g = Math.max(0, Math.min(255, g + brightness));
            b = Math.max(0, Math.min(255, b + brightness));

            // Contrast
            const contrast = parseInt(contrastSlider.value);
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
            g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
            b = Math.max(0, Math.min(255, factor * (b - 128) + 128));

            // Saturation
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

          // Put pixel data back
          ctx.putImageData(pixels, 0, 0);

          // Display adjusted image
          const adjustedDataURL = canvas.toDataURL();
          const adjustedImg = new Image();
          adjustedImg.src = adjustedDataURL;
          adjustedImg.classList.add("image-preview");
          colorAdjustmentResult.innerHTML = "";
          colorAdjustmentResult.appendChild(adjustedImg);

          // Add download link
          const a = document.createElement("a");
          a.href = adjustedDataURL;
          a.download = "adjusted-image.png";
          a.className = "button";
          a.innerText = "download adjusted image";

          // Wrap the button in a container div
          const buttonContainer = document.createElement("div");
          buttonContainer.classList.add("button-container");
          buttonContainer.appendChild(a);

          // Append the container to the result div
          colorAdjustmentResult.innerHTML = "";
          colorAdjustmentResult.appendChild(adjustedImg);
          colorAdjustmentResult.appendChild(buttonContainer);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  // Helper functions for color conversion
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
});
