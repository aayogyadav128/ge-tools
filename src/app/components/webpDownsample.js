'use client'
import { useState } from "react";
import JSZip from "jszip";

export default function PngToWebpConverter() {
  const [downsamplePercentage, setDownsamplePercentage] = useState(100);
  const [inputFile, setInputFile] = useState(null);

  // Update slider value display
  const handleSliderChange = (e) => {
    setDownsamplePercentage(e.target.value);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setInputFile(e.target.files[0]);
  };

  // Function to convert PNG to WebP and handle download
  const convertAndDownload = async () => {
    if (!inputFile) {
      alert("Please select a zip file first.");
      return;
    }

    const zip = new JSZip();
    const outputZip = new JSZip();
    const reader = new FileReader();

    reader.onload = async function (event) {
      try {
        const zipContent = await zip.loadAsync(event.target.result);
        const promises = [];

        zipContent.forEach(async (relativePath, file) => {
          if (file.name.endsWith(".png")) {
            promises.push(
              file.async("blob").then(async (pngBlob) => {
                const webpBlob = await convertToWebP(
                  pngBlob,
                  downsamplePercentage
                );
                outputZip.file(file.name.replace(".png", ".webp"), webpBlob);
              })
            );
          }
        });

        await Promise.all(promises);

        // Generate the output zip file and trigger download
        outputZip.generateAsync({ type: "blob" }).then(function (content) {
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(content);
          downloadLink.download = "converted_images.zip";
          downloadLink.click();
        });
      } catch (err) {
        console.error(err);
        alert("Error processing the zip file. Make sure it contains PNG files.");
      }
    };

    reader.readAsArrayBuffer(inputFile);
  };

  // Function to convert PNG blob to WebP
  const convertToWebP = (pngBlob, downsamplePercentage) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(pngBlob);

      img.onload = function () {
        const canvas = document.createElement("canvas");

        // Calculate new width and height based on downsample percentage
        const width = img.width * (downsamplePercentage / 100);
        const height = img.height * (downsamplePercentage / 100);

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((webpBlob) => {
          resolve(webpBlob);
        }, "image/webp");
      };

      img.onerror = function () {
        reject(new Error("Failed to load PNG image."));
      };
    });
  };

  return (
    <div style={styles.container}>
      <h2>Convert PNG to WebP with Optional Downsampling</h2>

      <input type="file" accept=".zip" onChange={handleFileChange} style={styles.input} />

      <div style={styles.sliderContainer}>
        <label htmlFor="downsampleRange">Downsample (1-100%): </label>
        <input
          type="range"
          id="downsampleRange"
          min="1"
          max="100"
          value={downsamplePercentage}
          onChange={handleSliderChange}
        />
        <span>{downsamplePercentage}%</span>
      </div>

      <button onClick={convertAndDownload} style={styles.button}>
        Convert and Download
      </button>
    </div>
  );
}

// Styles for the component
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    flexDirection: "column",
    background: 'white',
  },
  input: {
    margin: "20px 0",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    margin: "20px 0",
  },
  sliderContainer: {
    marginBottom: "20px",
  },
};
