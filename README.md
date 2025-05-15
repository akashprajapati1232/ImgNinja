# ImgNinja

**ImgNinja** is a powerful, free, privacy-focused online tool for compressing and optimizing images and documents directly in your browser. It supports a wide range of image formats and provides advanced compression technology to reduce file size while preserving visual quality.

## Features

- **Multi-format Image Support:** Compress JPG, JPEG, PNG, WEBP, GIF, HEIF/HEIC, ICO, and SVG images.
- **PDF Compressor:** Reduce the size of PDF documents while maintaining readability and quality.
- **File Converter:** Convert images and documents between various formats (e.g., JPG to PNG, PDF to DOCX, etc.).
- **No Quality Loss:** Advanced algorithms ensure minimal quality loss while reducing file size by up to 90%.
- **Manual Compression Settings:**
  - Adjust compression quality with a slider.
  - Resize image dimensions (maintain aspect ratio).
  - Set a target file size (in KB).
- **Image Details:** View image dimensions in px, mm, cm, and file size before and after compression.
- **Preview & Download:** Preview the compressed or converted file and download it instantly.
- **Privacy First:** All processing is done in your browser. Files are never uploaded to any server.
- **Modern UI:** Responsive, user-friendly interface with dark mode and mobile support.
- **Additional Tools:** Image resizer and image editor (coming soon).

## How It Works

1. **Upload Your Image or PDF:** Drag and drop or select a file from your device.
2. **Adjust Settings:** Choose compression level, resize dimensions, set a target file size, or select conversion format.
3. **Compress or Convert:** Click the appropriate button to optimize or convert your file.
4. **Download:** Preview and download your optimized or converted file.

## Technology

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Libraries:**
  - [Cropper.js](https://github.com/fengyuanchen/cropperjs) for cropping functionality
  - [libheif.js](https://github.com/strukturag/libheif-js) for HEIF/HEIC support
  - [Font Awesome](https://fontawesome.com/) for icons
- **No Backend:** 100% client-side processing for maximum privacy

## Project Structure

```
ImgNinja/
├── index.html
├── file-converter.html
├── pdf-compressor.html
├── assets/
│   ├── favicon-imgNinja.png
│   ├── logo-imgNinja.png
│   └── ...
├── css/
│   ├── styles.css
│   ├── responsive.css
│   ├── crop.css
│   └── ...
├── js/
│   ├── script.js
│   ├── crop.js
│   ├── edit.js
│   └── ...
├── pages/
│   ├── about-us.html
│   ├── contact-us.html
│   └── ...
└── blog/
    └── ...
```

## Getting Started

1. **Clone or Download:**
   - Download the repository or clone it using:
     ```
     git clone <repo-url>
     ```
2. **Open `index.html`:**
   - Open `index.html` in your web browser. No build or server required.

## Credits

- Powered by open-source libraries and the web community

## License

This project is free to use for personal and commercial purposes. See `LICENSE` for more details.

---

**ImgNinja** – Optimize your images, PDFs, and documents, fast and free, with privacy in mind!
