// components/ImageProcessor.js

"use client";

import { useState, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function ImageProcessor() {
  const [images, setImages] = useState([]);
  const imgElement = useRef(null);
  const [currentImgUrl, setCurrentImgUrl] = useState(null);
  const [filters, setFilters] = useState({
    exposure: 0,
    contrast: 1,
    saturation: 1,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
  });
  const canvasRef = useRef(null);
  const [zipUploaded, setZipUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Handle zip file input
  const handleZipUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const jszip = new JSZip();
    const zip = await jszip.loadAsync(file);
    const loadedImages = [];

    for (const [filename, fileData] of Object.entries(zip.files)) {
      if (!fileData.dir && /\.(jpg|jpeg|png|webp)$/i.test(filename)) {
        const imgBlob = await fileData.async('blob');
        const imgUrl = URL.createObjectURL(imgBlob);
        loadedImages.push({ filename, url: imgUrl });
      }
    }

    if (loadedImages.length > 0) {
      setImages(loadedImages);
      setZipUploaded(true);
    } else {
      alert('No valid image files found in the zip!');
    }
  };

  // Load and display image on canvas
  const loadImage = (src) => {
    const img = new Image();
    img.src = src;

    // Revoke any previously loaded image URL to free memory
    if (currentImgUrl) {
      URL.revokeObjectURL(currentImgUrl);
    }
    setCurrentImgUrl(src);

    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      // Resize the canvas to fit the image
      canvas.width = img.width;
      canvas.height = img.height;
      imgElement.current = img; // Set the image in the ref
      applyFilters(); // Apply filters after image is loaded
    };

    img.onerror = () => {
      console.error('Error loading image');
      alert('Error loading image. Please ensure the file is a valid image format.');
    };
  };

  // Apply image adjustments and draw on canvas
  const applyFilters = () => {
    if (!imgElement.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    applyFiltersToCanvas(ctx, canvas, imgElement.current);
  };

  const applyFiltersToCanvas = (ctx, canvas, img) => {
    if (!img) return;

    // Draw the original image
    ctx.drawImage(img, 0, 0);

    let { exposure, contrast, saturation, temperature, tint, highlights, shadows } = filters;

    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imgData.data;

    // Process each pixel to apply the filters
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply Exposure
      r = r + 255 * exposure;
      g = g + 255 * exposure;
      b = b + 255 * exposure;

      // Apply Contrast
      r = (r - 128) * contrast + 128;
      g = (g - 128) * contrast + 128;
      b = (b - 128) * contrast + 128;

      // Apply Saturation
      let avg = (r + g + b) / 3;
      r = avg + (r - avg) * saturation;
      g = avg + (g - avg) * saturation;
      b = avg + (b - avg) * saturation;

      // Apply Temperature and Tint
      r += temperature + tint;
      g += tint;
      b -= temperature;

      // Apply Highlights and Shadows
      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (lum > 128) {
        // Highlights
        r += (r - 128) * highlights;
        g += (g - 128) * highlights;
        b += (b - 128) * highlights;
      } else {
        // Shadows
        r += (r - 128) * shadows;
        g += (g - 128) * shadows;
        b += (b - 128) * shadows;
      }

      // Clamp values between 0 and 255
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imgData, 0, 0);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: parseFloat(e.target.value),
    });
    applyFilters();
  };

  // Process all images
  const processAllImages = async () => {
    if (images.length === 0) {
      alert('Please upload a zip file containing images first.');
      return;
    }

    setProcessing(true);
    const processedZip = new JSZip();

    for (let i = 0; i < images.length; i++) {
      await new Promise((resolve) => {
        const img = new Image();
        img.src = images[i].url;

        img.onload = () => {
          // Create a new canvas for processing
          const processingCanvas = document.createElement('canvas');
          const ctx = processingCanvas.getContext('2d');
          processingCanvas.width = img.width;
          processingCanvas.height = img.height;
          applyFiltersToCanvas(ctx, processingCanvas, img);
          const imageDataUrl = processingCanvas.toDataURL('image/png');
          const base64Data = imageDataUrl.split(',')[1];
          processedZip.file(images[i].filename, base64Data, { base64: true });
          resolve();
        };

        img.onerror = () => {
          console.error(`Error processing image ${images[i].filename}`);
          resolve();
        };
      });
    }

    // Generate the zip file and trigger download
    processedZip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, 'processed_images.zip');
      setProcessing(false);
    });
  };

  return (
    <div className="flex justify-center items-center" style={{background:'white',border: '1px solid black',borderRadius:5,padding:10, margin:10}}>
      <div className="bg-white/10 backdrop-blur-md border-2 border-white rounded-lg p-8 m-4 max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Batch Image Processor</h1>

        <div className="flex flex-col items-center">
          <input
            type="file"
            accept=".zip"
            onChange={handleZipUpload}
            className="mb-4 text-white"
          />
          <div className="flex flex-wrap justify-center mb-6">
            <button
              onClick={() => loadImage(images[0]?.url)}
              disabled={!zipUploaded}
              className={`px-4 py-2 mr-2 mb-4 text-white ${
                zipUploaded
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-500 cursor-not-allowed'
              } rounded`}
            >
              Load First Image
            </button><br />
            <button
              onClick={processAllImages}
              disabled={!zipUploaded || processing}
              className={`px-4 py-2 text-white ${
                zipUploaded && !processing
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-500 cursor-not-allowed'
              } rounded`}
            >
              {processing ? 'Processing...' : 'Apply to All Images and Download'}
            </button>
          </div>

          <div className="mb-6">
            <canvas
              ref={canvasRef}
              className="border border-gray-300"
              style={{ maxHeight: '500px' }}
            ></canvas>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {Object.keys(filters).map((filter) => (
              <div key={filter} className="flex flex-col items-center">
                <label className="block font-medium text-white mb-2">
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}:
                </label>
                <input
                  type="range"
                  name={filter}
                  min={
                    filter === 'contrast' || filter === 'saturation'
                      ? 0
                      : filter === 'temperature' || filter === 'tint'
                      ? -100
                      : -1
                  }
                  max={
                    filter === 'contrast' || filter === 'saturation'
                      ? 3
                      : filter === 'temperature' || filter === 'tint'
                      ? 100
                      : 1
                  }
                  step={filter === 'temperature' || filter === 'tint' ? 1 : 0.01}
                  value={filters[filter]}
                  onChange={handleFilterChange}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
