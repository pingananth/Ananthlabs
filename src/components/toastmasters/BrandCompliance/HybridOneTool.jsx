"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Script from 'next/script';

export default function HybridOneTool() {
  const [cvReady, setCvReady] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [shape, setShape] = useState('wordmark');
  const [logoVariant, setLogoVariant] = useState('color');
  const [flyerBg, setFlyerBg] = useState('white');

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check if OpenCV is already loaded globally
    if (window.cv && window.cv.Mat) {
      setCvReady(true);
    }
  }, []);

  const handleOpenCVReady = () => {
    console.log('OpenCV.js is loaded and ready.');
    if (window.cv) {
      window.cv.onRuntimeInitialized = () => {
        setCvReady(true);
      };
      // Sometimes onRuntimeInitialized doesn't fire if already loaded
      if (window.cv.Mat) setCvReady(true);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // Downscale for performance if massive
          const MAX_WIDTH = 1200;
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

  const getHSVBounds = (color) => {
    // OpenCV HSV ranges: H is 0-179, S is 0-255, V is 0-255
    switch(color) {
      case 'white':
        // High Value, Low Saturation
        return [{ lower: [0, 0, 180, 0], upper: [180, 50, 255, 255] }];
      case 'black':
        // Low Value
        return [{ lower: [0, 0, 0, 0], upper: [180, 255, 75, 255] }];
      case 'gray':
        // Low Saturation, Mid Value
        return [{ lower: [0, 0, 80, 0], upper: [180, 60, 220, 255] }];
      case 'navy':
        // Loosened Saturation to 40 to catch compressed Navy
        return [{ lower: [90, 40, 30, 0], upper: [130, 255, 255, 255] }];
      case 'maroon':
        // Loosened Saturation and Value
        return [
           { lower: [160, 40, 30, 0], upper: [180, 255, 255, 255] },
           { lower: [0, 40, 30, 0], upper: [10, 255, 255, 255] }
        ];
      case 'yellow':
        return [{ lower: [20, 80, 80, 0], upper: [40, 255, 255, 255] }];
      case 'color':
        return [
           { lower: [90, 40, 30, 0], upper: [130, 255, 255, 255] }, // Navy
           { lower: [160, 40, 30, 0], upper: [180, 255, 255, 255] }, // Maroon High
           { lower: [0, 40, 30, 0], upper: [10, 255, 255, 255] }     // Maroon Low
        ];
      default:
        return [{ lower: [0,0,0,0], upper: [180,255,255,255] }];
    }
  };

  const getTargetAspectRatio = (shapeType) => {
    switch(shapeType) {
      case 'wordmark': return { min: 4.5, max: 7.5 };
      case 'globe': return { min: 0.9, max: 1.3 };
      case 'lockup': return { min: 0.6, max: 1.8 };
      default: return { min: 0, max: 100 };
    }
  };

  const analyzeFlyer = async () => {
    if (!cvReady || !window.cv) {
      setError("OpenCV is not loaded yet.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    // Give UI time to update
    await new Promise(r => setTimeout(r, 100));

    try {
      const cv = window.cv;
      const canvas = canvasRef.current;
      
      // 1. Read Image from Canvas
      let src = cv.imread(canvas);
      let hsv = new cv.Mat();
      
      // Convert RGBA to RGB then to HSV
      cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
      cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

      // 2. Logo Variant Color Thresholding
      const variantRanges = getHSVBounds(logoVariant);
      let logoMask = new cv.Mat.zeros(hsv.rows, hsv.cols, cv.CV_8U);
      
      // Combine all color ranges for this variant (e.g. Navy + Maroon for "Color")
      for (const range of variantRanges) {
         let tempMask = new cv.Mat();
         let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), range.lower);
         let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), range.upper);
         cv.inRange(hsv, low, high, tempMask);
         cv.bitwise_or(logoMask, tempMask, logoMask);
         tempMask.delete(); low.delete(); high.delete();
      }

      // 2b. Flyer Background Negative Masking
      // We explicitly subtract the known background color to prevent noise from confusing the logo mask
      const bgRanges = getHSVBounds(flyerBg);
      let bgMask = new cv.Mat.zeros(hsv.rows, hsv.cols, cv.CV_8U);
      for (const range of bgRanges) {
         let tempBg = new cv.Mat();
         let lowB = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), range.lower);
         let highB = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), range.upper);
         cv.inRange(hsv, lowB, highB, tempBg);
         cv.bitwise_or(bgMask, tempBg, bgMask);
         tempBg.delete(); lowB.delete(); highB.delete();
      }
      // Invert background mask and apply it to logo mask (Logo Mask AND NOT Background Mask)
      let notBgMask = new cv.Mat();
      cv.bitwise_not(bgMask, notBgMask);
      cv.bitwise_and(logoMask, notBgMask, logoMask);

      // 3. Morphological Dilate to bridge gaps between letters
      // We use a wide horizontal kernel to connect text characters
      let M = cv.Mat.ones(15, 30, cv.CV_8U);
      let blobMask = new cv.Mat();
      cv.dilate(logoMask, blobMask, M, new cv.Point(-1, -1), 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

      // 4. Find Contours
      let contours = new cv.MatVector();
      let hierarchy = new cv.Mat();
      cv.findContours(blobMask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      const targetAR = getTargetAspectRatio(shape);
      let bestMatch = null;

      for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        let rect = cv.boundingRect(cnt);
        
        // Ignore tiny specs of noise
        if (rect.width < 30 || rect.height < 10) continue;
        
        let ar = rect.width / rect.height;
        
        // Check if Aspect Ratio matches
        if (ar >= targetAR.min && ar <= targetAR.max) {
           // We found a candidate! 
           // If multiple, pick the largest one
           const area = rect.width * rect.height;
           if (!bestMatch || area > (bestMatch ? bestMatch.width * bestMatch.height : 0)) {
              bestMatch = rect;
           }
        }
      }

      if (bestMatch) {
        // Draw the finding on the canvas
        let ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 4;
        ctx.strokeRect(bestMatch.x, bestMatch.y, bestMatch.width, bestMatch.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`LOGO DETECTED!`, bestMatch.x, bestMatch.y - 10);
        
        setResult({ success: true, rect: bestMatch });
      } else {
        throw new Error(`Logo not found! No blobs matched the ${shape} shape geometry (${targetAR.min} - ${targetAR.max} AR) in the variant ${logoVariant}.`);
      }

      // Cleanup OpenCV memory
      src.delete(); hsv.delete(); logoMask.delete(); bgMask.delete(); notBgMask.delete();
      M.delete(); blobMask.delete(); contours.delete(); hierarchy.delete();

    } catch (err) {
      console.error(err);
      setError(err.message || "An unknown error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <Script src="https://docs.opencv.org/4.8.0/opencv.js" strategy="lazyOnload" onLoad={handleOpenCVReady} />
      
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Hybrid #1: Pure Geometry</h2>
        <p className="text-gray-600">Locating logos using blazing-fast Color Thresholding + Aspect Ratio Math.</p>
        {!cvReady && <p className="text-amber-600 animate-pulse text-sm">Loading OpenCV Engine...</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Controls Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Constraints Cheat Code</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Shape</label>
                <select value={shape} onChange={e => setShape(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
                  <option value="wordmark">Wordmark (Long Rectangle)</option>
                  <option value="globe">Globe (Square)</option>
                  <option value="lockup">Lockup (Tall/Stacked)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Variant</label>
                <select value={logoVariant} onChange={e => setLogoVariant(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
                  <option value="color">Color (Navy/Maroon)</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="gray">Gray</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flyer Background</label>
                <select value={flyerBg} onChange={e => setFlyerBg(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500">
                  <option value="white">White</option>
                  <option value="black">Black</option>
                  <option value="gray">Gray</option>
                  <option value="navy">Navy Blue</option>
                  <option value="maroon">Maroon</option>
                  <option value="yellow">Happy Yellow</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Used as a negative mask to filter out background noise.</p>
              </div>
            </div>

            <div className="pt-4">
               <button 
                onClick={analyzeFlyer}
                disabled={!file || !cvReady || loading}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm hover:bg-blue-700"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{loading ? 'Running Geometry Math...' : 'Run Hybrid #1 Analysis'}</span>
              </button>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}
            
            {result && (
              <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 font-bold mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Logo Isolated Perfectly!</span>
                </div>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Width: {result.rect.width}px</li>
                  <li>Height: {result.rect.height}px</li>
                  <li>Measured Aspect Ratio: {(result.rect.width / result.rect.height).toFixed(2)}</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Image Preview Canvas */}
        <div className="lg:col-span-2">
           <div className="bg-white p-2 rounded-xl border shadow-sm min-h-[500px] flex items-center justify-center relative overflow-hidden">
             
             {/* Upload Overlay */}
             {!file && (
               <div 
                 className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                 onClick={() => fileInputRef.current?.click()}
               >
                 <Upload className="w-12 h-12 text-gray-400 mb-4" />
                 <p className="text-gray-700 font-medium">Click to upload flyer</p>
                 <p className="text-gray-500 text-sm mt-1">JPEG, PNG, or PDF</p>
               </div>
             )}

             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
             
             <canvas 
               ref={canvasRef} 
               className={`max-w-full max-h-[800px] object-contain ${!file ? 'opacity-0' : 'opacity-100'}`}
             />
             
           </div>
           
           {file && (
             <div className="mt-4 text-center">
                <button onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 hover:underline">
                  Upload a different flyer
                </button>
             </div>
           )}
        </div>
        
      </div>
    </div>
  );
}
