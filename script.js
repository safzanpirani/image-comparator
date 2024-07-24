const form = document.getElementById('image-form');
const imageContainer = document.getElementById('image-container');
const addImageBtn = document.getElementById('add-image');
const compareBtn = document.getElementById('compare');

let images = [];

addImageBtn.addEventListener('click', () => {
  const newInput = document.createElement('input');
  newInput.type = 'file';
  newInput.accept = 'image/*';
  form.appendChild(newInput);
});

compareBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const imageInputs = document.querySelectorAll('input[type="file"]');
  images = [];

  imageInputs.forEach((input) => {
    if (input.files.length > 0) {
      images.push(input.files[0]);
    }
  });

  if (images.length < 2) {
    alert('Please select at least two images');
    return;
  }

  const imageWidth = 400; // adjust this value to change the image width
  const imageHeight = imageWidth / (images[0].width / images[0].height);

  const canvas = document.createElement('canvas');
  canvas.width = imageWidth * images.length;
  canvas.height = imageHeight;

  const ctx = canvas.getContext('2d');

  images.forEach((image, index) => {
    ctx.drawImage(image, index * imageWidth, 0, imageWidth, imageHeight);
  });

  const output = document.createElement('img');
  output.src = canvas.toDataURL();
  imageContainer.innerHTML = '';
  imageContainer.appendChild(output);
});