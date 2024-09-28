// src/app/api/upload/route.js
import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import sizeOf from 'image-size';
import { promises as fsPromises } from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export const POST = async (req) => {
  let tempDir = null;
  try {
    // Parse the form data
    const formData = await req.formData();
    const zipFile = formData.get('zipFile');
    const fps = parseInt(formData.get('fps'), 10);

    // Create a temporary directory to extract the zip file
    tempDir = path.join(os.tmpdir(), uuidv4());
    await fsPromises.mkdir(tempDir, { recursive: true });

    // Get the zip file as a buffer
    const arrayBuffer = await zipFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Load the zip with JSZip
    const zip = await JSZip.loadAsync(buffer);

    // Filter image files (only PNG and JPEG)
    const imageFiles = Object.keys(zip.files).filter((fileName) => {
      return fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
    });

    // Sort the images (assuming they are named in order)
    imageFiles.sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Process each image, convert it to base64, and get dimensions
    const images = [];
    for (const imageFile of imageFiles) {
      const file = zip.file(imageFile);
      if (file) {
        const imageData = await file.async('nodebuffer'); // Get image as Buffer

        // Ensure directory exists before writing
        const imgPath = path.join(tempDir, imageFile);
        const imgDir = path.dirname(imgPath);
        await fsPromises.mkdir(imgDir, { recursive: true });

        await fsPromises.writeFile(imgPath, imageData);
        console.log('Image written to:', imgPath); // Log to confirm path

        // Get image dimensions
        const dimensions = sizeOf(imgPath);
        const base64Data = imageData.toString('base64');

        images.push({
          filename: imageFile,
          data: base64Data,
          width: dimensions.width,
          height: dimensions.height,
        });
      }
    }

    // Now build the Lottie JSON
    const lottieJSON = createLottieJSON(images, fps);

    return NextResponse.json({ lottie: lottieJSON });
  } catch (error) {
    console.error('Error processing ZIP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Clean up the temp directory
    if (tempDir) {
      try {
        await fsPromises.rm(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Failed to remove temp directory:', err);
      }
    }
  }
};

function createLottieJSON(images, fps) {
  const totalFrames = images.length;

  const layers = [];
  const assets = [];

  images.forEach((image, index) => {
    const id = `image_${index}`;
    const width = image.width;
    const height = image.height;

    assets.push({
      id,
      w: width,
      h: height,
      u: '',
      p: `data:image/png;base64,${image.data}`,
      e: 1,
    });

    layers.push({
      ddd: 0,
      ind: index + 1,
      ty: 2,
      nm: image.filename,
      refId: id,
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [width / 2, height / 2, 0] },
        a: { a: 0, k: [width / 2, height / 2, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      ip: index,
      op: index + 1,
      st: index,
      bm: 0,
    });
  });

  const lottieJSON = {
    v: '5.5.9',
    fr: fps,
    ip: 0,
    op: images.length,
    w: images[0].width,
    h: images[0].height,
    nm: 'Image Sequence Animation',
    ddd: 0,
    assets,
    layers,
    markers: [],
  };

  return lottieJSON;
}
