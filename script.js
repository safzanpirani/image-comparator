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
  const imageWidth = 400; // adjust this value to change the image width

  images.forEach((image, index) => {
    const img = document.createElement('img');
    img.src = image.src;
    img.width = imageWidth;
    img.style.float = 'left'; // add this line to float the images to the left
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