"use client";
import React, { useState } from 'react';
import { Settings, Download, Share2, LayoutTemplate, ChevronDown, FileText, Image, Home, MessageCircle } from 'lucide-react';

export default function TopBar({ onDownloadPDF, onDownloadJPG, onShareWhatsApp, onBackToHome, title = "Agenda Creator", hideDownloadButtons = false }) {
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);

    return (
        <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 md:px-6 shadow-sm z-50 relative">
            <div className="flex items-center gap-2 md:gap-4">
                {onBackToHome && (
                    <button
                        onClick={onBackToHome}
                        className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <Home size={18} />
                        <span className="hidden md:inline">Home</span>
                    </button>
                )}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-md text-xs md:text-sm" style={{ backgroundColor: '#004165' }}>
                        TM
                    </div>
                    <h1 className="text-base md:text-xl font-bold truncate max-w-[150px] md:max-w-none" style={{ color: '#004165' }}>
                        {title}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Hidden for now - Future features
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <LayoutTemplate size={18} />
                    Templates
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <Settings size={18} />
                    Settings
                </button>
                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                */}

                {/* WhatsApp share removed from desktop - works better on mobile only */}

                {(onDownloadPDF || onDownloadJPG) && !hideDownloadButtons && (
                    <>
                        <div className="h-6 w-px bg-slate-200 mx-1"></div>

                        <div className="relative">
                            <button
                                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                                style={{ backgroundColor: '#004165' }}
                            >
                                <Download size={18} />
                                Download
                                <ChevronDown size={14} className={`transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showDownloadMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                                    {onDownloadPDF && (
                                        <button
                                            onClick={() => {
                                                onDownloadPDF();
                                                setShowDownloadMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                        >
                                            <FileText size={16} className="text-red-600" />
                                            <span>Download as PDF</span>
                                        </button>
                                    )}
                                    {onDownloadJPG && (
                                        <button
                                            onClick={() => {
                                                onDownloadJPG();
                                                setShowDownloadMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                        >
                                            <Image size={16} className="text-blue-600" />
                                            <span>Download as JPG</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
