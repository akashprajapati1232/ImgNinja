// File Converter Script
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-upload');
  const fileDetails = document.getElementById('file-details');
  const fileName = document.getElementById('file-name').querySelector('span');
  const fileSize = document.getElementById('file-size').querySelector('span');
  const fileType = document.getElementById('file-type').querySelector('span');
  const convertBtn = document.getElementById('convert-btn');
  const downloadBtn = document.getElementById('download-btn');
  const newFileBtn = document.getElementById('new-file-btn');
  const formatOptions = document.querySelectorAll('.format-option');
  
  // Variables
  let selectedFile = null;
  let selectedFormat = null;
  
  // Event Listeners
  fileInput.addEventListener('change', handleFileSelect);
  convertBtn.addEventListener('click', handleConversion);
  downloadBtn.addEventListener('click', handleDownload);
  newFileBtn.addEventListener('click', resetConverter);
  
  // Format selection
  formatOptions.forEach(option => {
    option.addEventListener('click', function() {
      formatOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
      selectedFormat = this.getAttribute('data-format');
      
      // Enable convert button if both file and format are selected
      if (selectedFile && selectedFormat) {
        convertBtn.disabled = false;
      }
    });
  });
  
  // Drag and drop functionality
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
    dropArea.classList.add('drag-over');
  }
  
  function unhighlight() {
    dropArea.classList.remove('drag-over');
  }
  
  dropArea.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length) {
      fileInput.files = files;
      handleFileSelect();
    }
  }
  
  // File handling functions
  function handleFileSelect() {
    if (fileInput.files.length) {
      selectedFile = fileInput.files[0];
      displayFileDetails(selectedFile);
      
      // Enable convert button if both file and format are selected
      if (selectedFile && selectedFormat) {
        convertBtn.disabled = false;
      }
    }
  }
  
  function displayFileDetails(file) {
    // Show file details card
    fileDetails.style.display = 'block';
    
    // Update file details
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileType.textContent = file.type || 'Unknown';
    
    // Scroll to file details
    fileDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function handleConversion() {
    // This is a simulation - in a real app, you would perform actual conversion
    convertBtn.disabled = true;
    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
    
    // Simulate conversion process
    setTimeout(() => {
      convertBtn.style.display = 'none';
      downloadBtn.style.display = 'inline-flex';
      newFileBtn.style.display = 'inline-flex';
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'comment-box';
      successMessage.style.backgroundColor = '#e8f5e9'; // Light green
      successMessage.style.borderLeftColor = '#4caf50'; // Green
      successMessage.style.color = '#2e7d32'; // Dark green
      
      successMessage.innerHTML = `
        <h3><i class="fas fa-check-circle"></i> Conversion Complete</h3>
        <p>Your file has been successfully converted to ${selectedFormat.toUpperCase()}. Click the download button to save it.</p>
      `;
      
      // Insert before the action buttons
      document.querySelector('.action-buttons').before(successMessage);
      
      // Scroll to success message
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 2000);
  }
  
  function handleDownload() {
    // In a real app, this would download the actual converted file
    // For this demo, we'll just simulate a download
    
    // Create a dummy blob
    const blob = new Blob(['Dummy file content'], { type: 'text/plain' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name.split('.')[0]}.${selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
  
  function resetConverter() {
    // Reset state
    selectedFile = null;
    fileInput.value = '';
    fileDetails.style.display = 'none';
    
    // Reset UI
    convertBtn.disabled = true;
    convertBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Convert File';
    convertBtn.style.display = 'inline-flex';
    downloadBtn.style.display = 'none';
    newFileBtn.style.display = 'none';
    
    // Remove success message if exists
    const successMessage = document.querySelector('.comment-box');
    if (successMessage && successMessage.querySelector('h3').textContent.includes('Conversion Complete')) {
      successMessage.remove();
    }
    
    // Scroll to top of container
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  // Initialize
  convertBtn.disabled = true;
});
