"use client";

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestClearSpaceTool() {
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

  const analyzeFile = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64File = reader.result;
        const mimeType = file.type;

        const response = await fetch('/api/test-clear-space', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64File, mimeType }),
        });

        if (!response.ok) {
          let errMessage = 'Analysis failed.';
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
      setError(err.message);
      setLoading(false);
    }
  };

  const renderEdgeStatus = (label, edgeData) => {
    if (!edgeData) return null;
    return (
      <div className={`p-4 rounded-lg border flex flex-col space-y-2 ${edgeData.status === 'pass' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
        <div className="flex items-center space-x-2">
          {edgeData.status === 'pass' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
          <span className={`font-semibold ${edgeData.status === 'pass' ? 'text-green-900' : 'text-red-900'}`}>{label}</span>
        </div>
        <p className="text-sm text-gray-700">{edgeData.reasoning}</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Clear Space Debugger</h2>
        <p className="text-gray-600">Strict isolation test for Logo Clear Space rule.</p>
      </div>

      {!result && (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 bg-white cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">{file ? file.name : 'Upload flyer to test clear space'}</p>
          {file && (
            <button 
              onClick={(e) => { e.stopPropagation(); analyzeFile(); }}
              disabled={loading}
              className="mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50 inline-flex items-center space-x-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Analyzing...' : 'Analyze File'}</span>
            </button>
          )}
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      {result && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              {result.clearSpaceCompliant ? <CheckCircle className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-red-600" />}
              <h3 className={`text-xl font-bold ${result.clearSpaceCompliant ? 'text-green-900' : 'text-red-900'}`}>
                {result.clearSpaceCompliant ? 'Clear Space Passed' : 'Clear Space Violated'}
              </h3>
            </div>
            <button onClick={() => { setResult(null); setFile(null); }} className="px-4 py-2 border rounded-lg text-sm">Retry</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderEdgeStatus("Top Space", result.topSpace)}
            {renderEdgeStatus("Bottom Space", result.bottomSpace)}
            {renderEdgeStatus("Left Space", result.leftSpace)}
            {renderEdgeStatus("Right Space", result.rightSpace)}
          </div>
        </div>
      )}
    </div>
  );
}
