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
    form.appendChild(newInput);
    imageInputs.push(newInput);
  });

  compareBtn.addEventListener('click', (e) => {
    e.preventDefault();
    images = [];

    imageInputs = document.querySelectorAll('input[type="file"]');

    imageInputs.forEach((input) => {
      if (input.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
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
      imageContainer.appendChild(img);
    });

    downloadBtn.style.display = 'block';
  }

  downloadBtn.addEventListener('click', () => {
    const imageWidth = 400; // adjust this value to change the image width
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

  const compressionForm = document.getElementById('compression-form');
  const compressBtn = document.getElementById('compress');
  const compressionResult = document.getElementById('compression-result');

  compressBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const input = document.getElementById('image-to-compress');
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
          compressionResult.innerHTML = '';
          compressionResult.appendChild(compressedImg);

          const a = document.createElement('a');
          a.href = dataURL;
          a.download = 'compressed-image.jpg';
          compressionResult.appendChild(a);
          a.innerText = 'Download Compressed Image';
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });
});
