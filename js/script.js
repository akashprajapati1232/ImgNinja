  // Initialize UI elements when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
  });

  function initializeUI() {
    // Initialize settings tabs
    initializeSettingsTabs();

    // Initialize slider fill
    updateSliderFill();

    // Initialize drag and drop
    initializeDragAndDrop();

    // Initialize comparison toggle
    initializeComparisonToggle();
  }

  // Toggle mobile menu
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelector('.nav-links');

  mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navLinks.classList.toggle('active');

    // Prevent scrolling when menu is open
    document.body.classList.toggle('menu-open');
  });

  // Initialize Settings Tabs
  function initializeSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    const panels = document.querySelectorAll('.settings-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and panels
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        // Add active class to clicked tab
        tab.classList.add('active');

        // Show corresponding panel
        const panelId = `${tab.dataset.tab}-panel`;
        document.getElementById(panelId).classList.add('active');
      });
    });
  }

  // Update Slider Fill and Thumb
  function updateSliderFill() {
    const slider = document.getElementById('compression-level');
    const sliderFill = document.querySelector('.slider-fill');
    const sliderThumb = document.querySelector('.slider-thumb');
    const compressionValue = document.getElementById('compression-value');

    // Initial update
    if (slider && sliderFill && sliderThumb) {
      // Set initial value
      const initialPercentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;
      sliderFill.style.width = `${initialPercentage}%`;
      sliderThumb.style.left = `${initialPercentage}%`;

      // Update on slider input (real-time during drag)
      slider.addEventListener('input', () => {
        const percentage = (slider.value - slider.min) / (slider.max - slider.min) * 100;
        sliderFill.style.width = `${percentage}%`;
        sliderThumb.style.left = `${percentage}%`;

        // Update compression value display
        if (compressionValue) {
          compressionValue.textContent = `${slider.value}%`;
        }
      });

      // Add touch and mouse events for better interaction
      slider.addEventListener('mousedown', () => {
        document.body.style.cursor = 'grabbing';
        slider.classList.add('active');
        sliderThumb.classList.add('active');
      });

      slider.addEventListener('touchstart', () => {
        slider.classList.add('active');
        sliderThumb.classList.add('active');
      });

      window.addEventListener('mouseup', () => {
        document.body.style.cursor = '';
        slider.classList.remove('active');
        sliderThumb.classList.remove('active');
      });

      window.addEventListener('touchend', () => {
        slider.classList.remove('active');
        sliderThumb.classList.remove('active');
      });
    }
  }

  // Initialize Comparison Toggle
  function initializeComparisonToggle() {
    const toggle = document.getElementById('comparison-toggle');
    if (toggle) {
      toggle.addEventListener('change', function() {
        const preview = document.getElementById('preview');
        if (this.checked) {
          preview.classList.add('show-after');
        } else {
          preview.classList.remove('show-after');
        }
      });
    }
  }

  // Initialize Drag and Drop
  function initializeDragAndDrop() {
    const dropArea = document.getElementById('drop-area');

    if (!dropArea) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
      dropArea.classList.add('highlight');
    }

    function unhighlight() {
      dropArea.classList.remove('highlight');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        uploadInput.files = files;
        handleImageUpload(files[0]);
      }
    }
  }

  // Handle dropdown menu on mobile
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownParent = document.querySelector('.nav-links li.dropdown');

  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', (e) => {
      // Prevent default only on mobile view
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdownParent.classList.toggle('active');
      }
    });
  }

  // Close mobile menu when a link is clicked (except dropdown toggle)
  const navLinksList = document.querySelectorAll('.nav-links li a:not(.dropdown-toggle)');
  navLinksList.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') &&
        !e.target.closest('.nav-links') &&
        !e.target.closest('#mobile-menu')) {
      navLinks.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });

  // Image Upload and Compression
  const uploadInput = document.getElementById('upload');
  const downloadLink = document.getElementById('download-link');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const compressionLevelInput = document.getElementById('compression-level');
  const compressionValue = document.getElementById('compression-value');
  const dimensionsPx = document.getElementById('dimensions-px');
  const dimensionsMm = document.getElementById('dimensions-mm');
  const dimensionsCm = document.getElementById('dimensions-cm');
  const sizeDisplay = document.getElementById('size-display');
  const imagePreview = document.getElementById('image-preview');
  const compressedSizeDisplay = document.getElementById('compressed-size-display');
  const newImageBtn = document.getElementById('new-image-btn');
  const imageDetails = document.getElementById('image-details');
  const targetSizeInput = document.getElementById('target-size');

  // Global variables
  let currentFileSize = 0; // Track original file size for comparison

  // Compression level value is now updated in the updateSliderFill function

  // Global variables to store original image dimensions
  let originalWidth = 0;
  let originalHeight = 0;

  // Auto-calculate height when width changes to maintain aspect ratio
  widthInput.addEventListener('input', function() {
    if (!originalWidth || !originalHeight) return; // Skip if no image is loaded

    const newWidth = parseInt(this.value);
    if (!newWidth) {
      // If width is cleared, clear height too
      heightInput.value = '';
      return;
    }

    // Calculate new height based on aspect ratio
    const aspectRatio = originalHeight / originalWidth;
    const newHeight = Math.round(newWidth * aspectRatio);

    // Update height input
    heightInput.value = newHeight;
  });

  // Auto-calculate width when height changes to maintain aspect ratio
  heightInput.addEventListener('input', function() {
    if (!originalWidth || !originalHeight) return; // Skip if no image is loaded

    const newHeight = parseInt(this.value);
    if (!newHeight) {
      // If height is cleared, clear width too
      widthInput.value = '';
      return;
    }

    // Calculate new width based on aspect ratio
    const aspectRatio = originalWidth / originalHeight;
    const newWidth = Math.round(newHeight * aspectRatio);

    // Update width input
    widthInput.value = newWidth;
  });

  // // Create animated background particles
  // function createParticles() {
  //   const particleCount = 15;
  //   const container = document.body;

  //   for (let i = 0; i < particleCount; i++) {
  //     const particle = document.createElement('div');
  //     particle.classList.add('particle');

  //     // Random size
  //     const size = Math.random() * 4 + 2;
  //     particle.style.width = `${size}px`;
  //     particle.style.height = `${size}px`;

  //     // Random position
  //     const posX = Math.random() * 100;
  //     const posY = Math.random() * 100;
  //     particle.style.left = `${posX}%`;
  //     particle.style.bottom = `${-20 + posY}%`;

  //     // Random opacity
  //     particle.style.opacity = Math.random() * 0.5;

  //     // Random animation duration and delay
  //     const duration = Math.random() * 20 + 10;
  //     const delay = Math.random() * 10;
  //     particle.style.animationDuration = `${duration}s`;
  //     particle.style.animationDelay = `${delay}s`;

  //     container.appendChild(particle);
  //   }
  // }

  // Initialize particles on page load
  // window.addEventListener('DOMContentLoaded', createParticles);

  // New Image Button
  newImageBtn.addEventListener('click', () => {
    // Hide the result container
    const resultContainer = document.querySelector('.result-container');
    resultContainer.style.display = 'none';

    // Clear the file input
    uploadInput.value = '';

    // Clear the image preview
    imagePreview.innerHTML = '';
    imagePreview.style.display = 'none';

    // Reset any edit state if needed
    if (window.resetEditState) {
      window.resetEditState();
    }

    // Hide image details
    imageDetails.style.display = 'none';

    // Reset width and height inputs
    widthInput.value = '';
    heightInput.value = '';

    // Reset target size input
    targetSizeInput.value = '';

    // Reset compression level to default (70%)
    compressionLevelInput.value = 70;
    compressionValue.textContent = '70%';

    // Update slider fill
    const sliderFill = document.querySelector('.slider-fill');
    if (sliderFill) {
      sliderFill.style.width = '70%';
    }

    // Show upload instructions
    const uploadInstructions = document.querySelector('.upload-instructions');
    if (uploadInstructions) {
      uploadInstructions.style.display = 'block';
    }

    // Scroll back to upload box
    const uploadBox = document.querySelector('.upload-box');
    if (uploadBox) {
      uploadBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // Drag and Drop Functionality
  const uploadBox = document.querySelector('.upload-box');

  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#778da9';
  });

  uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = '#415a77';
  });

  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#415a77';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadInput.files = files;
      handleImageUpload(files[0]);
    }
  });

  // Paste from Clipboard
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        const file = new File([blob], 'pasted-image.png', { type: blob.type });
        uploadInput.files = [file];
        handleImageUpload(file);
      }
    }
  });

  // Handle Image Upload
  uploadInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const supportedFormats = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif',
      'image/heif', 'image/heic', 'image/x-icon', 'image/svg+xml'
    ];

    // Check if the file extension is supported (for formats that might not have proper MIME types)
    const fileName = file.name.toLowerCase();
    const isExtensionSupported = (
      fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') ||
      fileName.endsWith('.png') || fileName.endsWith('.webp') ||
      fileName.endsWith('.gif') || fileName.endsWith('.heif') ||
      fileName.endsWith('.heic') || fileName.endsWith('.ico') ||
      fileName.endsWith('.svg')
    );

    if (!supportedFormats.includes(file.type) && !isExtensionSupported) {
      alert('Unsupported file format. Please upload a JPG, PNG, JPEG, WEBP, GIF, HEIF/HEIC, ICO, or SVG file.');
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size is too large. Please upload an image smaller than 10MB.');
      return;
    }

    handleImageUpload(file);
  });

  function handleImageUpload(file) {
    // Store original file size for comparison
    currentFileSize = file.size;

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function () {
        // Clear upload instructions and show image preview
        const uploadInstructions = document.querySelector('.upload-instructions');
        if (uploadInstructions) {
          uploadInstructions.style.display = 'none';
        }

        // Make sure the image preview element is visible
        imagePreview.style.display = 'block';

        // Display uploaded image inside the upload box
        imagePreview.innerHTML = `<img src="${img.src}" alt="Uploaded Image">`;

        // Add crop icon to the image
        if (window.addCropIconToImage) {
          window.addCropIconToImage();
        }

        // Add edit icon to the image
        if (window.addEditIconToImage) {
          window.addEditIconToImage();
        }

        // Display image details
        const widthPx = img.width;
        const heightPx = img.height;
        const widthMm = (widthPx * 0.264583).toFixed(2); // Convert px to mm
        const heightMm = (heightPx * 0.264583).toFixed(2); // Convert px to mm
        const widthCm = (widthMm / 10).toFixed(2); // Convert mm to cm
        const heightCm = (heightMm / 10).toFixed(2); // Convert mm to cm
        const sizeKB = (file.size / 1024).toFixed(2); // Convert bytes to KB

        // Store original dimensions for aspect ratio calculations
        originalWidth = widthPx;
        originalHeight = heightPx;

        dimensionsPx.querySelector('span').innerHTML = `${widthPx}px x ${heightPx}px`;
        dimensionsMm.querySelector('span').innerHTML = `${widthMm}mm x ${heightMm}mm`;
        dimensionsCm.querySelector('span').innerHTML = `${widthCm}cm x ${heightCm}cm`;
        sizeDisplay.querySelector('span').innerHTML = `${sizeKB} KB`;

        // Show image details box
        imageDetails.style.display = 'block';

        // Disable download button
        downloadLink.style.display = 'none';
        downloadLink.classList.remove('active');

        // Pre-fill width and height inputs with current image dimensions
        widthInput.placeholder = widthPx;
        heightInput.placeholder = heightPx;

        // Suggest a reasonable target size (50% of original)
        if (file.size > 2048) { // If larger than 2KB
          const suggestedSize = Math.round(file.size / 2048); // 50% of original in KB
          targetSizeInput.placeholder = `Suggest: ${suggestedSize} KB`;
        }
      };
    };
    reader.readAsDataURL(file);
  }

  // Function to compress image to a specific target size using binary search
  async function compressToTargetSize(img, width, height, format, targetSize, fallbackQuality) {
    // Binary search to find the right compression level
    let high = 1.0; // Maximum quality
    let low = 0.0; // Minimum quality
    let mid = fallbackQuality;
    let bestBlob = null;

    // Try up to 10 iterations to get close to the target size
    for (let i = 0; i < 10; i++) {
      // If we already have a good enough result, stop
      if (bestBlob && Math.abs(bestBlob.size - targetSize) <= targetSize * 0.05) {
        break;
      }

      // Create a new canvas for this iteration
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Fill with white background for transparent images
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw the image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Get blob with current quality
      const blob = await new Promise(resolve => {
        canvas.toBlob(blob => {
          resolve(blob);
        }, format, mid);
      });

      // Adjust quality based on result
      if (blob.size > targetSize) {
        // Too big, reduce quality
        high = mid;
        mid = low ? (low + mid) / 2 : mid * 0.5;
      } else {
        // Too small or just right, increase quality if possible
        bestBlob = blob;
        low = mid;
        mid = high ? (high + mid) / 2 : Math.min(mid + 0.1, 1.0);
      }

      // Clean up canvas
      canvas.width = 0;
      canvas.height = 0;
    }

    // If we found a good result, return it
    if (bestBlob) {
      return bestBlob;
    }

    // If we couldn't get close enough, use the fallback quality
    return await new Promise(resolve => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Fill with white background for transparent images
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw the image with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(blob => {
        resolve(blob);
      }, format, fallbackQuality);
    });
  }

  // Compress Image
  document.getElementById('compress-btn').addEventListener('click', async function () {
    const fileInput = document.getElementById('upload');
    if (fileInput.files.length === 0) {
      alert('Please upload an image first.');
      return;
    }

    // Check if we have a cropped, rotated, framed, or edited image
    const croppedImage = window.getCroppedImage ? window.getCroppedImage() : null;
    const editedImage = window.getEditedImage ? await window.getEditedImage() : null;

    if (editedImage) {
      // Use the edited image for compression
      const reader = new FileReader();
      reader.onload = async function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = async function () {
          // Use the edited image's name but with the original file's extension
          const originalFile = fileInput.files[0];
          processImageForCompression(img, editedImage, originalFile.name);
        };
      };
      reader.readAsDataURL(editedImage);
    } else if (croppedImage) {
      // Use the cropped image for compression
      const reader = new FileReader();
      reader.onload = async function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = async function () {
          // Use the cropped image's name but with the original file's extension
          const originalFile = fileInput.files[0];
          processImageForCompression(img, croppedImage, originalFile.name);
        };
      };
      reader.readAsDataURL(croppedImage);
    } else {
      // Use the original uploaded image
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = async function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = async function () {
          processImageForCompression(img, file, file.name);
        };
      };
      reader.readAsDataURL(file);
    }
  });

  // Function to process image for compression
  async function processImageForCompression(img, file, fileName) {
    // Determine file type for optimal compression
    let fileType = '';

    // Get file type from MIME type if available
    if (file.type) {
      fileType = file.type.split('/')[1].toLowerCase();
    }
    // Otherwise try to determine from file extension
    else {
      const extension = fileName.split('.').pop().toLowerCase();
      fileType = extension;
    }

    // Determine if the image has transparency
    const isTransparent = ['png', 'webp', 'svg', 'ico'].includes(fileType);

    // Special handling for vector formats
    const isVector = fileType === 'svg';

    // For vector formats, we might need to adjust dimensions
    if (isVector) {
      console.log(`Processing vector format: ${fileType}`);
      // Vector formats like SVG can be scaled to any size without quality loss
    }

    // Get user-defined width and height
    let width = widthInput.value ? parseInt(widthInput.value) : img.width;
    let height = heightInput.value ? parseInt(heightInput.value) : img.height;

    // Maintain aspect ratio if only one dimension is provided
    if (widthInput.value && !heightInput.value) {
      height = Math.round((width / img.width) * img.height);
    } else if (!widthInput.value && heightInput.value) {
      width = Math.round((height / img.height) * img.width);
    }

    // Get target size if specified (in KB, convert to bytes)
    const targetSize = targetSizeInput.value ? parseInt(targetSizeInput.value) * 1024 : null;

    // Get compression level (0 to 1)
    let compressionLevel = compressionLevelInput.value / 100 || 0.7; // Default to 70% if not set

    // Adjust compression level based on image type for better quality preservation
    if (['png', 'svg', 'ico'].includes(fileType) && compressionLevel < 0.8) {
      compressionLevel = Math.min(compressionLevel + 0.1, 0.9); // Increase quality for PNGs, SVGs, and ICOs
    }

    // Determine optimal output format
    let outputFormat = 'image/jpeg';

    // Preserve format for specific file types
    if (isTransparent && compressionLevel > 0.8) {
      outputFormat = 'image/png'; // Use PNG for high-quality transparent images
    } else if (fileType === 'webp') {
      outputFormat = 'image/webp'; // Maintain WebP if that's the original
    } else if (fileType === 'svg') {
      outputFormat = 'image/svg+xml'; // Maintain SVG format
    } else if (fileType === 'ico') {
      outputFormat = 'image/png'; // Convert ICO to PNG for better browser support
    } else if (['heif', 'heic'].includes(fileType)) {
      outputFormat = 'image/jpeg'; // Convert HEIF/HEIC to JPEG
    }

    // Use target size compression if specified
    let blob;
    if (targetSize && targetSize > 0) {
      try {
        // Show loading state
        document.getElementById('compress-btn').disabled = true;
        document.getElementById('compress-btn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing...';

        // Use binary search to find the right compression level for target size
        blob = await compressToTargetSize(img, width, height, outputFormat, targetSize, compressionLevel);

        // Reset button state
        document.getElementById('compress-btn').disabled = false;
        document.getElementById('compress-btn').innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Compress Image';
      } catch (error) {
        console.error('Error during target size compression:', error);

        // Reset button state
        document.getElementById('compress-btn').disabled = false;
        document.getElementById('compress-btn').innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Compress Image';

        // Fall back to normal compression
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        blob = await new Promise(resolve => {
          canvas.toBlob(blob => {
            resolve(blob);
          }, outputFormat, compressionLevel);
        });
      }
    } else {
      // Use normal compression
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Apply background for transparent images
      if (isTransparent) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      // Use high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the image with the new dimensions
      ctx.drawImage(img, 0, 0, width, height);

      // Compress image
      blob = await new Promise(resolve => {
        canvas.toBlob(blob => {
          resolve(blob);
        }, outputFormat, compressionLevel);
      });
    }

    // Create URL and update preview
    const compressedUrl = URL.createObjectURL(blob);
    const extension = outputFormat.split('/')[1];
    updatePreviewAndDownloadLink(compressedUrl, fileName, blob.size, extension);
  }

  // Function to update preview and download link
  function updatePreviewAndDownloadLink(compressedUrl, fileName, compressedSize, extension = 'jpg') {
    // Clear previous preview and download link
    const preview = document.getElementById('preview');
    const downloadLink = document.getElementById('download-link');
    const resultContainer = document.querySelector('.result-container');

    // Show the result container that was hidden by default
    resultContainer.style.display = 'flex';

    // Update preview image
    preview.innerHTML = `<img src="${compressedUrl}" alt="Compressed Image">`;

    // Update download link
    downloadLink.href = compressedUrl;
    downloadLink.download = `compressed_${fileName.replace(/\.[^/.]+$/, '')}.${extension}`; // Use appropriate extension
    downloadLink.style.display = 'inline-block';
    downloadLink.classList.add('active'); // Enable download link

    // Calculate compression ratio
    const originalSize = currentFileSize || 0;
    const compressionRatio = originalSize ? ((1 - (compressedSize / originalSize)) * 100).toFixed(1) : 0;

    // Show compressed size and ratio
    const compressedSizeKB = (compressedSize / 1024).toFixed(2);
    const originalSizeKB = (originalSize / 1024).toFixed(2);

    // Update compression ratio display
    const compressionRatioElement = document.getElementById('compression-ratio');
    if (compressionRatioElement) {
      compressionRatioElement.textContent = `${compressionRatio}%`;
    }

    // Update load time saved (rough estimate based on size difference)
    const loadTimeSavedElement = document.getElementById('load-time-saved');
    if (loadTimeSavedElement && originalSize) {
      const sizeDifference = originalSize - compressedSize;
      const timeSaved = (sizeDifference / (1024 * 50)).toFixed(1); // Rough estimate: 50KB/s connection
      loadTimeSavedElement.textContent = `${timeSaved}s`;
    }

    // Update original size display
    const originalSizeDisplay = document.getElementById('original-size-display');
    if (originalSizeDisplay) {
      originalSizeDisplay.querySelector('span').textContent = `${originalSizeKB} KB`;
    }

    // Update compressed size display
    if (compressedSizeDisplay) {
      compressedSizeDisplay.querySelector('span').textContent = `${compressedSizeKB} KB`;
    }

    // Show New Image button
    newImageBtn.style.display = 'inline-block';

    // If target size was used, show how close we got
    if (targetSizeInput.value) {
      const targetSizeKB = parseInt(targetSizeInput.value);
      const actualSizeKB = parseFloat(compressedSizeKB);
      const difference = Math.abs(targetSizeKB - actualSizeKB);
      const percentDiff = ((difference / targetSizeKB) * 100).toFixed(1);

      if (difference <= targetSizeKB * 0.05) {
        // Within 5% of target
        const targetAccuracyElement = document.createElement('div');
        targetAccuracyElement.className = 'target-accuracy';
        targetAccuracyElement.innerHTML = `<i class="fas fa-bullseye"></i> Within ${percentDiff}% of target size`;

        // Add to the result info
        const resultInfo = document.querySelector('.result-info');
        if (resultInfo && !resultInfo.querySelector('.target-accuracy')) {
          resultInfo.insertBefore(targetAccuracyElement, resultInfo.firstChild);
        }
      }
    }

    // Scroll to results
    setTimeout(() => {
      const resultContainer = document.querySelector('.result-container');
      if (resultContainer) {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }