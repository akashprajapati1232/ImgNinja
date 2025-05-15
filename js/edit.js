// Edit Feature Implementation
(function() {
  // Variables
  let canvas = null;
  let ctx = null;
  let originalImage = null;

  // Settings
  let settings = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    hue: 0,
    sharpness: 0,
    gamma: 1,
    temperature: 0,
    filter: 'none'
  };

  // DOM Elements
  const editModal = document.createElement('div');
  editModal.className = 'edit-modal';
  editModal.innerHTML = `
    <div class="edit-modal-content">
      <div class="edit-modal-header">
        <h2 class="edit-modal-title"><i class="fas fa-edit"></i> Edit Image</h2>
        <span class="edit-close"><i class="fas fa-times"></i></span>
      </div>
      <div class="edit-container">
        <canvas id="edit-canvas" class="edit-img"></canvas>
      </div>
      <div class="edit-tabs">
        <button class="edit-tab active" data-tab="filters"><i class="fas fa-filter"></i> Filters</button>
        <button class="edit-tab" data-tab="adjust"><i class="fas fa-sliders-h"></i> Adjustments</button>
      </div>
      <div class="edit-controls">
        <!-- Filters Panel -->
        <div class="edit-panel active" id="filters-panel">
          <div class="edit-button-group">
            <button class="edit-button active" data-filter="none">None</button>
            <button class="edit-button" data-filter="grayscale">Grayscale</button>
            <button class="edit-button" data-filter="sepia">Sepia</button>
            <button class="edit-button" data-filter="invert">Invert</button>
            <button class="edit-button" data-filter="blur">Blur</button>
            <button class="edit-button" data-filter="sharpen">Sharpen</button>
            <button class="edit-button" data-filter="vintage">Vintage</button>
            <button class="edit-button" data-filter="cool">Cool</button>
            <button class="edit-button" data-filter="warm">Warm</button>
          </div>
        </div>

        <!-- Adjustments Panel -->
        <div class="edit-panel" id="adjust-panel">
          <div class="edit-slider-container">
            <div class="edit-slider-label">Brightness</div>
            <div class="edit-slider-controls">
              <div class="edit-slider-track">
                <div class="edit-slider-fill" style="width: 50%"></div>
                <input type="range" class="edit-slider" id="brightness" min="-100" max="100" value="0" step="1">
              </div>
              <div class="edit-slider-actions">
                <button class="edit-slider-reset" data-slider="brightness" title="Reset to 0"><i class="fas fa-undo-alt"></i></button>
                <input type="number" class="edit-slider-input" data-slider="brightness" min="-100" max="100" value="0">
              </div>
            </div>
          </div>

          <div class="edit-slider-container">
            <div class="edit-slider-label">Contrast</div>
            <div class="edit-slider-controls">
              <div class="edit-slider-track">
                <div class="edit-slider-fill" style="width: 50%"></div>
                <input type="range" class="edit-slider" id="contrast" min="-100" max="100" value="0" step="1">
              </div>
              <div class="edit-slider-actions">
                <button class="edit-slider-reset" data-slider="contrast" title="Reset to 0"><i class="fas fa-undo-alt"></i></button>
                <input type="number" class="edit-slider-input" data-slider="contrast" min="-100" max="100" value="0">
              </div>
            </div>
          </div>

          <div class="edit-slider-container">
            <div class="edit-slider-label">Saturation</div>
            <div class="edit-slider-controls">
              <div class="edit-slider-track">
                <div class="edit-slider-fill" style="width: 50%"></div>
                <input type="range" class="edit-slider" id="saturation" min="-100" max="100" value="0" step="1">
              </div>
              <div class="edit-slider-actions">
                <button class="edit-slider-reset" data-slider="saturation" title="Reset to 0"><i class="fas fa-undo-alt"></i></button>
                <input type="number" class="edit-slider-input" data-slider="saturation" min="-100" max="100" value="0">
              </div>
            </div>
          </div>

          <div class="edit-slider-container">
            <div class="edit-slider-label">Exposure</div>
            <div class="edit-slider-controls">
              <div class="edit-slider-track">
                <div class="edit-slider-fill" style="width: 50%"></div>
                <input type="range" class="edit-slider" id="exposure" min="-100" max="100" value="0" step="1">
              </div>
              <div class="edit-slider-actions">
                <button class="edit-slider-reset" data-slider="exposure" title="Reset to 0"><i class="fas fa-undo-alt"></i></button>
                <input type="number" class="edit-slider-input" data-slider="exposure" min="-100" max="100" value="0">
              </div>
            </div>
          </div>

          <div class="edit-slider-container">
            <div class="edit-slider-label">Temperature</div>
            <div class="edit-slider-controls">
              <div class="edit-slider-track">
                <div class="edit-slider-fill" style="width: 50%"></div>
                <input type="range" class="edit-slider" id="temperature" min="-100" max="100" value="0" step="1">
              </div>
              <div class="edit-slider-actions">
                <button class="edit-slider-reset" data-slider="temperature" title="Reset to 0"><i class="fas fa-undo-alt"></i></button>
                <input type="number" class="edit-slider-input" data-slider="temperature" min="-100" max="100" value="0">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="edit-actions">
        <button class="edit-action-btn edit-cancel-btn" id="edit-cancel"><i class="fas fa-times"></i> Cancel</button>
        <button class="edit-action-btn edit-apply-btn" id="edit-apply"><i class="fas fa-check"></i> Apply</button>
      </div>
    </div>
  `;
  document.body.appendChild(editModal);

  // Function to add edit icon to the uploaded image
  function addEditIconToImage() {
    const imagePreview = document.getElementById('image-preview');
    if (!imagePreview || !imagePreview.querySelector('img')) return;

    // Check if edit icon already exists
    if (imagePreview.querySelector('.edit-icon-container')) return;

    const editIconContainer = document.createElement('div');
    editIconContainer.className = 'edit-icon-container tooltip';
    editIconContainer.innerHTML = '<i class="fas fa-edit edit-icon"></i><span class="tooltip-text">Click to edit image</span>';
    editIconContainer.addEventListener('click', openEditModal);

    imagePreview.style.position = 'relative';
    imagePreview.appendChild(editIconContainer);
  }

  // Function to open the edit modal
  function openEditModal() {
    const imagePreview = document.getElementById('image-preview');
    const img = imagePreview.querySelector('img');

    if (!img) return;

    // Reset settings
    resetSettings();

    // Initialize canvas
    canvas = document.getElementById('edit-canvas');
    ctx = canvas.getContext('2d');

    // Load the image
    originalImage = new Image();
    originalImage.onload = function() {
      // Set canvas dimensions to match image
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;

      // Draw the image on the canvas
      ctx.drawImage(originalImage, 0, 0);

      // Show the modal
      editModal.style.display = 'block';
    };
    originalImage.src = img.src;
  }

  // Function to close the edit modal
  function closeEditModal() {
    editModal.style.display = 'none';
    resetSettings();
  }

  // Function to reset all settings
  function resetSettings() {
    settings = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      exposure: 0,
      hue: 0,
      sharpness: 0,
      gamma: 1,
      temperature: 0,
      filter: 'none'
    };

    // Reset all sliders
    document.querySelectorAll('.edit-slider').forEach(slider => {
      slider.value = slider.getAttribute('value');
      updateSliderFill(slider);
      const valueDisplay = slider.closest('.edit-slider-container').querySelector('.edit-slider-value');
      if (valueDisplay) {
        valueDisplay.textContent = slider.value;
      }
    });

    // Reset all buttons
    document.querySelectorAll('.edit-button').forEach(button => {
      button.classList.remove('active');
      if (button.dataset.filter === 'none') {
        button.classList.add('active');
      }
    });

    // Reset tab
    document.querySelectorAll('.edit-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === 'filters') {
        tab.classList.add('active');
      }
    });

    document.querySelectorAll('.edit-panel').forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === 'filters-panel') {
        panel.classList.add('active');
      }
    });
  }

  // Function to apply edits and return the edited image
  function applyEdit() {
    if (!canvas || !ctx || !originalImage) return null;

    // Apply all edits to get final image
    applyAllEdits();

    // Convert canvas to blob
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/png');
    });
  }

  // Function to apply all edits to the canvas
  function applyAllEdits() {
    // Start with the original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0);

    // Apply adjustments
    applyAdjustments();

    // Apply filter
    applyFilter();
  }

  // Make functions available globally
  window.addEditIconToImage = addEditIconToImage;
  window.getEditedImage = async function() {
    return await applyEdit();
  };
  window.resetEditState = function() {
    // Reset any edit state if needed
    resetSettings();

    // Close the edit modal if it's open
    if (editModal.style.display === 'block') {
      closeEditModal();
    }
  };

  // Event Listeners
  document.querySelector('.edit-close').addEventListener('click', closeEditModal);
  document.getElementById('edit-cancel').addEventListener('click', closeEditModal);
  document.getElementById('edit-apply').addEventListener('click', async function() {
    const editedBlob = await applyEdit();
    if (editedBlob) {
      // Update the image in the preview
      const imagePreview = document.getElementById('image-preview');
      const img = imagePreview.querySelector('img');
      if (img) {
        const url = URL.createObjectURL(editedBlob);
        img.src = url;
      }
      closeEditModal();
    }
  });

  // Tab switching
  document.querySelectorAll('.edit-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.dataset.tab;

      // Update active tab
      document.querySelectorAll('.edit-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Show corresponding panel
      document.querySelectorAll('.edit-panel').forEach(panel => panel.classList.remove('active'));
      document.getElementById(`${tabId}-panel`).classList.add('active');
    });
  });

  // Initialize event listeners for sliders, buttons, etc.
  function initializeControls() {
    // Sliders
    document.querySelectorAll('.edit-slider').forEach(slider => {
      // Handle both input and change events for better mobile support
      ['input', 'change', 'touchmove', 'touchend'].forEach(eventType => {
        slider.addEventListener(eventType, function() {
          // Update the fill
          updateSliderFill(this);

          // Update the number input
          const sliderId = this.id;
          const numberInput = document.querySelector(`.edit-slider-input[data-slider="${sliderId}"]`);
          if (numberInput) {
            numberInput.value = this.value;
          }

          // Update settings
          settings[this.id] = parseFloat(this.value);

          // Apply changes
          applyAllEdits();
        });
      });

      // Prevent default touch behavior to avoid page scrolling while using sliders
      slider.addEventListener('touchstart', function(e) {
        e.stopPropagation();
        // Don't prevent default here to allow the slider to receive the touch
      }, { passive: true });

      // Initialize slider fill
      updateSliderFill(slider);
    });

    // Number inputs
    document.querySelectorAll('.edit-slider-input').forEach(input => {
      // Handle multiple events for better mobile support
      ['input', 'change', 'blur'].forEach(eventType => {
        input.addEventListener(eventType, function() {
          const sliderId = this.dataset.slider;
          const slider = document.getElementById(sliderId);

          // Ensure value is within range
          let value = parseInt(this.value);
          if (isNaN(value)) value = 0;

          const min = parseInt(this.min);
          const max = parseInt(this.max);

          if (value < min) value = min;
          if (value > max) value = max;

          this.value = value;

          // Update slider
          if (slider) {
            slider.value = value;
            updateSliderFill(slider);

            // Update settings
            settings[sliderId] = parseFloat(value);
          }

          // Apply changes
          applyAllEdits();
        });
      });

      // Add focus handling for mobile keyboards
      input.addEventListener('focus', function() {
        // Select all text when focused for easier editing
        this.select();
      });

      // Handle keyboard submission
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          this.blur(); // Remove focus to hide keyboard on mobile
        }
      });
    });

    // Reset buttons
    document.querySelectorAll('.edit-slider-reset').forEach(button => {
      button.addEventListener('click', function() {
        const sliderId = this.dataset.slider;
        const slider = document.getElementById(sliderId);
        const numberInput = document.querySelector(`.edit-slider-input[data-slider="${sliderId}"]`);

        // Reset to 0
        if (slider) {
          slider.value = 0;
          updateSliderFill(slider);

          // Update settings
          settings[sliderId] = 0;
        }

        if (numberInput) {
          numberInput.value = 0;
        }

        // Add animation class
        this.classList.add('resetting');
        setTimeout(() => this.classList.remove('resetting'), 500);

        // Apply changes
        applyAllEdits();
      });
    });

    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.addEventListener('click', function() {
        // Update active state
        document.querySelectorAll('[data-filter]').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // Update settings
        settings.filter = this.dataset.filter;

        // Apply changes
        applyAllEdits();
      });
    });
  }



  // Apply adjustments to the image
  function applyAdjustments() {
    if (!canvas || !ctx) return;

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply adjustments to each pixel
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Convert to HSL for some adjustments
      const hsl = rgbToHsl(r, g, b);

      // Apply brightness
      if (settings.brightness !== 0) {
        const factor = 1 + settings.brightness / 100;
        r = Math.min(255, Math.max(0, r * factor));
        g = Math.min(255, Math.max(0, g * factor));
        b = Math.min(255, Math.max(0, b * factor));
      }

      // Apply contrast
      if (settings.contrast !== 0) {
        const factor = (259 * (settings.contrast + 100)) / (100 * (259 - settings.contrast));
        r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
        g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
        b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
      }

      // Apply saturation
      if (settings.saturation !== 0) {
        hsl[1] = Math.min(1, Math.max(0, hsl[1] * (1 + settings.saturation / 100)));
        const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
      }

      // Apply exposure
      if (settings.exposure !== 0) {
        const factor = Math.pow(2, settings.exposure / 100);
        r = Math.min(255, Math.max(0, r * factor));
        g = Math.min(255, Math.max(0, g * factor));
        b = Math.min(255, Math.max(0, b * factor));
      }

      // Apply hue
      if (settings.hue !== 0) {
        hsl[0] = (hsl[0] + settings.hue / 360) % 1;
        const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];
      }

      // Apply gamma
      if (settings.gamma !== 1) {
        r = Math.min(255, Math.max(0, Math.pow(r / 255, 1 / settings.gamma) * 255));
        g = Math.min(255, Math.max(0, Math.pow(g / 255, 1 / settings.gamma) * 255));
        b = Math.min(255, Math.max(0, Math.pow(b / 255, 1 / settings.gamma) * 255));
      }

      // Apply temperature
      if (settings.temperature !== 0) {
        // Warm (add red, reduce blue)
        if (settings.temperature > 0) {
          const factor = settings.temperature / 100;
          r = Math.min(255, r + (255 - r) * factor);
          b = Math.max(0, b - b * factor * 0.5);
        }
        // Cool (add blue, reduce red)
        else {
          const factor = -settings.temperature / 100;
          b = Math.min(255, b + (255 - b) * factor);
          r = Math.max(0, r - r * factor * 0.5);
        }
      }

      // Update pixel data
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    // Put the image data back
    ctx.putImageData(imageData, 0, 0);
  }

  // Apply filter to the image
  function applyFilter() {
    if (!canvas || !ctx || settings.filter === 'none') return;

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (settings.filter) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        break;

      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        break;

      case 'invert':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
        break;

      case 'blur':
        // Simple box blur
        ctx.putImageData(imageData, 0, 0);
        ctx.filter = 'blur(5px)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
        return; // Skip the putImageData below

      case 'sharpen':
        // Apply sharpening using a convolution filter
        const w = canvas.width;
        const h = canvas.height;
        const tempData = new Uint8ClampedArray(data);

        // Sharpen kernel
        const kernel = [
          0, -1, 0,
          -1, 5, -1,
          0, -1, 0
        ];

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;

            let r = 0, g = 0, b = 0;

            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const kidx = ((y + ky) * w + (x + kx)) * 4;
                const kval = kernel[(ky + 1) * 3 + (kx + 1)];

                r += tempData[kidx] * kval;
                g += tempData[kidx + 1] * kval;
                b += tempData[kidx + 2] * kval;
              }
            }

            data[idx] = Math.min(255, Math.max(0, r));
            data[idx + 1] = Math.min(255, Math.max(0, g));
            data[idx + 2] = Math.min(255, Math.max(0, b));
          }
        }
        break;

      case 'vintage':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          data[i] = Math.min(255, (r * 0.9) + (g * 0.1) + 10);
          data[i + 1] = Math.min(255, (g * 0.8) + (r * 0.1) + 10);
          data[i + 2] = Math.min(255, (b * 0.6) + (r * 0.1) + 10);
        }
        break;

      case 'cool':
        for (let i = 0; i < data.length; i += 4) {
          data[i + 2] = Math.min(255, data[i + 2] + 30); // Increase blue
          data[i] = Math.max(0, data[i] - 10); // Decrease red
        }
        break;

      case 'warm':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] + 30); // Increase red
          data[i + 2] = Math.max(0, data[i + 2] - 10); // Decrease blue
        }
        break;
    }

    // Put the image data back
    ctx.putImageData(imageData, 0, 0);
  }



  // Helper function to update slider fill
  function updateSliderFill(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const percentage = ((val - min) / (max - min)) * 100;

    const fill = slider.closest('.edit-slider-track').querySelector('.edit-slider-fill');
    if (fill) {
      fill.style.width = `${percentage}%`;
    }
  }

  // Helper function to convert RGB to HSL
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h /= 6;
    }

    return [h, s, l];
  }

  // Helper function to convert HSL to RGB
  function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // Initialize controls when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', initializeControls);
})();
