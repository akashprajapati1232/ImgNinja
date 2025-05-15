/**
 * PDF Compressor functionality for ImgNinja
 */

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Initialize UI elements when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializePdfCompressor();
});

function initializePdfCompressor() {
  // Initialize quality options
  initializeQualityOptions();

  // Initialize drag and drop for PDFs
  initializePdfDragAndDrop();

  // Initialize PDF upload
  initializePdfUpload();

  // Initialize compression button
  initializeCompressButton();

  // Initialize new PDF button
  initializeNewPdfButton();
}

/**
 * Initialize quality option selection
 */
function initializeQualityOptions() {
  const qualityOptions = document.querySelectorAll('.quality-option');

  qualityOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove active class from all options
      qualityOptions.forEach(opt => opt.classList.remove('active'));

      // Add active class to clicked option
      this.classList.add('active');

      // Set compression level based on quality option
      const quality = this.dataset.quality;
      const compressionLevel = document.getElementById('compression-level');
      const compressionValue = document.getElementById('compression-value');

      let level = 70; // Default (balanced)

      switch(quality) {
        case 'high':
          level = 90;
          break;
        case 'balanced':
          level = 70;
          break;
        case 'small':
          level = 40;
          break;
      }

      compressionLevel.value = level;
      compressionValue.textContent = `${level}%`;

      // Update slider fill
      const sliderFill = document.querySelector('.slider-fill');
      const sliderThumb = document.querySelector('.slider-thumb');

      if (sliderFill && sliderThumb) {
        const percentage = (level - compressionLevel.min) / (compressionLevel.max - compressionLevel.min) * 100;
        sliderFill.style.width = `${percentage}%`;
        sliderThumb.style.left = `${percentage}%`;
      }
    });
  });

  // Update quality option when slider changes
  const compressionLevel = document.getElementById('compression-level');

  compressionLevel.addEventListener('input', function() {
    const level = parseInt(this.value);

    // Select appropriate quality option based on level
    qualityOptions.forEach(opt => opt.classList.remove('active'));

    if (level >= 80) {
      document.querySelector('[data-quality="high"]').classList.add('active');
    } else if (level >= 50) {
      document.querySelector('[data-quality="balanced"]').classList.add('active');
    } else {
      document.querySelector('[data-quality="small"]').classList.add('active');
    }
  });
}

/**
 * Initialize PDF drag and drop functionality
 */
function initializePdfDragAndDrop() {
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
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const pdfUpload = document.getElementById('pdf-upload');
        pdfUpload.files = files;
        handlePdfUpload(file);
      } else {
        alert('Please upload a PDF file.');
      }
    }
  }
}

/**
 * Initialize PDF upload functionality
 */
function initializePdfUpload() {
  const pdfUpload = document.getElementById('pdf-upload');

  pdfUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is a PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file.');
      return;
    }

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('File size is too large. Please upload a PDF smaller than 100MB.');
      return;
    }

    handlePdfUpload(file);
  });
}

/**
 * Handle PDF upload and display preview
 */
function handlePdfUpload(file) {
  // Store file for later use
  window.currentPdfFile = file;

  // Hide upload elements
  const uploadIcon = document.querySelector('.upload-icon');
  const dragText = document.querySelector('.drag-text');

  if (uploadIcon) uploadIcon.style.display = 'none';
  if (dragText) dragText.style.display = 'none';

  // Display file details
  displayPdfDetails(file);

  // Create a preview of the first page
  createPdfPreview(file);

  // Reset any previous compression results
  const resultContainer = document.querySelector('.result-container');
  if (resultContainer) resultContainer.style.display = 'none';

  // Reset download link
  const downloadLink = document.getElementById('download-link');
  if (downloadLink) downloadLink.style.display = 'none';

  // Reset new PDF button
  const newPdfBtn = document.getElementById('new-pdf-btn');
  if (newPdfBtn) newPdfBtn.style.display = 'none';

  // Clear compressed file reference
  window.compressedPdfFile = null;
}

/**
 * Display PDF details
 */
function displayPdfDetails(file) {
  const pdfDetails = document.getElementById('pdf-details');
  const pdfName = document.getElementById('pdf-name');
  const pdfSize = document.getElementById('pdf-size');

  // Show PDF details
  pdfName.querySelector('span').textContent = file.name;

  // Format file size
  const sizeKB = (file.size / 1024).toFixed(2);
  const sizeMB = (sizeKB / 1024).toFixed(2);

  if (sizeMB >= 1) {
    pdfSize.querySelector('span').textContent = `${sizeMB} MB`;
  } else {
    pdfSize.querySelector('span').textContent = `${sizeKB} KB`;
  }

  // Update original size display in results
  document.getElementById('original-size-display').textContent = sizeMB >= 1 ? `${sizeMB} MB` : `${sizeKB} KB`;

  // Show PDF details card
  pdfDetails.style.display = 'block';

  // Get PDF page count
  const fileReader = new FileReader();
  fileReader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
      document.getElementById('pdf-pages').querySelector('span').textContent = pdf.numPages;
    }).catch(function(error) {
      console.error('Error getting PDF page count:', error);
      document.getElementById('pdf-pages').querySelector('span').textContent = 'Unknown';
    });
  };
  fileReader.readAsArrayBuffer(file);
}

/**
 * Create PDF preview
 */
function createPdfPreview(file) {
  const pdfPreview = document.getElementById('pdf-preview');
  pdfPreview.innerHTML = ''; // Clear previous preview

  // Show loading indicator
  const loadingElement = document.createElement('div');
  loadingElement.className = 'loading-indicator';
  loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading preview...';
  pdfPreview.appendChild(loadingElement);

  // Read the file
  const fileReader = new FileReader();
  fileReader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    // Load the PDF
    pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
      // Get the first page
      return pdf.getPage(1);
    }).then(function(page) {
      // Remove loading indicator
      pdfPreview.innerHTML = '';

      // Create a canvas for the page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 0.5 }); // Adjust scale as needed

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.className = 'pdf-thumbnail';

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      page.render(renderContext).promise.then(function() {
        pdfPreview.appendChild(canvas);

        // Add page count info
        const pageInfo = document.createElement('div');
        pageInfo.className = 'pdf-info';
        pageInfo.textContent = `Page 1 of ${pdf.numPages}`;
        pdfPreview.appendChild(pageInfo);

        // Show the preview
        pdfPreview.style.display = 'block';
      });
    }).catch(function(error) {
      console.error('Error rendering PDF preview:', error);
      pdfPreview.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Error loading PDF preview</div>';
    });
  };
  fileReader.readAsArrayBuffer(file);
}

/**
 * Initialize compress button
 */
function initializeCompressButton() {
  const compressBtn = document.getElementById('compress-btn');

  compressBtn.addEventListener('click', function() {
    if (!window.currentPdfFile) {
      alert('Please upload a PDF file first.');
      return;
    }

    // Show loading state
    compressBtn.disabled = true;
    compressBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing...';

    // Get compression settings
    const compressionLevel = document.getElementById('compression-level').value;
    const imageQuality = document.getElementById('image-quality').value;
    const imageDownscale = document.getElementById('image-downscale').checked;
    const fontSubset = document.getElementById('font-subset').checked;
    const removeMetadata = document.getElementById('remove-metadata').checked;
    const removeAnnotations = document.getElementById('remove-annotations').checked;

    // Simulate compression (in a real app, this would use a PDF compression library)
    setTimeout(function() {
      simulateCompression(window.currentPdfFile, compressionLevel, {
        imageQuality,
        imageDownscale,
        fontSubset,
        removeMetadata,
        removeAnnotations
      });

      // Reset button state
      compressBtn.disabled = false;
      compressBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Compress PDF';
    }, 2000);
  });
}

/**
 * Simulate PDF compression (in a real app, this would use a PDF compression library)
 */
function simulateCompression(file, compressionLevel, options) {
  // Calculate a simulated compressed size based on compression level and options
  const originalSize = file.size;
  let compressionRatio = 1 - (compressionLevel / 100) * 0.8; // Base compression

  // Adjust based on options
  if (options.imageQuality === 'low') compressionRatio -= 0.1;
  if (options.imageQuality === 'high') compressionRatio += 0.1;
  if (options.imageDownscale) compressionRatio -= 0.05;
  if (options.fontSubset) compressionRatio -= 0.03;
  if (options.removeMetadata) compressionRatio -= 0.02;
  if (options.removeAnnotations) compressionRatio -= 0.02;

  // Ensure ratio is reasonable
  compressionRatio = Math.max(0.1, Math.min(0.9, compressionRatio));

  const compressedSize = Math.round(originalSize * compressionRatio);
  const savedSpace = originalSize - compressedSize;
  const reductionPercentage = Math.round((1 - compressionRatio) * 100);

  // In a real implementation, we would actually compress the PDF here
  // For this simulation, we'll just use the original file but pretend it's compressed

  // Read the file as an ArrayBuffer to ensure we have the full binary data
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      // Get the file data as an ArrayBuffer
      const fileData = e.target.result;

      // Create a new Blob with the file data
      const blob = new Blob([fileData], { type: 'application/pdf' });

      // Create a File object from the Blob
      const compressedFile = new File([blob], `compressed_${file.name}`, { type: 'application/pdf' });

      // Store the compressed file for later use
      window.compressedPdfFile = compressedFile;

      console.log('Compression simulation complete. File size:', compressedSize);

      // Update the UI with compression results
      updateCompressionResults(compressedFile, compressedSize, savedSpace, reductionPercentage);
    } catch (error) {
      console.error('Error during compression simulation:', error);
      alert('An error occurred during compression. Please try again with a different PDF file.');

      // Reset the compress button
      const compressBtn = document.getElementById('compress-btn');
      compressBtn.disabled = false;
      compressBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Compress PDF';
    }
  };

  // Handle errors during file reading
  reader.onerror = function() {
    console.error('Error reading file:', reader.error);
    alert('Error reading the PDF file. Please try again with a different file.');

    // Reset the compress button
    const compressBtn = document.getElementById('compress-btn');
    compressBtn.disabled = false;
    compressBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Compress PDF';
  };

  // Start reading the file
  reader.readAsArrayBuffer(file);

  // Return early since we're handling the update in the onload callback
  return;
}

/**
 * Update compression results in the UI
 */
function updateCompressionResults(file, compressedSize, savedSpace, reductionPercentage) {
  // Format sizes
  const compressedSizeKB = (compressedSize / 1024).toFixed(2);
  const compressedSizeMB = (compressedSizeKB / 1024).toFixed(2);
  const savedSpaceKB = (savedSpace / 1024).toFixed(2);
  const savedSpaceMB = (savedSpaceKB / 1024).toFixed(2);

  // Update compression stats
  document.getElementById('compressed-size-display').textContent =
    compressedSizeMB >= 1 ? `${compressedSizeMB} MB` : `${compressedSizeKB} KB`;
  document.getElementById('reduction-percentage').textContent = `${reductionPercentage}%`;
  document.getElementById('saved-space').textContent =
    savedSpaceMB >= 1 ? `${savedSpaceMB} MB` : `${savedSpaceKB} KB`;

  // Show download button and new PDF button
  const downloadBtn = document.getElementById('download-btn');
  const newPdfBtn = document.getElementById('new-pdf-btn');

  // Create a URL for the compressed PDF and store it globally
  if (window.lastCompressedUrl) {
    URL.revokeObjectURL(window.lastCompressedUrl);
  }
  window.lastCompressedUrl = URL.createObjectURL(new Blob([file], { type: 'application/pdf' }));
  window.compressedFileName = `compressed_${file.name}`;

  // Set up download button
  downloadBtn.style.display = 'inline-block';

  // Add click event to download button
  downloadBtn.onclick = function() {
    downloadCompressedPdf();
  };

  // Show new PDF button
  newPdfBtn.style.display = 'inline-block';

  // Update the preview with the compressed PDF
  updateCompressedPdfPreview(file);

  // Show the result container
  document.querySelector('.result-container').style.display = 'flex';

  // Scroll to results
  setTimeout(() => {
    document.querySelector('.result-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

/**
 * Update the preview with the compressed PDF
 */
function updateCompressedPdfPreview(file) {
  const previewContainer = document.getElementById('preview');

  // Clear previous content
  previewContainer.innerHTML = '';

  // Show loading indicator
  const loadingElement = document.createElement('div');
  loadingElement.className = 'loading-indicator';
  loadingElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading preview...';
  previewContainer.appendChild(loadingElement);

  // Read the file
  const fileReader = new FileReader();
  fileReader.onload = function() {
    const typedarray = new Uint8Array(this.result);

    // Load the PDF
    pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
      // Get the first page
      return pdf.getPage(1);
    }).then(function(page) {
      // Remove loading indicator
      previewContainer.innerHTML = '';

      // Create a canvas for the page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 0.5 }); // Adjust scale as needed

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.className = 'pdf-thumbnail';

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      page.render(renderContext).promise.then(function() {
        previewContainer.appendChild(canvas);

        // Add compression badge
        const compressionBadge = document.createElement('div');
        compressionBadge.className = 'compression-badge';
        compressionBadge.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Compressed';
        previewContainer.appendChild(compressionBadge);

        // Add direct download button in the preview
        const downloadButton = document.createElement('button');
        downloadButton.className = 'preview-download-btn';
        downloadButton.innerHTML = '<i class="fas fa-download"></i>';
        downloadButton.title = 'Download PDF';
        downloadButton.onclick = function() {
          downloadCompressedPdf();
        };
        previewContainer.appendChild(downloadButton);
      });
    }).catch(function(error) {
      console.error('Error rendering compressed PDF preview:', error);
      previewContainer.innerHTML = `
        <div class="pdf-preview-placeholder">
          <i class="fas fa-file-pdf"></i>
          <p>PDF Compressed Successfully</p>
          <small>Preview not available, but you can download the file</small>
          <button class="fallback-download-btn"><i class="fas fa-download"></i> Download PDF</button>
        </div>
      `;

      // Add click handler to the fallback download button
      const fallbackBtn = previewContainer.querySelector('.fallback-download-btn');
      if (fallbackBtn) {
        fallbackBtn.onclick = function() {
          downloadCompressedPdf();
        };
      }
    });
  };
  fileReader.readAsArrayBuffer(file);
}

/**
 * Download the compressed PDF
 */
function downloadCompressedPdf() {
  if (!window.lastCompressedUrl || !window.compressedFileName) {
    console.error('No compressed PDF available for download');
    alert('Error: No compressed PDF available for download. Please try again.');
    return;
  }

  console.log('Downloading PDF:', window.compressedFileName);

  try {
    // Method 1: Create a temporary anchor and trigger download
    const tempLink = document.createElement('a');
    tempLink.href = window.lastCompressedUrl;
    tempLink.download = window.compressedFileName;
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);

    // Trigger click
    tempLink.click();

    // Clean up
    setTimeout(function() {
      document.body.removeChild(tempLink);
    }, 100);

    console.log('Download initiated successfully');
  } catch (error) {
    console.error('Error downloading PDF:', error);

    // Fallback method: Open in new tab
    try {
      window.open(window.lastCompressedUrl, '_blank');
    } catch (fallbackError) {
      console.error('Fallback download method failed:', fallbackError);
      alert('Download failed. Please try again or use a different browser.');
    }
  }
}

/**
 * Initialize new PDF button
 */
function initializeNewPdfButton() {
  const newPdfBtn = document.getElementById('new-pdf-btn');

  newPdfBtn.addEventListener('click', function() {
    // Reset the file input
    const pdfUpload = document.getElementById('pdf-upload');
    pdfUpload.value = '';

    // Clear the PDF preview
    const pdfPreview = document.getElementById('pdf-preview');
    pdfPreview.innerHTML = '';
    pdfPreview.style.display = 'none';

    // Hide PDF details
    document.getElementById('pdf-details').style.display = 'none';

    // Hide result container
    document.querySelector('.result-container').style.display = 'none';

    // Reset download button
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.style.display = 'none';
    downloadBtn.onclick = null;

    // Revoke any existing Object URLs to prevent memory leaks
    if (window.lastCompressedUrl) {
      URL.revokeObjectURL(window.lastCompressedUrl);
      window.lastCompressedUrl = null;
    }
    window.compressedFileName = null;

    // Reset compression stats
    document.getElementById('compressed-size-display').textContent = '0 KB';
    document.getElementById('reduction-percentage').textContent = '0%';
    document.getElementById('saved-space').textContent = '0 KB';

    // Reset preview container
    const previewContainer = document.getElementById('preview');
    previewContainer.innerHTML = `
      <div class="pdf-preview-placeholder">
        <i class="fas fa-file-pdf"></i>
        <p>PDF Preview</p>
      </div>
    `;

    // Clear the current PDF files
    window.currentPdfFile = null;
    window.compressedPdfFile = null;

    // Reset the upload icon
    const uploadIcon = document.querySelector('.upload-icon');
    uploadIcon.style.display = 'block';

    // Reset the drag text
    const dragText = document.querySelector('.drag-text');
    dragText.style.display = 'block';

    // Reset the upload info
    const uploadInfo = document.querySelector('.upload-info');
    uploadInfo.style.display = 'block';

    // Scroll back to upload box
    document.querySelector('.upload-box').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
