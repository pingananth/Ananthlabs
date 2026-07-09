"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, Loader2, AlertTriangle, XCircle, ChevronRight, Check } from 'lucide-react';
import Script from 'next/script';

// --- Reusable Custom Dropdown Component ---
const CustomDropdown = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div 
        className="w-full border rounded-lg p-2 cursor-pointer flex items-center justify-between bg-white hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          {selected.icon ? (
            <div className="w-10 h-6 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
               <img src={selected.icon} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
            </div>
          ) : (
            selected.colorCode && (
              <div className="w-6 h-6 rounded-full border shadow-inner" style={{ backgroundColor: selected.colorCode }}></div>
            )
          )}
          <span className="text-gray-900 font-medium">{selected.label}</span>
        </div>
        <span className="text-gray-400 text-xs">▼</span>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {options.map(o => (
            <div 
              key={o.value} 
              className={`p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b last:border-0 ${value === o.value ? 'bg-blue-50' : ''}`}
              onClick={() => { onChange(o.value); setIsOpen(false); }}
            >
              {o.icon ? (
                <div className="w-12 h-8 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                   <img src={o.icon} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                </div>
              ) : (
                o.colorCode && (
                  <div className="w-6 h-6 rounded-full border shadow-inner" style={{ backgroundColor: o.colorCode }}></div>
                )
              )}
              <span className="text-gray-900">{o.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function UnifiedBrandChecker() {
  const [cvReady, setCvReady] = useState(false);
  const [file, setFile] = useState(null);
  const [base64File, setBase64File] = useState(null);
  const [mimeType, setMimeType] = useState(null);
  
  // Step Management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1 State (CV Logo Checking)
  const [shape, setShape] = useState('globe');
  const [logoVariant, setLogoVariant] = useState('color');
  const [flyerBg, setFlyerBg] = useState('white');
  const [confidenceThreshold, setConfidenceThreshold] = useState(50);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvResult, setCvResult] = useState(null);
  const [cvError, setCvError] = useState(null);
  
  // Step 2 State (LLM Font/Imagery Checking)
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmResult, setLlmResult] = useState(null);
  const [llmError, setLlmError] = useState(null);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const templateCanvasRef = useRef(null);

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
      setMimeType(selected.type);
      
      // Reset all state
      setCvResult(null);
      setCvError(null);
      setLlmResult(null);
      setLlmError(null);
      setCurrentStep(1);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setBase64File(event.target.result);
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

  // --- CV LOGIC ---
  const getTemplatePath = (s, v) => {
    const mapping = {
      'globe_color': '/brand-references/logos/ToastmastersLogoColor.png',
      'globe_3color': '/brand-references/logos/ToastmastersLogo3Color.png',
      'globe_white': '/brand-references/logos/ToastmastersLogoWhite.png',
      'globe_gray': '/brand-references/logos/ToastmastersLogoGrayscale.png',
      'globe_black': '/brand-references/logos/ToastmastersLogoGrayscale.png',
      'wordmark_color': '/brand-references/logos/ToastmastersWordmarkColor.png',
      'wordmark_white': '/brand-references/logos/ToastmastersWordmarkWhite.png',
      'wordmark_black': '/brand-references/logos/ToastmastersWordmarkBlack.png',
      'wordmark_gray': '/brand-references/logos/ToastmastersWordmarkGrayscale.png',
      'lockup_color': '/brand-references/logos/ColorLogoSince1924Navy.png',
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

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  };

  const runLogoScan = async () => {
    if (!cvReady || !window.cv) {
      setCvError("OpenCV is not loaded yet.");
      return;
    }
    
    setCvLoading(true);
    setCvError(null);
    setCvResult(null);
    await new Promise(r => setTimeout(r, 50));

    try {
      const cv = window.cv;
      const flyerCanvas = canvasRef.current;
      let src = cv.imread(flyerCanvas);
      cv.cvtColor(src, src, cv.COLOR_RGBA2RGB);

      const templatePath = getTemplatePath(shape, logoVariant);
      const bgHex = getBackgroundHex(flyerBg);
      const templImg = await loadImage(templatePath);
      
      const tCanvas = templateCanvasRef.current;
      tCanvas.width = templImg.width;
      tCanvas.height = templImg.height;
      const tCtx = tCanvas.getContext('2d');
      
      tCtx.drawImage(templImg, 0, 0);
      tCtx.globalCompositeOperation = 'destination-over';
      tCtx.fillStyle = bgHex;
      tCtx.fillRect(0, 0, tCanvas.width, tCanvas.height);
      tCtx.globalCompositeOperation = 'source-over'; 

      let templBase = cv.imread(tCanvas);
      cv.cvtColor(templBase, templBase, cv.COLOR_RGBA2RGB);

      const baseWidth = 200;
      let templ = new cv.Mat();
      const baseScale = baseWidth / templBase.cols;
      cv.resize(templBase, templ, new cv.Size(baseWidth, Math.round(templBase.rows * baseScale)));

      let bestScore = -1;
      let bestMatch = null;
      
      for (let scale = 0.1; scale <= 3.0; scale += 0.05) {
         let currentWidth = Math.round(templ.cols * scale);
         let currentHeight = Math.round(templ.rows * scale);
         
         if (currentWidth >= src.cols || currentHeight >= src.rows) continue;
         
         let scaledTempl = new cv.Mat();
         cv.resize(templBase, scaledTempl, new cv.Size(currentWidth, currentHeight), 0, 0, cv.INTER_AREA);
         
         let resultMat = new cv.Mat();
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

      const CONFIDENCE_THRESHOLD = confidenceThreshold / 100;

      if (bestMatch && bestScore >= CONFIDENCE_THRESHOLD) {
        
        // 1. Correct for massive transparent padding in the official PNG files
        let trueX = bestMatch.x;
        let trueY = bestMatch.y;
        let trueW = bestMatch.width;
        let trueH = bestMatch.height;

        if (shape === 'wordmark') {
           trueX = bestMatch.x + (bestMatch.width * 0.1775);
           trueY = bestMatch.y + (bestMatch.height * 0.4629);
           trueW = bestMatch.width * 0.6432;
           trueH = bestMatch.height * 0.0774;
        } else if (shape === 'lockup') {
           trueX = bestMatch.x + (bestMatch.width * 0.2271);
           trueY = bestMatch.y + (bestMatch.height * 0.4090);
           trueW = bestMatch.width * 0.5457;
           trueH = bestMatch.height * 0.1818;
        }

        // 2. Calculate clear space margin accurately based on the TRUE height
        let margin = 0;
        if (shape === 'wordmark') margin = trueH * 1.0; // The wordmark IS the X-height
        else if (shape === 'lockup') margin = trueH * 0.25; // X-height is 25% of Lockup height
        else margin = trueH * 0.20; // X-height is 20% of Globe height
        margin = Math.round(margin);
        
        // 3. Define clear space boundaries (fixing the canvas clamping rendering bug)
        let csLeft = Math.max(0, trueX - margin);
        let csTop = Math.max(0, trueY - margin);
        let csRight = Math.min(src.cols, trueX + trueW + margin);
        let csBottom = Math.min(src.rows, trueY + trueH + margin);
        
        let csX = csLeft;
        let csY = csTop;
        let csW = csRight - csLeft;
        let csH = csBottom - csTop;
        
        let clearSpaceRoi = src.roi(new cv.Rect(csX, csY, csW, csH));
        let edges = new cv.Mat();
        let gray = new cv.Mat();
        cv.cvtColor(clearSpaceRoi, gray, cv.COLOR_RGB2GRAY);
        cv.Canny(gray, edges, 50, 150);
        
        // Mask out the inner logo itself so we only look at the perimeter
        let innerX = trueX - csX;
        let innerY = trueY - csY;
        let innerW = trueW;
        let innerH = trueH;
        let innerColor = new cv.Scalar(0, 0, 0, 255);
        cv.rectangle(edges, new cv.Point(innerX, innerY), new cv.Point(innerX + innerW, innerY + innerH), innerColor, cv.FILLED);
        
        let edgeCount = cv.countNonZero(edges);
        let perimeterArea = (csW * csH) - (innerW * innerH);
        let edgeRatio = edgeCount / perimeterArea;
        
        let hasClearSpaceViolation = edgeCount > 50 || edgeRatio > 0.005;
        
        edges.delete(); gray.delete(); clearSpaceRoi.delete();

        // 4. Check Canvas Boundaries
        const boundaryViolations = [];
        if (trueY < margin) boundaryViolations.push("Logo is too close to Top Canvas Edge");
        if (trueX < margin) boundaryViolations.push("Logo is too close to Left Canvas Edge");
        if ((src.rows - (trueY + trueH)) < margin) boundaryViolations.push("Logo is too close to Bottom Canvas Edge");
        if ((src.cols - (trueX + trueW)) < margin) boundaryViolations.push("Logo is too close to Right Canvas Edge");

        let ctx = flyerCanvas.getContext('2d');
        
        // Draw Clear Space Box (Dashed Red or Yellow)
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = hasClearSpaceViolation ? '#ef4444' : '#eab308';
        ctx.lineWidth = 2;
        // Use true coordinates so it draws off-canvas if it violates the boundary, rather than overlapping the green box
        ctx.strokeRect(trueX - margin, trueY - margin, trueW + margin * 2, trueH + margin * 2);
        ctx.setLineDash([]); 
        
        // Draw True Logo Box (Solid Green)
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 4;
        ctx.strokeRect(trueX, trueY, trueW, trueH);
        
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(`LOGO (${Math.round(bestScore*100)}%)`, trueX, trueY - 10);
        
        setCvResult({ 
          success: true, 
          rect: { x: trueX, y: trueY, width: trueW, height: trueH }, 
          score: bestScore, 
          clearSpaceViolation: hasClearSpaceViolation, 
          boundaryViolations,
          edgeRatio 
        });
      } else {
        throw new Error(`Logo not found! Highest correlation was only ${Math.round(bestScore*100)}%.`);
      }

      src.delete(); templBase.delete(); templ.delete();
    } catch (err) {
      console.error(err);
      setCvError(err.message || "An unknown error occurred during analysis.");
    } finally {
      setCvLoading(false);
    }
  };

  // --- LLM LOGIC ---
  const runLlmScan = async () => {
    setLlmLoading(true);
    setLlmError(null);
    setLlmResult(null);

    try {
      const response = await fetch('/api/check-brand-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64File, mimeType })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze flyer');
      }

      setLlmResult(data);
      setCurrentStep(3); // Move to Summary
    } catch (err) {
      setLlmError(err.message);
    } finally {
      setLlmLoading(false);
    }
  };

  // --- OPTIONS ---
  const shapeOptions = [
    { value: 'globe', label: 'Globe', icon: '/brand-references/logos/ToastmastersLogoColor.png' },
    { value: 'wordmark', label: 'Wordmark', icon: '/brand-references/logos/ToastmastersWordmarkColor.png' },
    { value: 'lockup', label: 'Lockup', icon: '/brand-references/logos/ColorLogoSince1924Navy.png' }
  ];

  const variantOptions = [
    { value: 'color', label: 'Standard Color' },
    { value: '3color', label: '3-Color (True Color)' },
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'gray', label: 'Gray' }
  ];

  const bgOptions = [
    { value: 'white', label: 'White', colorCode: '#FFFFFF' },
    { value: 'navy', label: 'Navy Blue', colorCode: '#004165' },
    { value: 'maroon', label: 'Maroon', colorCode: '#772432' },
    { value: 'yellow', label: 'Happy Yellow', colorCode: '#F2DF74' },
    { value: 'gray', label: 'Gray', colorCode: '#A9B2B1' },
    { value: 'black', label: 'Black', colorCode: '#000000' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      <Script src="https://docs.opencv.org/4.8.0/opencv.js" strategy="lazyOnload" onLoad={handleOpenCVReady} />
      <canvas ref={templateCanvasRef} style={{ display: 'none' }} />

      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Brand Compliance Checker</h2>
        <p className="text-gray-600 text-lg">Production-ready, multi-stage compliance verification.</p>
        {!cvReady && <p className="text-amber-600 animate-pulse text-sm">Initializing OpenCV Engine...</p>}
      </div>

      {/* Stepper UI */}
      <div className="flex items-center justify-center space-x-4 mb-8">
         <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
            <span className="font-semibold hidden sm:inline">Logo Geometry</span>
         </div>
         <div className="w-12 h-1 bg-gray-200 rounded">
            <div className={`h-full bg-blue-600 rounded transition-all ${currentStep >= 2 ? 'w-full' : 'w-0'}`}></div>
         </div>
         <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
            <span className="font-semibold hidden sm:inline">Typography & Imagery</span>
         </div>
         <div className="w-12 h-1 bg-gray-200 rounded">
            <div className={`h-full bg-blue-600 rounded transition-all ${currentStep === 3 ? 'w-full' : 'w-0'}`}></div>
         </div>
         <div className={`flex items-center space-x-2 ${currentStep === 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep === 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
               <Check className="w-5 h-5" />
            </div>
            <span className="font-semibold hidden sm:inline">Summary</span>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Pane: Image Preview */}
        <div className="w-full lg:w-3/5 order-2 lg:order-1">
           <div className="bg-white p-2 rounded-xl border shadow-sm min-h-[400px] lg:min-h-[600px] flex items-center justify-center relative overflow-hidden">
             
             {!file && (
               <div 
                 className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                 onClick={() => fileInputRef.current?.click()}
               >
                 <Upload className="w-12 h-12 text-gray-400 mb-4" />
                 <p className="text-gray-700 font-medium">Click to upload flyer</p>
               </div>
             )}

             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
             
             <canvas 
               ref={canvasRef} 
               className={`max-w-full max-h-[800px] object-contain rounded ${!file ? 'opacity-0' : 'opacity-100'}`}
             />
             
           </div>
           
           {file && (
             <div className="mt-4 text-center">
                <button onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-blue-600 hover:underline">
                  Upload a different flyer
                </button>
             </div>
           )}
        </div>

        {/* Right Pane: Wizard Controls */}
        <div className="w-full lg:w-2/5 order-1 lg:order-2 space-y-6">
          
          {/* STEP 1 CONTROLS */}
          {currentStep === 1 && (
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="border-b pb-3">
                 <h3 className="font-bold text-xl text-gray-900">Step 1: Logo & Clear Space</h3>
                 <p className="text-sm text-gray-500 mt-1">Provide the parameters of the logo you used in this design.</p>
              </div>
              
              <div className="space-y-4">
                <CustomDropdown label="Logo Shape" options={shapeOptions} value={shape} onChange={setShape} />
                <CustomDropdown label="Logo Variant" options={variantOptions} value={logoVariant} onChange={setLogoVariant} />
                <CustomDropdown label="Background Behind Logo" options={bgOptions} value={flyerBg} onChange={setFlyerBg} />

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidence Threshold: {confidenceThreshold}%
                  </label>
                  <input 
                    type="range" min="10" max="100" 
                    value={confidenceThreshold} 
                    onChange={e => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                 <button 
                  onClick={runLogoScan}
                  disabled={!file || !cvReady || cvLoading}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2 shadow hover:bg-blue-700 transition-colors"
                >
                  {cvLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  <span>{cvLoading ? 'Running OpenCV Geometry Math...' : 'Check Brand Compliant'}</span>
                </button>
              </div>
              
              {cvError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div><span className="font-bold">Error:</span> {cvError}</div>
                </div>
              )}
              
              {cvResult && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 font-bold mb-1">
                      <CheckCircle className="w-5 h-5" />
                      <span>Logo Automatically Detected!</span>
                    </div>
                    <p className="text-sm text-green-700">Mathematical Confidence: {Math.round(cvResult.score * 100)}%</p>
                  </div>
                  
                  {cvResult.boundaryViolations && cvResult.boundaryViolations.length > 0 && (
                    <div className="p-4 rounded-lg border bg-red-50 border-red-200">
                      <p className="text-red-800 text-sm font-bold flex items-center gap-2 mb-2"><XCircle className="w-4 h-4"/> Canvas Proximity Violations</p>
                      <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                        {cvResult.boundaryViolations.map((edge, i) => <li key={i}>{edge}</li>)}
                      </ul>
                    </div>
                  )}

                  {cvResult.clearSpaceViolation && (
                    <div className="p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                      <div className="font-bold mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Clear Space Warning</div>
                      <p className="text-sm">
                        Pixels (sharp edges) were detected inside the mandatory clear space boundary! Please visually inspect the dashed box on the flyer.
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors mt-4"
                  >
                    <span>Next: Check Fonts & Imagery</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 CONTROLS */}
          {currentStep === 2 && (
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="border-b pb-3">
                 <h3 className="font-bold text-xl text-gray-900">Step 2: Typography & Imagery</h3>
                 <p className="text-sm text-gray-500 mt-1">Using Semantic AI (Gemini) to evaluate the visual vibe and font families.</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 space-y-2">
                 <p><strong>The AI will check for:</strong></p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li>Gotham, Montserrat, Myriad Pro, etc.</li>
                    <li>Professional, empowering photography.</li>
                    <li>No cartoons, word art, or extreme drop shadows.</li>
                 </ul>
              </div>

              <button 
                  onClick={runLlmScan}
                  disabled={llmLoading}
                  className="w-full py-4 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2 shadow hover:bg-purple-700 transition-colors"
                >
                  {llmLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                  <span>{llmLoading ? 'AI is Reviewing Typography...' : 'Analyze Fonts & Imagery'}</span>
              </button>

              {llmError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div><span className="font-bold">Error:</span> {llmError}</div>
                </div>
              )}

              <button 
                onClick={() => setCurrentStep(1)}
                className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Back to Logo Settings
              </button>
            </div>
          )}

          {/* STEP 3 FINAL SUMMARY */}
          {currentStep === 3 && cvResult && llmResult && (
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="border-b pb-3 flex items-center justify-between">
                 <div>
                   <h3 className="font-bold text-xl text-gray-900">Final Summary</h3>
                   <p className="text-sm text-gray-500 mt-1">Consolidated compliance report.</p>
                 </div>
                 {llmResult.isCompliant && !cvResult.clearSpaceViolation && (!cvResult.boundaryViolations || cvResult.boundaryViolations.length === 0) ? (
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                       <CheckCircle className="w-7 h-7" />
                    </div>
                 ) : (
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                       <AlertTriangle className="w-7 h-7" />
                    </div>
                 )}
              </div>

              {/* Logo Summary */}
              <div className="space-y-3">
                 <h4 className="font-bold text-gray-800 border-b pb-1">1. Logo & Geometry (CV)</h4>
                 
                 <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                       <p className="font-bold text-green-900 text-sm">Logo Detection</p>
                       <p className="text-xs text-green-700">Perfect structural match found ({Math.round(cvResult.score * 100)}%).</p>
                    </div>
                 </div>

                 {cvResult.clearSpaceViolation || (cvResult.boundaryViolations && cvResult.boundaryViolations.length > 0) ? (
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                         <p className="font-bold text-red-900 text-sm">Clear Space / Margin</p>
                         <p className="text-xs text-red-700">Visual elements or edges invaded the mandatory protective boundary.</p>
                      </div>
                    </div>
                 ) : (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                         <p className="font-bold text-green-900 text-sm">Clear Space / Margin</p>
                         <p className="text-xs text-green-700">Protective boundaries are respected.</p>
                      </div>
                    </div>
                 )}
              </div>

              {/* Typography & Imagery Summary */}
              <div className="space-y-3 pt-2">
                 <h4 className="font-bold text-gray-800 border-b pb-1">2. Typography & Imagery (AI)</h4>
                 
                 {llmResult.checklist?.map((item, idx) => (
                   <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${item.status === 'pass' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      {item.status === 'pass' 
                        ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        : <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      }
                      <div>
                         <p className={`font-bold text-sm ${item.status === 'pass' ? 'text-green-900' : 'text-red-900'}`}>{item.category}</p>
                         <p className={`text-xs mt-1 ${item.status === 'pass' ? 'text-green-700' : 'text-red-700'}`}>{item.details}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="pt-4 border-t flex gap-4">
                 <button 
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 border border-gray-300 bg-white text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                 >
                   Re-Run Scan
                 </button>
                 <button 
                  onClick={() => {
                    setFile(null);
                    setCurrentStep(1);
                    setCvResult(null);
                    setLlmResult(null);
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                 >
                   New Flyer
                 </button>
              </div>

            </div>
          )}
          
        </div>
        
      </div>
    </div>
  );
}
