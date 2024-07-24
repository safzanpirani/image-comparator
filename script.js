document.addEventListener('DOMContentLoaded', () => {
  const tabLinks = document.querySelectorAll('.tab-link');
  const tabContents = document.querySelectorAll('.tab-content');

  tabLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const tabName = event.currentTarget.getAttribute('data-tab');
      openTab(event, tabName);
    });
  });

  function openTab(evt, tabName) {
    tabContents.forEach(content => {
      content.classList.remove('active');
    });
    tabLinks.forEach(link => {
      link.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
  }

  tabLinks[0].click(); // Open the first tab by default

  // Image Comparison Logic
  const form = document.getElementById('image-form');
  const imageContainer = document.getElementById('image-container');
  const addImageBtn = document.getElementById('add-image');
  const compareBtn = document.getElementById('compare');
  const downloadBtn = document.getElementById('download');

  let images = [];
  let imageInputs = [];

  addImageBtn.addEventListener('click', () => {
    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.accept = 'image/*';
    form.insertBefore(newInput, compareBtn);
    imageInputs.push(newInput);
  });

  compareBtn.addEventListener('click', (e) => {
    e.preventDefault();
    images = [];

    imageInputs = document.querySelectorAll('#image-form input[type="file"]');

    imageInputs.forEach((input) => {
      if (input.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.classList.add('image-preview');
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
    imageContainer.innerHTML = '';

    images.forEach((image) => {
      const img = document.createElement('img');
      img.src = image.src;
      img.classList.add('image-preview');
      imageContainer.appendChild(img);
    });

    downloadBtn.style.display = 'block';
  }

  downloadBtn.addEventListener('click', () => {
    const imageWidth = 960; // adjust this value to change the image width
    let totalWidth = 0;
    let maxHeight = 0;

    images.forEach((image) => {
      const aspectRatio = image.width / image.height;
      const newHeight = imageWidth / aspectRatio;
      totalWidth += imageWidth;
      maxHeight = Math.max(maxHeight, newHeight);
    });

    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = maxHeight;
    const ctx = canvas.getContext('2d');

    let x = 0;
    images.forEach((image) => {
      const aspectRatio = image.width / image.height;
      const newHeight = imageWidth / aspectRatio;
      const y = (maxHeight - newHeight) / 2;
      ctx.drawImage(image, x, y, imageWidth, newHeight);
      x += imageWidth;
    });

    const dataURL = canvas.toDataURL();
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'combined-image.png';
    a.click();
  });

  // Image Compression Logic (JPG)
  const compressionFormJPG = document.getElementById('compression-form-jpg');
  const compressBtnJPG = document.getElementById('compress-jpg');
  const compressionResultJPG = document.getElementById('compression-result-jpg');

  compressBtnJPG.addEventListener('click', (e) => {
    e.preventDefault();
    const input = document.getElementById('image-to-compress-jpg');
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const dataURL = canvas.toDataURL('image/jpeg', 0.5); // adjust compression quality here
          const compressedImg = new Image();
          compressedImg.src = dataURL;
          compressedImg.classList.add('image-preview');
          compressionResultJPG.innerHTML = '';
          compressionResultJPG.appendChild(compressedImg);

          const a = document.createElement('a');
          a.href = dataURL;
          a.download = 'compressed-image.jpg';
          a.className = 'button';
          a.innerText = 'Download Compressed Image';
          compressionResultJPG.appendChild(a);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

const resizeForm = document.getElementById('resize-form');
const resizeBtn = document.getElementById('resize-image');
const resizeResult = document.getElementById('resize-result');

resizeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const input = document.getElementById('image-to-resize');
  const widthInput = document.getElementById('resize-width');
  const heightInput = document.getElementById('resize-height');
  const percentageInput = document.getElementById('resize-percentage');
  
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
          height = width / img.width * img.height;
        } else if (heightInput.value) {
          height = parseInt(heightInput.value);
          width = height / img.height * img.width;
        } else {
          width *= percentage;
          height *= percentage;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const dataURL = canvas.toDataURL('image/png'); // Output resized image as PNG
        const resizedImg = new Image();
        resizedImg.src = dataURL;
        resizedImg.classList.add('image-preview');
        resizeResult.innerHTML = '';
        resizeResult.appendChild(resizedImg);

        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'resized-image.png';
        a.className = 'button';
        a.innerText = 'Download Resized Image';
        resizeResult.appendChild(a);
      };
    };
    reader.readAsDataURL(input.files[0]);
  }
});

  // Image Compression Logic (PNG)
  const compressionFormPNG = document.getElementById('compression-form-png');
  const compressBtnPNG = document.getElementById('compress-png');
  const compressionResultPNG = document.getElementById('compression-result-png');

  compressBtnPNG.addEventListener('click', (e) => {
    e.preventDefault();
    const input = document.getElementById('image-to-compress-png');
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          // Reduce the dimensions of the image
          const scale = 0.7; // adjust the scale factor as needed
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL('image/png'); // adjust compression quality here
          const compressedImg = new Image();
          compressedImg.src = dataURL;
          compressedImg.classList.add('image-preview');
          compressionResultPNG.innerHTML = '';
          compressionResultPNG.appendChild(compressedImg);

          const a = document.createElement('a');
          a.href = dataURL;
          a.download = 'compressed-image.png';
          a.className = 'button';
          a.innerText = 'Download Compressed Image';
          compressionResultPNG.appendChild(a);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });
});
