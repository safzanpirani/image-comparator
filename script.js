const form = document.getElementById('image-form');
const imageContainer = document.getElementById('image-container');
const addImageBtn = document.getElementById('add-image');
const compareBtn = document.getElementById('compare');

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

  const canvas = document.createElement('canvas');
  canvas.width = imageWidth * images.length;
  canvas.height = imageWidth / (images[0].width / images[0].height);

  const ctx = canvas.getContext('2d');

  images.forEach((image, index) => {
    ctx.drawImage(image, index * imageWidth, 0, imageWidth, canvas.height);
  });

  const output = document.createElement('img');
  output.src = canvas.toDataURL();
  imageContainer.appendChild(output);
}