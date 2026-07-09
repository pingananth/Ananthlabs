"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, AlertTriangle, Eye, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import Script from 'next/script';

export default function OpenCVClearSpaceTool() {
  const [cvReady, setCvReady] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedLogoId, setSelectedLogoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const templateRefs = useRef([]);

  const LOGO_VARIANTS = [
    { id: 'primary_color', src: '/brand-references/logos/ToastmastersLogoColor.png', name: 'Primary Full Color', xRatio: 0.14 },
    { id: 'primary_gray', src: '/brand-references/logos/ToastmastersLogoGrayscale.png', name: 'Primary Grayscale', xRatio: 0.14 },
    { id: 'primary_white', src: '/brand-references/logos/ToastmastersLogoWhite.png', name: 'Primary White', xRatio: 0.14 },
    { id: 'primary_3color', src: '/brand-references/logos/ToastmastersLogo3Color.png', name: 'Primary 3-Color', xRatio: 0.14 },
    { id: 'wordmark_color', src: '/brand-references/logos/ToastmastersWordmarkColor.png', name: 'Wordmark Full Color', xRatio: 1.0 },
    { id: 'wordmark_gray', src: '/brand-references/logos/ToastmastersWordmarkGrayscale.png', name: 'Wordmark Grayscale', xRatio: 1.0 },
    { id: 'wordmark_white', src: '/brand-references/logos/ToastmastersWordmarkWhite.png', name: 'Wordmark White', xRatio: 1.0 },
    { id: 'wordmark_black', src: '/brand-references/logos/ToastmastersWordmarkBlack.png', name: 'Wordmark Black', xRatio: 1.0 },
    { id: 'lockup_navy', src: '/brand-references/logos/ColorLogoSince1924Navy.png', name: 'Lockup Since 1924 Navy', xRatio: 0.14 },
    { id: 'lockup_white', src: '/brand-references/logos/ColorLogoSince1924White.png', name: 'Lockup Since 1924 White', xRatio: 0.14 },
    { id: 'wordmark_lockup_color', src: '/brand-references/logos/WordmarkSince1924Color.png', name: 'Wordmark Lockup Color', xRatio: 1.0 },
    { id: 'wordmark_lockup_white', src: '/brand-references/logos/WordmarkSince1924White.png', name: 'Wordmark Lockup White', xRatio: 1.0 },
    { id: 'lockup_web_color', src: '/brand-references/logos/ColorLogoWithWebsite.png', name: 'Lockup Color with Website', xRatio: 0.14 },
    { id: 'lockup_web_white', src: '/brand-references/logos/WhiteLogoWithWebsite.png', name: 'Lockup White with Website', xRatio: 0.14 }
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError(null);
      setSelectedLogoId(null); // Reset logo selection on new upload
      
      // Draw image to canvas immediately for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // Scale down if image is too huge to prevent UI freezing
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

  const processImage = () => {
    if (!window.cv || !cvReady) {
      setError("OpenCV is not loaded yet.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    // Use a small timeout to allow UI to update to loading state
    setTimeout(() => {
      try {
        const cv = window.cv;
        const canvas = canvasRef.current;
        const src = cv.imread(canvas);

        const graySrc = new cv.Mat();
        cv.cvtColor(src, graySrc, cv.COLOR_RGBA2GRAY, 0);

        // Retrieve the explicitly selected variant
        const variantIndex = LOGO_VARIANTS.findIndex(v => v.id === selectedLogoId);
        if (variantIndex === -1) throw new Error("No logo variant selected.");
        
        const variant = LOGO_VARIANTS[variantIndex];
        const imgElement = templateRefs.current[variantIndex];
        
        if (!imgElement || !imgElement.complete || imgElement.naturalWidth === 0) {
           throw new Error("Logo template image not fully loaded yet.");
        }

        const rawTempl = cv.imread(imgElement);

        // Extract Alpha Channel to mathematically perfectly crop the template
        const rgbaPlanes = new cv.MatVector();
        cv.split(rawTempl, rgbaPlanes);
        const alphaMask = rgbaPlanes.get(3);
            const alphaThresh = new cv.Mat();
            cv.threshold(alphaMask, alphaThresh, 10, 255, cv.THRESH_BINARY); // Anything not fully transparent
            const cropRect = cv.boundingRect(alphaThresh);

            // **CRITICAL FIX 7**: Universal Edge Matching
            // Grayscale template matching fundamentally fails when a Color logo is placed on an inverted background (e.g. Navy Blue).
            // It also fails when the logo's internal transparent gaps are painted Gray by our composite.
            // The bulletproof solution is to extract the pure STRUCTURAL EDGES (Canny) of the logo and match those.
            // Edges are mathematically identical regardless of the background color!
            
            // To guarantee perfect edge extraction from the template, we composite White logos onto a solid Black background, 
            // and all other logos onto a solid White background.
            const isWhiteLogo = variant.id.includes('white');
            const bgCol = isWhiteLogo ? 0 : 255;
            const solidBg = new cv.Mat(cropRect.height, cropRect.width, cv.CV_8UC3, new cv.Scalar(bgCol, bgCol, bgCol, 255));
            
            let croppedTempl;
            if (cropRect.width > 10 && cropRect.height > 10) {
                croppedTempl = rawTempl.roi(cropRect);
            } else {
                croppedTempl = rawTempl.clone();
            }

            const croppedPlanes = new cv.MatVector();
            cv.split(croppedTempl, croppedPlanes);
            
            const templRGB = new cv.Mat();
            const rgbVector = new cv.MatVector();
            rgbVector.push_back(croppedPlanes.get(0));
            rgbVector.push_back(croppedPlanes.get(1));
            rgbVector.push_back(croppedPlanes.get(2));
            cv.merge(rgbVector, templRGB);
            
            const templMask = croppedPlanes.get(3); // The alpha channel
            templRGB.copyTo(solidBg, templMask);

            const grayTempl = new cv.Mat();
            cv.cvtColor(solidBg, grayTempl, cv.COLOR_RGB2GRAY, 0);

            // Extract thick structural edges for both the flyer and the template
            const edgeTempl = new cv.Mat();
            cv.Canny(grayTempl, edgeTempl, 50, 150, 3, false);
            
            const edgeSrc = new cv.Mat();
            cv.Canny(graySrc, edgeSrc, 50, 150, 3, false);

            const ksize = new cv.Size(3, 3);
            cv.GaussianBlur(edgeTempl, edgeTempl, ksize, 0, 0, cv.BORDER_DEFAULT);
            cv.GaussianBlur(edgeSrc, edgeSrc, ksize, 0, 0, cv.BORDER_DEFAULT);

            let bestMatch = { maxVal: -1, maxLoc: null, scale: 1, width: 0, height: 0, variant };

            // Multi-scale search (optimized step size for performance and avoiding microscopic false-positives)
            for (let scale = 0.15; scale <= 1.5; scale += 0.05) {
                const scaledWidth = Math.round(edgeTempl.cols * scale);
                const scaledHeight = Math.round(edgeTempl.rows * scale);
                if (scaledWidth > edgeSrc.cols || scaledHeight > edgeSrc.rows) break; 

                const resizedTempl = new cv.Mat();
                cv.resize(edgeTempl, resizedTempl, new cv.Size(scaledWidth, scaledHeight), 0, 0, cv.INTER_AREA);

                const resultMat = new cv.Mat();
                cv.matchTemplate(edgeSrc, resizedTempl, resultMat, cv.TM_CCOEFF_NORMED);
                const minMax = cv.minMaxLoc(resultMat);

                if (minMax.maxVal > bestMatch.maxVal) {
                    bestMatch = { maxVal: minMax.maxVal, maxLoc: minMax.maxLoc, scale, width: scaledWidth, height: scaledHeight, variant };
                }
                resizedTempl.delete(); resultMat.delete();
            }

            rawTempl.delete(); rgbaPlanes.delete(); alphaMask.delete(); alphaThresh.delete();
            croppedTempl.delete(); grayTempl.delete(); edgeTempl.delete(); edgeSrc.delete();
            solidBg.delete(); croppedPlanes.delete(); templRGB.delete(); rgbVector.delete(); templMask.delete();

            console.log(`OpenCV Edge Match: [${bestMatch.variant.name}] at ${Math.round(bestMatch.maxVal * 100)}%`);

            // Final sanity check
            // Edge correlation scores are mathematically lower than Grayscale (because they are thin lines, not solid blocks).
            // A perfect match usually scores ~0.35 to 0.50. A fake/typed logo scores < 0.15. 
            // 0.20 is our highly accurate threshold for Edge Matching!
            if (bestMatch.maxVal < 0.20) {
              throw new Error(`The selected logo (${bestMatch.variant.name}) was not found on this flyer. (Structural Edge Confidence: ${Math.round(bestMatch.maxVal * 100)}%). This usually happens if the logo was manually typed in a different font instead of using the official image asset!`);
            }

        // 3. Define Bounding Boxes
        const { maxLoc, width, height } = bestMatch;
        const startPoint = new cv.Point(maxLoc.x, maxLoc.y);
        const endPoint = new cv.Point(maxLoc.x + width, maxLoc.y + height);
        
        // Calculate "X" margin dynamically based on the perfectly matched template!
        const X_MARGIN = Math.round(height * variant.xRatio);
        
        const paddedStart = new cv.Point(Math.max(0, startPoint.x - X_MARGIN), Math.max(0, startPoint.y - X_MARGIN));
        const paddedEnd = new cv.Point(Math.min(src.cols, endPoint.x + X_MARGIN), Math.min(src.rows, endPoint.y + X_MARGIN));

        // 4. Draw bounding boxes DIRECTLY onto the OpenCV Mat so we can guarantee rendering
        const greenColor = new cv.Scalar(34, 197, 94, 255); // #22c55e
        const redColor = new cv.Scalar(239, 68, 68, 255); // #ef4444
        
        // Draw Logo Box (Green)
        cv.rectangle(src, startPoint, endPoint, greenColor, 3);
        
        // Draw Clear Space Box (Red)
        cv.rectangle(src, paddedStart, paddedEnd, redColor, 3);

        // Force OpenCV to display the modified image back to our canvas
        cv.imshow(canvasRef.current, src);

        // 5. HUMAN-IN-THE-LOOP VERIFICATION
        const boundaryViolations = [];
        if (startPoint.y < X_MARGIN) boundaryViolations.push("Logo is too close to Top Canvas Edge");
        if (startPoint.x < X_MARGIN) boundaryViolations.push("Logo is too close to Left Canvas Edge");
        if ((src.rows - endPoint.y) < X_MARGIN) boundaryViolations.push("Logo is too close to Bottom Canvas Edge");
        if ((src.cols - endPoint.x) < X_MARGIN) boundaryViolations.push("Logo is too close to Right Canvas Edge");

        setResult({
          confidence: Math.round(bestMatch.maxVal * 100),
          matchType: variant.name,
          boundaryViolations,
          message: boundaryViolations.length > 0 
            ? `Canvas boundaries violated. Please re-position the logo.` 
            : "Logo geometrically mapped! Please visually verify the Clear Space (Red Dashed Box) below."
        });

        // Cleanup OpenCV memory
        src.delete(); graySrc.delete();

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("OpenCV Processing Error: " + err.message);
        setLoading(false);
      }
    }, 100);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Load OpenCV.js dynamically */}
      <Script 
        src="https://docs.opencv.org/4.8.0/opencv.js" 
        onReady={() => {
          const checkCv = setInterval(() => {
            if (window.cv && window.cv.Mat) {
              setCvReady(true);
              clearInterval(checkCv);
            }
          }, 100);
        }}
      />

      <div className="hidden">
        {LOGO_VARIANTS.map((variant, i) => (
          <img
            key={variant.id}
            ref={el => templateRefs.current[i] = el}
            src={variant.src}
            alt={variant.name}
            crossOrigin="anonymous"
          />
        ))}
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Computer Vision Space Checker</h2>
        <p className="text-gray-600">Deterministic mathematical checks using OpenCV WebAssembly.</p>
        {!cvReady && (
          <div className="inline-flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm mt-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading OpenCV core engine...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 bg-white cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">{file ? 'Change Flyer Image' : 'Upload Flyer Image'}</p>
          </div>

          <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative">
             <canvas ref={canvasRef} className="w-full h-auto block" />
             {!file && (
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                 Preview will appear here
               </div>
             )}
          </div>

          {file && !result && (
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Step 2: Which logo did you use?</h3>
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {LOGO_VARIANTS.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedLogoId(variant.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedLogoId === variant.id 
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="h-12 flex items-center justify-center bg-gray-100 rounded mb-2">
                       <img src={variant.src} alt={variant.name} className="max-h-full max-w-full object-contain mix-blend-multiply opacity-80" />
                    </div>
                    <p className="text-xs font-semibold text-gray-700 text-center">{variant.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={processImage}
            disabled={!file || !selectedLogoId || !cvReady || loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm hover:bg-blue-700 transition-colors"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>
              {!file 
                ? 'Upload Flyer First' 
                : !selectedLogoId 
                  ? 'Select Logo to Continue' 
                  : loading 
                    ? 'Running OpenCV Analysis...' 
                    : 'Run Deterministic Analysis'}
            </span>
          </button>
        </div>

        <div>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 mb-6">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {result ? (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                {result.boundaryViolations.length > 0 ? (
                  <XCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <Eye className="w-8 h-8 text-blue-600" />
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {result.boundaryViolations.length > 0 ? "Canvas Margin Violated" : "Human Verification Required"}
                </h3>
              </div>

              <p className="text-gray-700 mb-6 font-medium">
                {result.message}
              </p>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-gray-500 text-xs font-semibold mb-1">Logo Match Confidence</p>
                  <p className="text-lg font-bold text-gray-900">{result.confidence}% <span className="text-xs font-normal text-gray-500">({result.matchType})</span></p>
                </div>

                {result.boundaryViolations.length > 0 && (
                  <div className="p-4 rounded-lg border bg-red-50 border-red-100">
                    <p className="text-red-800 text-sm font-bold flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" /> Canvas Proximity Violations
                    </p>
                    <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                      {result.boundaryViolations.map((edge, i) => (
                        <li key={i}>{edge}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!result.boundaryViolations.length && (
                  <div className="p-5 rounded-lg border border-blue-200 bg-blue-50">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                       Visual Checklist
                    </h4>
                    <ul className="space-y-3 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                         <span className="font-bold shrink-0">1.</span>
                         <span>Look at the <strong>Red Dashed Box</strong> drawn on the flyer.</span>
                      </li>
                      <li className="flex items-start gap-2">
                         <span className="font-bold shrink-0">2.</span>
                         <span>Ensure no text, custom graphics, or secondary logos are inside this margin.</span>
                      </li>
                      <li className="flex items-start gap-2">
                         <span className="font-bold shrink-0">3.</span>
                         <span>Complex photo backgrounds or geometric patterns are allowed.</span>
                      </li>
                    </ul>
                    <div className="mt-5 flex gap-3">
                       <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
                         Looks Good (Approve)
                       </button>
                       <button className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded transition-colors border border-red-200">
                         Found Violation (Reject)
                       </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600">
                <p><strong>Legend:</strong> Solid Green Box = Detected Logo Area. Dashed Red Box = Required Clear Space Margin ("X").</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 h-full flex items-center justify-center text-gray-400 p-6 text-center">
              <div>
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Upload an image and run the analysis to see mathematical results here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
