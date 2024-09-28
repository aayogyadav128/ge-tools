// src/app/page.js
'use client';

import { useState } from 'react';
import Lottie from 'lottie-react';

export default function ZipToLottie() {
  const [fps, setFps] = useState(24);
  const [loading, setLoading] = useState(false);
  const [lottieData, setLottieData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLottieData(null);

    const formData = new FormData(e.target);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    setLoading(false);

    if (res.ok) {
      setLottieData(data.lottie);
    } else {
      alert('Error: ' + data.error);
    }
  };

  return (
    <div>
      <h1>Lottie Animation Creator</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="zipFile">Upload Zip File of Images:</label>
          <input type="file" name="zipFile" accept=".zip" required />
        </div>
        <div>
          <label htmlFor="fps">FPS:</label>
          <input
            type="number"
            name="fps"
            min="1"
            max="60"
            value={fps}
            onChange={(e) => setFps(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Lottie Animation</button>
      </form>

      {loading && <p>Processing...</p>}

      {lottieData && (
        <div>
          <h2>Lottie Animation:</h2>
          <Lottie
            animationData={lottieData}
            loop={true}
            style={{ width: '500px', height: '500px' }}
          />

          <h2>Lottie Animation JSON:</h2>
          <textarea rows="20" cols="80" readOnly value={JSON.stringify(lottieData, null, 2)} />
          {/* Provide a download link */}
          <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(lottieData)
            )}`}
            download="animation.json"
          >
            Download Lottie JSON
          </a>
        </div>
      )}
    </div>
  );
}
