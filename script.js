// Remove the redundant import and require statement
// import Cropper from 'cropperjs'; // Remove this if using direct script inclusion

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

  // Automatically open the first tab
  if (tabLinks.length > 0) {
    tabLinks[0].click();
  }


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

  // Crop Logic
  const aspectRatioSelect = document.getElementById('aspect-ratio');
  const cropForm = document.getElementById('crop-form');
  const cropBtn = document.getElementById('crop-btn');
  const cropResult = document.getElementById('crop-result');
  const cropImage = document.getElementById('crop-image');
  let cropper;

  aspectRatioSelect.addEventListener('change', () => {
    if (cropper) {
      const selectedAspectRatio = aspectRatioSelect.value;
      if (selectedAspectRatio === 'free') {
        cropper.setAspectRatio(NaN);
      } else if (selectedAspectRatio === '1') {
        cropper.setAspectRatio(1);
      } else {
        const [width, height] = selectedAspectRatio.split('/').map(Number);
        cropper.setAspectRatio(width / height);
      }
    }
  });

  cropForm.addEventListener('change', (e) => {
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
        if (selectedAspectRatio === 'free') {
          aspectRatio = NaN;
        } else if (selectedAspectRatio === '1') {
          aspectRatio = 1;
        } else {
          const [width, height] = selectedAspectRatio.split('/').map(Number);
          aspectRatio = width / height;
        }
        cropper = new Cropper(cropImage, {
          aspectRatio: aspectRatio,
          crop: (event) => {
            console.log(event.detail.x, event.detail.y, event.detail.width, event.detail.height);
          },
        });
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  cropBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (cropper) {
      const canvas = cropper.getCroppedCanvas();
      const dataURL = canvas.toDataURL('image/png');
      const croppedImg = new Image();
      croppedImg.src = dataURL;
      croppedImg.classList.add('image-preview');
      cropResult.innerHTML = '';
      cropResult.appendChild(croppedImg);

      const a = document.createElement('a');
      a.href = dataURL;
      a.download = 'cropped-image.png';
      a.className = 'button';
      a.innerText = 'Download Cropped Image';
      cropResult.appendChild(a);
    }
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
          const dataURL = canvas.toDataURL('image/jpeg', 0.7); // adjust compression quality here
          const compressedImg = new Image();
          compressedImg.src = dataURL;
          compressedImg.classList.add('image-preview');
          compressionResultJPG.innerHTML = '';
          compressionResultJPG.appendChild(compressedImg);

          const a = document.createElement('a');
          a.href = dataURL;
          a.download = 'compressed-image.jpg';
          a.className = 'button';
          a.innerText = 'download compressed image';
          compressionResultJPG.appendChild(a);
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
          a.innerText = 'download compressed image';
          compressionResultPNG.appendChild(a);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  // Resize Logic
  const resizeForm = document.getElementById('resize-form');
  const resizeBtn = document.getElementById('resize-image');
  const resizeResult = document.getElementById('resize-result');
  const resizePreview = document.getElementById('resize-preview');

  document.getElementById('image-to-resize').addEventListener('change', (e) => {
    const input = e.target;
    if (input.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.classList.add('image-preview');
        resizePreview.innerHTML = '';
        resizePreview.appendChild(img);
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

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
          a.innerText = 'download resized image';
          resizeResult.appendChild(a);
        };
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  const flipForm = document.getElementById('flip-form');
const flipBtn = document.getElementById('flip-btn');
const flipResult = document.getElementById('flip-result');
const flipDirectionSelect = document.getElementById('flip-direction');

flipBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const input = document.getElementById('image-to-flip');
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
        ctx.drawImage(img, 0, 0);
        const flipDirection = flipDirectionSelect.value;
        if (flipDirection === 'horizontal') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0);
        } else if (flipDirection === 'vertical') {
          ctx.translate(0, canvas.height);
          ctx.scale(1, -1);
          ctx.drawImage(img, 0, 0);
        }
        const flippedDataURL = canvas.toDataURL();
        const flippedImg = new Image();
        flippedImg.src = flippedDataURL;
        flippedImg.classList.add('image-preview');
        flipResult.innerHTML = '';
        flipResult.appendChild(flippedImg);

        const a = document.createElement('a');
        a.href = flippedDataURL;
        a.download = 'flipped-image.png';
        a.className = 'button';
        a.innerText = 'download flipped image';
        flipResult.appendChild(a);
      };
    };
    reader.readAsDataURL(input.files[0]);

    document.addEventListener('DOMContentLoaded', async () => {
      const { createFFmpeg, fetchFile } = FFmpeg;
      const ffmpeg = createFFmpeg({ log: true });

      try {
        // Load ffmpeg.wasm
        console.log('Loading ffmpeg...');
        await ffmpeg.load();
        console.log('ffmpeg loaded successfully.');

        // Video Compression Logic
        const compressBtnVideo = document.getElementById('compress-video');
        const compressionResultVideo = document.getElementById('compression-result-video');

        compressBtnVideo.addEventListener('click', async (e) => {
          e.preventDefault();
          const input = document.getElementById('video-to-compress');
          const quality = document.getElementById('video-quality').value;

          if (input.files.length > 0) {
            const videoFile = input.files[0];
            const videoName = 'input.mp4';

            console.log('Starting compression...');

            // Read the video file
            ffmpeg.FS('writeFile', videoName, await fetchFile(videoFile));

            // Compress the video
            await ffmpeg.run('-i', videoName, '-vcodec', 'libx264', '-crf', quality, 'output.mp4');

            // Get the compressed video
            const data = ffmpeg.FS('readFile', 'output.mp4');
            const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
            const videoURL = URL.createObjectURL(videoBlob);

            console.log('Compression complete.');

            // Display the compressed video and provide a download link
            const videoElement = document.createElement('video');
            videoElement.src = videoURL;
            videoElement.controls = true;
            videoElement.classList.add('image-preview');

            compressionResultVideo.innerHTML = '';
            compressionResultVideo.appendChild(videoElement);

            const downloadLink = document.createElement('a');
            downloadLink.href = videoURL;
            downloadLink.download = 'compressed-video.mp4';
            downloadLink.className = 'button';
            downloadLink.innerText = 'Download Compressed Video';
            compressionResultVideo.appendChild(downloadLink);
          } else {
            console.error('No video file selected.');
          }
        });
      } catch (error) {
        console.error('An error occurred:', error);
      }
    });

  }
});


});
