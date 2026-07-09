"use client";

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';

export default function CheckerTool() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const analyzeFile = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64File = reader.result;
        const mimeType = file.type;

        const response = await fetch('/api/check-brand-compliance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ base64File, mimeType }),
        });

        if (!response.ok) {
          let errMessage = 'Analysis failed. Please try again.';
          try {
            const errData = await response.json();
            errMessage = errData.error || errMessage;
          } catch(e) {}
          throw new Error(errMessage);
        }

        const data = await response.json();
        setResult(data);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Brand Compliance Checker</h2>
        <p className="text-gray-600">Upload your flyer (JPG, PNG, PDF) to check if it meets Toastmasters brand guidelines.</p>
      </div>

      {!result && (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors bg-white cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/jpeg,image/png,application/pdf"
          />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium text-lg mb-2">
            {file ? file.name : 'Click or drag file to this area to upload'}
          </p>
          <p className="text-gray-500 text-sm">Supports JPG, PNG and PDF</p>
          
          {file && (
            <button 
              onClick={(e) => { e.stopPropagation(); analyzeFile(); }}
              disabled={loading}
              className="mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze File</span>
              )}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center space-x-2">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className={`p-6 border-b flex items-center justify-between ${result.isCompliant ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-center space-x-3">
              {result.isCompliant ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <h3 className={`text-xl font-bold ${result.isCompliant ? 'text-green-900' : 'text-red-900'}`}>
                  {result.isCompliant ? 'Fully Compliant!' : 'Compliance Issues Detected'}
                </h3>
              </div>
            </div>
            <button 
              onClick={() => { setResult(null); setFile(null); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Check Another File
            </button>
          </div>

          <div className="p-6 space-y-6">
            {result.checklist && result.checklist.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span>Compliance Checklist</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.checklist.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border flex items-start space-x-3 ${item.status === 'pass' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="mt-1">
                        {item.status === 'pass' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${item.status === 'pass' ? 'text-green-900' : 'text-red-900'}`}>{item.category}</p>
                        <p className={`text-sm mt-1 ${item.status === 'pass' ? 'text-green-700' : 'text-red-700'}`}>{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {result.referenceImagesUsed > 0 && (
                  <div className="mt-6 text-center">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                      Powered by Gemini (using {result.referenceImagesUsed} reference image{result.referenceImagesUsed > 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
