/**
 * Image Cropper Module for Image Compressor Pro
 * This module handles the image cropping functionality
 */

// Initialize Cropper.js when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Global variables
  let cropper = null;
  let croppedImage = null;
  let currentAspectRatio = NaN; // Default to free aspect ratio

  // DOM Elements
  const cropModal = document.createElement('div');
  cropModal.className = 'crop-modal';
  cropModal.innerHTML = `
    <div class="crop-modal-content">
      <div class="crop-modal-header">
        <h2 class="crop-modal-title"><i class="fas fa-crop-alt"></i> Crop Image</h2>
        <span class="crop-close"><i class="fas fa-times"></i></span>
      </div>

      <div class="crop-container">
        <img id="crop-img" class="crop-img">
      </div>

      <div class="crop-controls">
        <div class="crop-control-group">
          <label class="crop-control-label">Aspect Ratio</label>
          <div class="crop-aspect-ratio">
            <button class="crop-aspect-btn active" data-ratio="NaN">Free</button>
            <button class="crop-aspect-btn" data-ratio="1">1:1</button>
            <button class="crop-aspect-btn" data-ratio="4/3">4:3</button>
            <button class="crop-aspect-btn" data-ratio="16/9">16:9</button>
            <button class="crop-aspect-btn" data-ratio="2/3">2:3</button>
          </div>
        </div>
        <div class="crop-control-group">
          <label class="crop-control-label">Zoom</label>
          <div class="crop-zoom-controls">
            <button class="crop-zoom-btn" id="zoom-out"><i class="fas fa-search-minus"></i></button>
            <div class="crop-zoom-slider">
              <div class="crop-zoom-slider-thumb" id="zoom-slider-thumb"></div>
            </div>
            <button class="crop-zoom-btn" id="zoom-in"><i class="fas fa-search-plus"></i></button>
          </div>
        </div>
      </div>

      <div class="crop-actions">
        <button class="crop-action-btn crop-cancel-btn" id="crop-cancel"><i class="fas fa-times"></i> Cancel</button>
        <button class="crop-action-btn crop-apply-btn" id="crop-apply"><i class="fas fa-check"></i> Apply</button>
      </div>
    </div>
  `;
  document.body.appendChild(cropModal);

  // Function to add crop icon to the uploaded image
  function addCropIconToImage() {
    const imagePreview = document.getElementById('image-preview');
    if (!imagePreview || !imagePreview.querySelector('img')) return;

    // Check if crop icon already exists
    if (imagePreview.querySelector('.crop-icon-container')) return;

    const cropIconContainer = document.createElement('div');
    cropIconContainer.className = 'crop-icon-container tooltip';
    cropIconContainer.innerHTML = '<i class="fas fa-crop-alt crop-icon"></i><span class="tooltip-text">Click to crop image</span>';
    cropIconContainer.addEventListener('click', openCropModal);

    imagePreview.style.position = 'relative';
    imagePreview.appendChild(cropIconContainer);
  }

  // Function to open the crop modal
  function openCropModal() {
    const imagePreview = document.getElementById('image-preview');
    const img = imagePreview.querySelector('img');

    if (!img) return;

    // Set the image in the crop container
    const cropImg = document.getElementById('crop-img');
    cropImg.src = img.src;

    // Show the modal
    cropModal.style.display = 'block';

    // Initialize Cropper.js
    initCropper();
  }

  // Function to initialize Cropper.js
  function initCropper() {
    const cropImg = document.getElementById('crop-img');

    // Destroy previous cropper instance if exists
    if (cropper) {
      cropper.destroy();
    }

    // Initialize new cropper
    cropper = new window.Cropper(cropImg, {
      viewMode: 1,
      dragMode: 'move',
      aspectRatio: currentAspectRatio,
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      zoomable: true,
      zoomOnWheel: false,
      minCanvasWidth: 250,
      minCanvasHeight: 250,
      initialAspectRatio: 1,
      ready: function() {
        // Set initial zoom level after a short delay to ensure the cropper is fully initialized
        setTimeout(() => {
          try {
            // Set initial zoom level to 1 (100%)
            cropper.zoomTo(1);

            // Reset zoom slider to middle position (50%)
            const zoomThumb = document.getElementById('zoom-slider-thumb');
            if (zoomThumb) {
              zoomThumb.style.left = '50%';

              // Add visual feedback
              zoomThumb.classList.add('zooming');
              setTimeout(() => {
                zoomThumb.classList.remove('zooming');
              }, 200);
            }

            // Show a message to indicate the cropper is ready
            console.log('Cropper initialized with zoom level 1');
          } catch (error) {
            console.error('Error in cropper ready handler:', error);
          }
        }, 200);
      },
      zoom: function(event) {
        try {
          // Use the event data to get the exact zoom ratio
          const zoomRatio = event.detail.ratio;

          // Ensure the zoom ratio is within bounds
          const boundedZoomRatio = Math.max(0.1, Math.min(zoomRatio, 3.0));

          // Map zoom range [0.1, 3.0] to slider position [0, 100]
          let position;
          if (boundedZoomRatio <= 1.0) {
            // Map [0.1, 1.0] to [0, 50]
            position = ((boundedZoomRatio - 0.1) / 0.9) * 50;
          } else {
            // Map [1.0, 3.0] to [50, 100]
            position = 50 + ((boundedZoomRatio - 1.0) / 2.0) * 50;
          }

          // Clamp position between 0 and 100
          position = Math.max(0, Math.min(100, position));

          // Update thumb position directly
          const zoomThumb = document.getElementById('zoom-slider-thumb');
          if (zoomThumb) {
            zoomThumb.style.left = position + '%';

            // Add visual feedback
            zoomThumb.classList.add('zooming');
            setTimeout(() => {
              zoomThumb.classList.remove('zooming');
            }, 200);
          }

          console.log(`Zoom event: ratio=${boundedZoomRatio.toFixed(2)}, position=${position.toFixed(2)}%`);
        } catch (error) {
          console.error('Error in zoom event handler:', error);
        }
      }
    });
  }

  // Function to close the crop modal
  function closeCropModal() {
    cropModal.style.display = 'none';
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  }

  // Function to apply the crop
  function applyCrop() {
    if (!cropper) return;

    try {
      // Get the cropped canvas
      const resultCanvas = cropper.getCroppedCanvas({
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: '#000',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      if (!resultCanvas) return;

      // Get the original image for size comparison
      const originalImageFile = document.querySelector('#upload').files[0];
      const originalSize = originalImageFile ? originalImageFile.size : 0;

      // Determine the appropriate quality to keep file size smaller than original
      // Start with a moderate quality
      let quality = 0.85;

      // Function to process the blob with quality
      const processBlob = (blob) => {
        // If the cropped image is larger than the original, we'll compress it further
        if (originalSize > 0 && blob.size > originalSize) {
          console.log(`Cropped image (${blob.size} bytes) is larger than original (${originalSize} bytes). Compressing further...`);

          // Create a new canvas for compression
          const compressCanvas = document.createElement('canvas');
          const ctx = compressCanvas.getContext('2d');

          // Create an image from the blob
          const img = new Image();
          img.onload = () => {
            // Calculate dimensions - if the image is very large, resize it
            let targetWidth = img.width;
            let targetHeight = img.height;

            // If the image is larger than 2000px in any dimension, scale it down
            const MAX_DIMENSION = 2000;
            if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
              if (img.width > img.height) {
                // Landscape orientation
                const ratio = img.height / img.width;
                targetWidth = MAX_DIMENSION;
                targetHeight = Math.round(MAX_DIMENSION * ratio);
              } else {
                // Portrait orientation
                const ratio = img.width / img.height;
                targetHeight = MAX_DIMENSION;
                targetWidth = Math.round(MAX_DIMENSION * ratio);
              }
              console.log(`Resizing large image from ${img.width}x${img.height} to ${targetWidth}x${targetHeight}`);
            }

            // Set canvas dimensions
            compressCanvas.width = targetWidth;
            compressCanvas.height = targetHeight;

            // Fill with white background for transparent images if converting to JPEG
            if (outputFormat === 'image/jpeg') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, targetWidth, targetHeight);
            }

            // Use high quality image rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            // Compress with reduced quality
            quality = 0.7; // Reduce quality further

            // Use the same format as the output format
            compressCanvas.toBlob((compressedBlob) => {
              console.log(`Compressed to ${compressedBlob.size} bytes (${Math.round(compressedBlob.size / originalSize * 100)}% of original)`);

              // If still too large, try one more compression pass with even lower quality
              if (compressedBlob.size > originalSize && outputFormat === 'image/jpeg') {
                quality = 0.5;
                compressCanvas.toBlob((finalBlob) => {
                  console.log(`Final compression to ${finalBlob.size} bytes (${Math.round(finalBlob.size / originalSize * 100)}% of original)`);
                  finalizeCrop(finalBlob);
                }, outputFormat, quality);
              } else {
                finalizeCrop(compressedBlob);
              }
            }, outputFormat, outputFormat === 'image/jpeg' ? quality : undefined);
          };
          img.src = URL.createObjectURL(blob);
        } else {
          // If the cropped image is already smaller, use it as is
          finalizeCrop(blob);
        }
      };

      // Function to finalize the crop with the processed blob
      const finalizeCrop = (finalBlob) => {
        // Create a new URL for the cropped image
        const croppedImageUrl = URL.createObjectURL(finalBlob);

        // Update the image in the preview
        const imagePreview = document.getElementById('image-preview');
        const img = imagePreview.querySelector('img');

        if (img) {
          // Set the image to its original size (no max-height/max-width constraints)
          img.style.maxHeight = 'none';
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.width = 'auto';

          // Update the source
          img.src = croppedImageUrl;

          // Store the cropped image for compression
          croppedImage = finalBlob;

          // Update image details
          updateImageDetails(finalBlob);

          console.log(`Applied crop: Final size ${finalBlob.size} bytes`);
        }

        // Close the modal
        closeCropModal();
      };

      // Determine the appropriate format based on the original image
      const originalFormat = originalImageFile ? originalImageFile.type : 'image/jpeg';

      // Use PNG for transparent images, JPEG for others
      const outputFormat = originalFormat.includes('png') ? 'image/png' : 'image/jpeg';

      // Convert canvas to blob with quality control
      // Note: quality parameter only applies to JPEG format
      resultCanvas.toBlob((blob) => {
        processBlob(blob);
      }, outputFormat, outputFormat === 'image/jpeg' ? quality : undefined);
    } catch (error) {
      console.error('Error in applyCrop:', error);
      closeCropModal();
    }
  }

  // Function to update image details after cropping
  function updateImageDetails(blob) {
    const img = new Image();
    img.onload = function() {
      const width = this.width;
      const height = this.height;

      // Update dimensions display
      const dimensionsPx = document.querySelector('#dimensions-px span');
      if (dimensionsPx) {
        dimensionsPx.textContent = `${width} x ${height} px`;
      }

      // Update dimensions in mm (assuming 96 DPI)
      const dimensionsMm = document.querySelector('#dimensions-mm span');
      if (dimensionsMm) {
        const widthMm = Math.round(width * 25.4 / 96);
        const heightMm = Math.round(height * 25.4 / 96);
        dimensionsMm.textContent = `${widthMm} x ${heightMm} mm`;
      }

      // Update dimensions in cm
      const dimensionsCm = document.querySelector('#dimensions-cm span');
      if (dimensionsCm) {
        const widthCm = (width * 25.4 / 96 / 10).toFixed(1);
        const heightCm = (height * 25.4 / 96 / 10).toFixed(1);
        dimensionsCm.textContent = `${widthCm} x ${heightCm} cm`;
      }

      // Update file size
      const sizeDisplay = document.querySelector('#size-display span');
      if (sizeDisplay) {
        const size = blob.size;
        if (size < 1024) {
          sizeDisplay.textContent = size + ' B';
        } else if (size < 1024 * 1024) {
          sizeDisplay.textContent = (size / 1024).toFixed(2) + ' KB';
        } else {
          sizeDisplay.textContent = (size / (1024 * 1024)).toFixed(2) + ' MB';
        }
      }
    };

    img.src = URL.createObjectURL(blob);
  }

  // Function to change aspect ratio
  function changeAspectRatio(ratio) {
    currentAspectRatio = ratio === 'NaN' ? NaN : eval(ratio);

    if (cropper) {
      cropper.setAspectRatio(currentAspectRatio);
    }

    // Update active button
    const buttons = document.querySelectorAll('.crop-aspect-btn');
    buttons.forEach(button => {
      button.classList.remove('active');
      if (button.dataset.ratio === ratio) {
        button.classList.add('active');
      }
    });
  }



  // Function to zoom in
  function zoomIn() {
    if (!cropper) return;

    try {
      // Get current zoom data
      const zoomData = cropper.getImageData();
      const currentZoom = zoomData.ratio;

      // Calculate new zoom level (increase by 0.1)
      // Limit maximum zoom to 3.0 (300%)
      const newZoom = Math.min(currentZoom + 0.1, 3.0);

      // Apply the zoom directly using the cropper's zoom method
      // This will trigger the zoom event handler
      cropper.zoom(0.1);

      console.log(`Zoomed in to: ${newZoom.toFixed(2)}`);
    } catch (error) {
      console.error('Error in zoomIn:', error);
    }
  }

  // Function to zoom out
  function zoomOut() {
    if (!cropper) return;

    try {
      // Get current zoom data
      const zoomData = cropper.getImageData();
      const currentZoom = zoomData.ratio;

      // Calculate new zoom level (decrease by 0.1)
      // Limit minimum zoom to 0.1 (10%)
      const newZoom = Math.max(currentZoom - 0.1, 0.1);

      // Apply the zoom directly using the cropper's zoom method
      // This will trigger the zoom event handler
      cropper.zoom(-0.1);

      console.log(`Zoomed out to: ${newZoom.toFixed(2)}`);
    } catch (error) {
      console.error('Error in zoomOut:', error);
    }
  }



  // Function to handle zoom slider
  function initZoomSlider() {
    const zoomSlider = document.querySelector('.crop-zoom-slider');
    const zoomThumb = document.getElementById('zoom-slider-thumb');
    let isDragging = false;

    // Set initial position (50%)
    zoomThumb.style.left = '50%';

    // Function to calculate position from mouse/touch event
    function getPositionFromEvent(e, isTouch = false) {
      const sliderRect = zoomSlider.getBoundingClientRect();
      const clientX = isTouch ? e.touches[0].clientX : e.clientX;
      let position = (clientX - sliderRect.left) / sliderRect.width;

      // Clamp position between 0 and 1
      return Math.max(0, Math.min(1, position));
    }

    // Handle mouse down on thumb
    zoomThumb.addEventListener('mousedown', function(e) {
      isDragging = true;
      zoomThumb.classList.add('active');
      e.preventDefault(); // Prevent text selection
    });

    // Handle mouse down on slider (for clicking anywhere on the slider)
    zoomSlider.addEventListener('mousedown', function(e) {
      if (e.target === zoomSlider || e.target.classList.contains('crop-zoom-slider')) {
        const position = getPositionFromEvent(e);
        setZoomFromSliderPosition(position);
      }
    });

    // Handle mouse move
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;

      const position = getPositionFromEvent(e);
      setZoomFromSliderPosition(position);
    });

    // Handle mouse up
    document.addEventListener('mouseup', function() {
      if (isDragging) {
        zoomThumb.classList.remove('active');
        isDragging = false;
      }
    });

    // Handle touch events for mobile
    zoomThumb.addEventListener('touchstart', function(e) {
      isDragging = true;
      zoomThumb.classList.add('active');
      e.preventDefault(); // Prevent scrolling
    });

    zoomSlider.addEventListener('touchstart', function(e) {
      if (e.target === zoomSlider || e.target.classList.contains('crop-zoom-slider')) {
        const position = getPositionFromEvent(e, true);
        setZoomFromSliderPosition(position);
        e.preventDefault(); // Prevent scrolling
      }
    });

    document.addEventListener('touchmove', function(e) {
      if (!isDragging) return;

      const position = getPositionFromEvent(e, true);
      setZoomFromSliderPosition(position);
      e.preventDefault(); // Prevent scrolling while dragging
    });

    document.addEventListener('touchend', function() {
      if (isDragging) {
        zoomThumb.classList.remove('active');
        isDragging = false;
      }
    });

    // Handle slider click for better UX
    zoomSlider.addEventListener('click', function(e) {
      if (e.target === zoomSlider || e.target.classList.contains('crop-zoom-slider')) {
        const position = getPositionFromEvent(e);
        setZoomFromSliderPosition(position);
      }
    });

    // Log initial setup
    console.log('Zoom slider initialized');
  }

  // Function to set zoom based on slider position
  function setZoomFromSliderPosition(position) {
    if (!cropper) return;

    try {
      // Update thumb position immediately
      const zoomThumb = document.getElementById('zoom-slider-thumb');
      zoomThumb.style.left = (position * 100) + '%';

      // Map slider position [0, 1] to zoom range [0.1, 3.0]
      // 0% = 0.1, 50% = 1.0, 100% = 3.0
      let zoomLevel;

      if (position <= 0.5) {
        // Map [0, 0.5] to [0.1, 1.0]
        zoomLevel = 0.1 + (position * 2 * 0.9);
      } else {
        // Map [0.5, 1.0] to [1.0, 3.0]
        zoomLevel = 1.0 + ((position - 0.5) * 2 * 2.0);
      }

      // Apply zoom directly to the cropper
      cropper.zoomTo(zoomLevel);

      // Add visual feedback
      zoomThumb.classList.add('zooming');
      setTimeout(() => {
        zoomThumb.classList.remove('zooming');
      }, 200);

      console.log(`Slider position: ${(position * 100).toFixed(2)}%, Zoom level: ${zoomLevel.toFixed(2)}`);
    } catch (error) {
      console.error('Error in setZoomFromSliderPosition:', error);
    }
  }



  // Function to add ripple effect to buttons
  function addRippleEffect(button) {
    button.addEventListener('click', function(e) {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');

      // Position the ripple
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      // Style the ripple
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      // Add ripple to button
      button.appendChild(ripple);

      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }

  // Event Listeners
  document.querySelector('.crop-close').addEventListener('click', closeCropModal);
  document.getElementById('crop-cancel').addEventListener('click', closeCropModal);
  document.getElementById('crop-apply').addEventListener('click', applyCrop);

  // Zoom button event listeners with visual feedback
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');

  zoomInBtn.addEventListener('click', function() {
    // Add active class for visual feedback
    this.classList.add('active');
    setTimeout(() => this.classList.remove('active'), 200);

    // Call zoom in function
    zoomIn();
  });

  zoomOutBtn.addEventListener('click', function() {
    // Add active class for visual feedback
    this.classList.add('active');
    setTimeout(() => this.classList.remove('active'), 200);

    // Call zoom out function
    zoomOut();
  });

  // Add ripple effect to buttons
  addRippleEffect(zoomInBtn);
  addRippleEffect(zoomOutBtn);

  // Initialize zoom slider
  initZoomSlider();

  // Aspect ratio buttons
  document.querySelectorAll('.crop-aspect-btn').forEach(button => {
    button.addEventListener('click', function() {
      changeAspectRatio(this.dataset.ratio);
    });
  });

  // Expose the addCropIconToImage function to the global scope
  window.addCropIconToImage = addCropIconToImage;

  // Expose the cropped image to the global scope for compression
  window.getCroppedImage = function() {
    return croppedImage;
  };
});
