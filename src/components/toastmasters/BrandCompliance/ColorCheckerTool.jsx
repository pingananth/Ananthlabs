"use client";

import React, { useState, useRef } from 'react';
import { Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const BRAND_PALETTE = [
  { name: 'Loyal Blue', hex: '#004165', rgb: { r: 0, g: 65, b: 101 } },
  { name: 'True Maroon', hex: '#772432', rgb: { r: 119, g: 36, b: 50 } },
  { name: 'Cool Gray', hex: '#A9B2B1', rgb: { r: 169, g: 178, b: 177 } },
  { name: 'Happy Yellow', hex: '#F2DF74', rgb: { r: 242, g: 223, b: 116 } },
  { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 } },
  { name: 'Black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 } },
];

export default function ColorCheckerTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [tolerance, setTolerance] = useState(40); // Euclidean distance tolerance
  const [colorClusters, setColorClusters] = useState(5); 

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResults(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          const MAX_WIDTH = 600;
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(selected);
    }
  };

  // Euclidean Distance in RGB space
  const colorDistance = (c1, c2) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) + 
      Math.pow(c1.g - c2.g, 2) + 
      Math.pow(c1.b - c2.b, 2)
    );
  };

  const rgbToHex = (r, g, b) => {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
  };

  const extractColors = () => {
    setLoading(true);
    
    // Use timeout to allow UI to show loading state
    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      // We will sample a smaller version of the image to speed up K-Means
      const sampleSize = 150; // Use a 150px wide sample
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = sampleSize;
      sampleCanvas.height = Math.round((canvas.height * sampleSize) / canvas.width);
      const sampleCtx = sampleCanvas.getContext('2d');
      sampleCtx.drawImage(canvas, 0, 0, sampleCanvas.width, sampleCanvas.height);
      
      const imageData = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
      const pixels = [];
      
      for (let i = 0; i < imageData.length; i += 4) {
        // Skip fully transparent pixels
        if (imageData[i+3] < 128) continue;
        
        pixels.push({
          r: imageData[i],
          g: imageData[i+1],
          b: imageData[i+2]
        });
      }

      // Simple K-Means Clustering
      const k = colorClusters;
      let centroids = [];
      // Init random centroids
      for (let i = 0; i < k; i++) {
        centroids.push({...pixels[Math.floor(Math.random() * pixels.length)], count: 0});
      }

      const MAX_ITER = 20;
      let finalClusters = [];

      for (let iter = 0; iter < MAX_ITER; iter++) {
        finalClusters = Array.from({length: k}, () => []);
        
        // Assign pixels to nearest centroid
        for (let i = 0; i < pixels.length; i++) {
          let p = pixels[i];
          let minDist = Infinity;
          let clusterIdx = 0;
          for (let j = 0; j < k; j++) {
            let d = colorDistance(p, centroids[j]);
            if (d < minDist) {
              minDist = d;
              clusterIdx = j;
            }
          }
          finalClusters[clusterIdx].push(p);
        }

        // Recalculate centroids
        let moved = false;
        for (let j = 0; j < k; j++) {
          let cluster = finalClusters[j];
          if (cluster.length === 0) continue;
          
          let sumR = 0, sumG = 0, sumB = 0;
          for (let p of cluster) {
            sumR += p.r; sumG += p.g; sumB += p.b;
          }
          
          let newR = Math.round(sumR / cluster.length);
          let newG = Math.round(sumG / cluster.length);
          let newB = Math.round(sumB / cluster.length);
          
          if (centroids[j].r !== newR || centroids[j].g !== newG || centroids[j].b !== newB) {
            moved = true;
            centroids[j] = { r: newR, g: newG, b: newB, count: cluster.length };
          } else {
            centroids[j].count = cluster.length;
          }
        }
        if (!moved) break;
      }

      // Sort centroids by dominance (count)
      centroids.sort((a, b) => b.count - a.count);

      // Evaluate against Brand Palette
      const totalPixels = pixels.length;
      
      const analyzedColors = centroids.map(c => {
        let bestMatch = null;
        let minDistance = Infinity;
        
        for (let brandColor of BRAND_PALETTE) {
          let d = colorDistance(c, brandColor.rgb);
          if (d < minDistance) {
            minDistance = d;
            bestMatch = brandColor;
          }
        }

        const isCompliant = minDistance <= tolerance;
        const percentage = ((c.count / totalPixels) * 100).toFixed(1);

        return {
          hex: rgbToHex(c.r, c.g, c.b),
          r: c.r, g: c.g, b: c.b,
          percentage,
          isCompliant,
          distance: Math.round(minDistance),
          matchedBrandColor: bestMatch.name,
          matchedBrandHex: bestMatch.hex
        };
      });

      // Filter out tiny clusters (< 2%) as they are usually noise
      const significantColors = analyzedColors.filter(c => parseFloat(c.percentage) > 2.0);

      setResults({
        colors: significantColors,
        compliant: significantColors.every(c => c.isCompliant || parseFloat(c.percentage) < 10) // allow photos (non-compliant) if they aren't completely taking over the design
      });
      setLoading(false);

    }, 100);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Color Palette Checker</h2>
        <p className="text-gray-600">Extracts dominant colors using K-Means and compares them to the official brand palette with a JPEG-safe mathematical tolerance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 bg-gray-50 cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">{file ? 'Change Flyer Image' : 'Upload Flyer Image'}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Tolerance (Delta Radius): {tolerance}
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  value={tolerance} 
                  onChange={e => setTolerance(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Higher tolerance allows more JPEG distortion to pass as a "Brand Color".</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Clusters (K): {colorClusters}
                </label>
                <input 
                  type="range" 
                  min="3" 
                  max="15" 
                  value={colorClusters} 
                  onChange={e => setColorClusters(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">How many dominant colors to extract from the image.</p>
              </div>
            </div>

            <button 
              onClick={extractColors}
              disabled={!file || loading}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm hover:bg-indigo-700 transition-colors"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{loading ? 'Extracting Colors...' : 'Analyze Color Palette'}</span>
            </button>
          </div>

          <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
             <canvas ref={canvasRef} className={`w-full h-auto block ${!file ? 'hidden' : ''}`} />
          </div>
        </div>

        <div>
          {results ? (
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                {results.compliant ? (
                   <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                   <AlertTriangle className="w-8 h-8 text-red-600" />
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {results.compliant ? "Palette Approved!" : "Rogue Colors Detected"}
                </h3>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Dominant Colors Found:</h4>
                <div className="space-y-3">
                  {results.colors.map((c, i) => (
                    <div key={i} className={`p-4 rounded-lg border flex items-center justify-between ${c.isCompliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-full border shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div>
                          <p className="font-bold text-gray-900">{c.percentage}% of Flyer</p>
                          <p className="text-xs font-mono text-gray-500">Detected: {c.hex}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {c.isCompliant ? (
                          <>
                            <p className="text-sm font-bold text-green-700">Matches: {c.matchedBrandColor}</p>
                            <p className="text-xs text-green-600">Distance: {c.distance} (Pass)</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-red-700">No Brand Match</p>
                            <p className="text-xs text-red-600">Distance: {c.distance} (Fail)</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!results.compliant && (
                <div className="p-4 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-200 mt-4">
                  <strong>Note:</strong> If a "rogue" color is just part of a photograph (like a blue sky or skin tone), it is perfectly fine! The brand manual only forbids non-brand colors in the core design elements (banners, text, backgrounds). You can use your human judgment here.
                </div>
              )}
            </div>
          ) : (
             <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center min-h-[400px]">
                <div className="flex space-x-2 mb-4">
                   {BRAND_PALETTE.map(b => (
                     <div key={b.name} className="w-8 h-8 rounded-full shadow-sm border" style={{ backgroundColor: b.hex }} />
                   ))}
                </div>
                <p>Upload a flyer to extract its dominant colors and verify them against the official Toastmasters palette.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
