"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import Script from 'next/script';

export default function HybridTwoTool() {
  const [cvReady, setCvReady] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [shape, setShape] = useState('globe');
  const [logoVariant, setLogoVariant] = useState('color');
  const [flyerBg, setFlyerBg] = useState('white');
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const templateCanvasRef = useRef(null); // Hidden canvas for generating the solid template

  useEffect(() => {
    if (window.cv && window.cv.Mat) setCvReady(true);
  }, []);

  const handleOpenCVReady = () => {
    if (window.cv) {
      window.cv.onRuntimeInitialized = () => setCvReady(true);
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

  const getTemplatePath = (s, v) => {
    // Map UI selections to official brand assets
    const mapping = {
      'globe_color': '/brand-references/logos/ToastmastersLogoColor.png',
      'globe_3color': '/brand-references/logos/ToastmastersLogo3Color.png',
      'globe_white': '/brand-references/logos/ToastmastersLogoWhite.png',
      'globe_gray': '/brand-references/logos/ToastmastersLogoGrayscale.png',
      'globe_black': '/brand-references/logos/ToastmastersLogoGrayscale.png', // Fallback
      
      'wordmark_color': '/brand-references/logos/ToastmastersWordmarkColor.png',
      'wordmark_white': '/brand-references/logos/ToastmastersWordmarkWhite.png',
      'wordmark_black': '/brand-references/logos/ToastmastersWordmarkBlack.png',
      'wordmark_gray': '/brand-references/logos/ToastmastersWordmarkGrayscale.png',

      'lockup_color': '/brand-references/logos/ColorLogoSince1924Navy.png', // Or ColorLogoWithWebsite
      'lockup_white': '/brand-references/logos/ColorLogoSince1924White.png',
      'lockup_black': '/brand-references/logos/ColorLogoSince1924White.png',
      'lockup_gray': '/brand-references/logos/ColorLogoSince1924White.png',
    };
    return mapping[`${s}_${v}`] || mapping['globe_color'];
  };

  const getBackgroundHex = (bgName) => {
    switch(bgName) {
      case 'navy': return '#004165';
      case 'maroon': return '#772432';
      case 'yellow': return '#F2DF74';
      case 'gray': return '#A9B2B1';
      case 'black': return '#000000';
      case 'white': default: return '#FFFFFF';
    }
  };

  // Helper to load image from URL into an Image object
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  };

  const analyzeFlyer = async () => {
    if (!cvReady || !window.cv) {
      setError("OpenCV is not loaded yet.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    // Allow React to show loading spinner
    await new Promise(r => setTimeout(r, 50));

    try {
      const cv = window.cv;
      
      // 1. Load Flyer Image
      const flyerCanvas = canvasRef.current;
      let src = cv.imread(flyerCanvas);
      cv.cvtColor(src, src, cv.COLOR_RGBA2RGB); // Drop alpha channel

      // 2. Dynamically Generate Solid Reference Template
      const templatePath = getTemplatePath(shape, logoVariant);
      const bgHex = getBackgroundHex(flyerBg);
      
      const templImg = await loadImage(templatePath);
      
      const tCanvas = templateCanvasRef.current;
      tCanvas.width = templImg.width;
      tCanvas.height = templImg.height;
      const tCtx = tCanvas.getContext('2d');
      
      // Paint the transparent PNG
      tCtx.drawImage(templImg, 0, 0);
      
      // Paint the solid background BEHIND the PNG using compositing
      tCtx.globalCompositeOperation = 'destination-over';
      tCtx.fillStyle = bgHex;
      tCtx.fillRect(0, 0, tCanvas.width, tCanvas.height);
      tCtx.globalCompositeOperation = 'source-over'; // Reset

      let templBase = cv.imread(tCanvas);
      cv.cvtColor(templBase, templBase, cv.COLOR_RGBA2RGB);

      // We need to scale the massive raw template down to a manageable size to start
      // e.g. base width = 200px
      const baseWidth = 200;
      let templ = new cv.Mat();
      const baseScale = baseWidth / templBase.cols;
      cv.resize(templBase, templ, new cv.Size(baseWidth, Math.round(templBase.rows * baseScale)));

      // 3. Multi-Scale Template Matching Loop
      let bestScore = -1;
      let bestMatch = null;
      
      // Loop from 10% to 300% of the base template size (which is 200px)
      // This allows finding logos from 20px up to 600px wide!
      for (let scale = 0.1; scale <= 3.0; scale += 0.05) {
         let currentWidth = Math.round(templ.cols * scale);
         let currentHeight = Math.round(templ.rows * scale);
         
         // Don't search if the template is bigger than the flyer!
         if (currentWidth >= src.cols || currentHeight >= src.rows) continue;
         
         let scaledTempl = new cv.Mat();
         // Resize directly from templBase to preserve maximum quality and prevent double-resize blur
         cv.resize(templBase, scaledTempl, new cv.Size(currentWidth, currentHeight), 0, 0, cv.INTER_AREA);
         
         let resultMat = new cv.Mat();
         // TM_CCOEFF_NORMED is robust for exact color/structure matching
         cv.matchTemplate(src, scaledTempl, resultMat, cv.TM_CCOEFF_NORMED);
         
         let minMax = cv.minMaxLoc(resultMat);
         if (minMax.maxVal > bestScore) {
            bestScore = minMax.maxVal;
            bestMatch = {
               x: minMax.maxLoc.x,
               y: minMax.maxLoc.y,
               width: currentWidth,
               height: currentHeight,
               score: minMax.maxVal
            };
         }
         
         scaledTempl.delete();
         resultMat.delete();
      }

      // 4. Evaluate Results
      const CONFIDENCE_THRESHOLD = confidenceThreshold / 100;

      if (bestMatch && bestScore >= CONFIDENCE_THRESHOLD) {
        // Calculate clear space margin
        let margin = 0;
        if (shape === 'wordmark') margin = bestMatch.height * 0.5; // "X" is the height of the word "TOASTMASTERS" (~50% of the total PNG height)
        else if (shape === 'lockup') margin = bestMatch.height * 0.14; // Wordmark height is 14% of the globe
        else margin = bestMatch.height * 0.14; // Wordmark height is 14% of the globe
        margin = Math.round(margin);
        
        // Define clear space boundaries
        let csX = Math.max(0, bestMatch.x - margin);
        let csY = Math.max(0, bestMatch.y - margin);
        let csW = Math.min(src.cols - csX, bestMatch.width + margin * 2);
        let csH = Math.min(src.rows - csY, bestMatch.height + margin * 2);
        
        let clearSpaceRoi = src.roi(new cv.Rect(csX, csY, csW, csH));
        
        // Edge detection to find "activity" (text/graphics) in the clear space
        let edges = new cv.Mat();
        let gray = new cv.Mat();
        cv.cvtColor(clearSpaceRoi, gray, cv.COLOR_RGB2GRAY);
        cv.Canny(gray, edges, 50, 150);
        
        // Mask out the inner logo itself so we only look at the perimeter
        let innerX = bestMatch.x - csX;
        let innerY = bestMatch.y - csY;
        let innerW = bestMatch.width;
        let innerH = bestMatch.height;
        let innerColor = new cv.Scalar(0, 0, 0, 255);
        cv.rectangle(edges, new cv.Point(innerX, innerY), new cv.Point(innerX + innerW, innerY + innerH), innerColor, cv.FILLED);
        
        // Count edge pixels
        let edgeCount = cv.countNonZero(edges);
        let perimeterArea = (csW * csH) - (innerW * innerH);
        let edgeRatio = edgeCount / perimeterArea;
        
        // Very strict threshold: even a single letter invading will trigger it
        let hasClearSpaceViolation = edgeCount > 50 || edgeRatio > 0.005;
        
        edges.delete();
        gray.delete();
        clearSpaceRoi.delete();

        // 5. Check Canvas Boundaries
        const boundaryViolations = [];
        if (bestMatch.y < margin) boundaryViolations.push("Logo is too close to Top Canvas Edge");
        if (bestMatch.x < margin) boundaryViolations.push("Logo is too close to Left Canvas Edge");
        if ((src.rows - (bestMatch.y + bestMatch.height)) < margin) boundaryViolations.push("Logo is too close to Bottom Canvas Edge");
        if ((src.cols - (bestMatch.x + bestMatch.width)) < margin) boundaryViolations.push("Logo is too close to Right Canvas Edge");

        
        // Draw the finding on the flyer canvas
        let ctx = flyerCanvas.getContext('2d');
        
        // Draw Clear Space Box (Dashed Red or Yellow)
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = hasClearSpaceViolation ? '#ef4444' : '#eab308';
        ctx.lineWidth = 2;
        ctx.strokeRect(csX, csY, csW, csH);
        ctx.setLineDash([]); // Reset
        
        // Draw Logo Box (Solid Green)
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.strokeRect(bestMatch.x, bestMatch.y, bestMatch.width, bestMatch.height);
        
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`LOGO (${Math.round(bestScore*100)}%)`, bestMatch.x, bestMatch.y - 10);
        
        setResult({ 
          success: true, 
          rect: bestMatch, 
          score: bestScore, 
          clearSpaceViolation: hasClearSpaceViolation, 
          boundaryViolations,
          edgeRatio 
        });
      } else {
        throw new Error(`Logo not found! Highest correlation was only ${Math.round(bestScore*100)}%. Ensure the Shape, Variant, and Background are exactly correct.`);
      }

      // Cleanup
      src.delete();
      templBase.delete();
      templ.delete();

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
      
      {/* Hidden canvas for template generation */}
      <canvas ref={templateCanvasRef} style={{ display: 'none' }} />

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Hybrid #2: Dynamic Template</h2>
        <p className="text-gray-600">Artificially painting solid references in memory for high-speed structural correlation.</p>
        {!cvReady && <p className="text-amber-600 animate-pulse text-sm">Loading OpenCV Engine...</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Dynamic Generator</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Shape</label>
                <select value={shape} onChange={e => setShape(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="globe">Globe</option>
                  <option value="wordmark">Wordmark</option>
                  <option value="lockup">Lockup</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Variant</label>
                <select value={logoVariant} onChange={e => setLogoVariant(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="color">Standard Color</option>
                  <option value="3color">3-Color (True Color)</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                  <option value="gray">Gray</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flyer Background Color</label>
                <select value={flyerBg} onChange={e => setFlyerBg(e.target.value)} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-black">
                  <option value="white">White</option>
                  <option value="navy">Navy Blue</option>
                  <option value="black">Black</option>
                  <option value="gray">Gray</option>
                  <option value="maroon">Maroon</option>
                  <option value="yellow">Happy Yellow</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidence Threshold: {confidenceThreshold}%
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={confidenceThreshold} 
                  onChange={e => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Lower this if the flyer has heavy JPEG compression.</p>
              </div>
            </div>

            <div className="pt-4">
               <button 
                onClick={analyzeFlyer}
                disabled={!file || !cvReady || loading}
                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm hover:bg-indigo-700 transition-colors"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{loading ? 'Scanning 30 Scales...' : 'Run Hybrid #2 Scan'}</span>
              </button>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                <span className="font-semibold">Error:</span> {error}
              </div>
            )}
            
            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 font-bold mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Logo Detected!</span>
                  </div>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Confidence: {Math.round(result.score * 100)}%</li>
                    <li>Matched Width: {result.rect.width}px</li>
                  </ul>
                </div>
                
                {result.boundaryViolations && result.boundaryViolations.length > 0 && (
                  <div className="p-4 rounded-lg border bg-red-50 border-red-200">
                    <p className="text-red-800 text-sm font-bold mb-2">⚠️ Canvas Proximity Violations</p>
                    <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                      {result.boundaryViolations.map((edge, i) => (
                        <li key={i}>{edge}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.clearSpaceViolation && (
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                    <div className="font-bold mb-1">⚠️ Clear Space Warning</div>
                    <p className="text-sm">
                      Pixels (sharp edges) were detected inside the mandatory clear space boundary! Please visually inspect the dashed box on the flyer to ensure no text or graphics are crowding the logo.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
           <div className="bg-white p-2 rounded-xl border shadow-sm min-h-[500px] flex items-center justify-center relative overflow-hidden">
             
             {!file && (
               <div 
                 className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors z-10"
                 onClick={() => fileInputRef.current?.click()}
               >
                 <Upload className="w-12 h-12 text-gray-400 mb-4" />
                 <p className="text-gray-700 font-medium">Click to upload flyer</p>
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
                <button onClick={() => fileInputRef.current?.click()} className="text-sm text-indigo-600 hover:underline">
                  Upload a different flyer
                </button>
             </div>
           )}
        </div>
        
      </div>
    </div>
  );
}
