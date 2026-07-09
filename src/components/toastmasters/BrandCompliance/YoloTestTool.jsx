"use client";

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function YoloTestTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);

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
          originalImageRef.current = img;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          const MAX_WIDTH = 800;
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

  const processImage = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Prepare FormData (our local FastAPI backend expects a file upload)
      const formData = new FormData();
      formData.append('file', file);

      // 2. Call our Local YOLO11 PyTorch Backend
      const response = await fetch('http://localhost:8000/api/detect', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Roboflow Error: ${JSON.stringify(data.error || data)}`);
      }
      setResult(data);
      console.log("Roboflow Response:", data);

      // 3. Draw bounding boxes on canvas if available
      // The exact response format depends on the workflow, but standard Roboflow object detection 
      // returns an array of predictions with x, y, width, height.
      // We will check multiple possible response structures.
      let predictions = [];
      if (data && data.predictions && Array.isArray(data.predictions)) {
          predictions = data.predictions;
      } else if (data && data.outputs && Array.isArray(data.outputs)) {
          predictions = data.outputs; // Workflows sometimes return outputs
      }

      if (predictions.length > 0) {
         const canvas = canvasRef.current;
         const ctx = canvas.getContext('2d');
         const img = originalImageRef.current;
         const scaleX = canvas.width / img.width;
         const scaleY = canvas.height / img.height;
         
         predictions.forEach(pred => {
            let x, y, w, h;
            // Handle our custom FastAPI response format (x_min, y_min, x_max, y_max)
            if (pred.x_min !== undefined && pred.y_max !== undefined) {
               x = pred.x_min;
               y = pred.y_min;
               w = pred.x_max - pred.x_min;
               h = pred.y_max - pred.y_min;
            } else if (pred.x !== undefined && pred.y !== undefined && pred.width !== undefined && pred.height !== undefined) {
               // Fallback to Roboflow format if used later
               x = pred.x - (pred.width / 2);
               y = pred.y - (pred.height / 2);
               w = pred.width;
               h = pred.height;
            } else {
               x = pred.xmin || 0;
               y = pred.ymin || 0;
               w = pred.width || (pred.xmax - pred.xmin) || 0;
               h = pred.height || (pred.ymax - pred.ymin) || 0;
            }

            const drawX = x * scaleX;
            const drawY = y * scaleY;
            const drawW = w * scaleX;
            const drawH = h * scaleY;

            ctx.strokeStyle = '#ef4444'; // red
            ctx.lineWidth = 3;
            ctx.strokeRect(drawX, drawY, drawW, drawH);

            const className = pred.class || pred.name || "Object";
            const confidence = pred.confidence ? Math.round(pred.confidence * 100) : "?";

            ctx.fillStyle = '#ef4444';
            ctx.font = '16px sans-serif';
            ctx.fillText(`${className} (${confidence}%)`, drawX, drawY > 20 ? drawY - 5 : drawY + 15);
         });
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">YOLO Model Tester</h2>
        <p className="text-gray-600">Testing Roboflow Serverless API endpoint.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 bg-white cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">{file ? 'Change Image' : 'Upload Image'}</p>
          </div>

          <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative">
             <canvas ref={canvasRef} className="w-full h-auto block" />
             {!file && (
               <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                 Preview will appear here
               </div>
             )}
          </div>

          <button 
            onClick={processImage}
            disabled={!file || loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm hover:bg-blue-700 transition-colors"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{loading ? 'Running Local YOLO Inference...' : 'Run Analysis via Local Backend'}</span>
          </button>
        </div>

        <div>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 mb-6">
              <span className="font-semibold">Error:</span> {error}
              <p className="text-sm mt-2 opacity-80">Make sure your local Python FastAPI server is running on port 8000!</p>
            </div>
          )}

          {result ? (
            <div className="bg-white p-6 rounded-xl border shadow-sm h-full max-h-[800px] flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Raw API Response</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto flex-1 font-mono text-xs">
                <pre>{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 h-full flex items-center justify-center text-gray-400 p-6 text-center">
              <div>
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Upload an image and run the analysis to see YOLO JSON payload here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
