"use client";
import React, { useState, useRef, useEffect } from 'react';
import TopBar from '@/components/toastmasters/TopBar';
import EditorPane from '@/components/toastmasters/EditorPane';
import PreviewPane from '@/components/toastmasters/PreviewPane';
import FeedbackWidget from '@/components/toastmasters/FeedbackWidget';
import { useRouter } from 'next/navigation';
import { domToPng, domToJpeg } from 'modern-screenshot';
import jsPDF from 'jspdf';
import { Edit3, Eye, Download, MessageCircle, FileText, Image as ImageIcon, X } from 'lucide-react';

export default function AgendaCreator() {
  const router = useRouter();
  const [mobileTab, setMobileTab] = useState('edit'); // 'edit', 'preview'
  const [isMobile, setIsMobile] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const contentRef = useRef(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [clubInfo, setClubInfo] = useState({
    clubName: 'Walkie Talkie Nanganallur',
    district: '120',
    division: 'E',
    area: '1',
    mission: 'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self-confidence and personal growth.',
    meetingNumber: '311',
    date: '2025-11-16',
    time: '16:00',
    meetingType: 'Zoom Meeting',
    meetingId: '890 9788 8695',
    passcode: 'wtnmeet',
    theme: 'Superpowers',
    wordOfTheDay: 'Prowess'
  });

  const [agendaItems, setAgendaItems] = useState([
    {
      id: '1',
      section: 'Introduction',
      time: '04:00',
      title: 'Sergeant-At-Arms officially initiates the meeting',
      presenter: 'TM Subhashree',
      duration: 3,
      details: ''
    },
    {
      id: '2',
      section: 'Introduction',
      time: '04:03',
      title: 'Presiding Officer address',
      presenter: 'TM Susmitha',
      duration: 5,
      details: ''
    },
    {
      id: '3',
      section: 'Introduction',
      time: '04:08',
      title: 'Toastmaster of the Day (TMoD) introduces the theme of the day and outlines the structure of each Toastmasters meeting',
      presenter: 'TM Rajarajeswari Natarajan',
      duration: 5,
      details: ''
    },
    {
      id: '4',
      section: 'Introduction',
      time: '04:13',
      title: 'General Evaluator and TAG Briefing',
      presenter: '',
      duration: 0,
      details: ''
    },
    {
      id: '5',
      section: 'Prepared Speech',
      time: '04:20',
      title: 'Speech Title: Create; Not Consume | Project: Level 1 Project 1',
      presenter: 'TM Anantha Subramanian',
      duration: 10,
      details: 'Pathway: Visionary Communication | Time: 5-7 minutes',
      pathwayColors: { green: 4, yellow: 6, red: 7 }
    },
    {
      id: '6',
      section: 'Prepared Speech',
      time: '04:30',
      title: 'Speech Title: M for - Certainly Mathematics | Project: Level 2 Project 3',
      presenter: 'DTM Easwaran Ram',
      duration: 10,
      details: 'Pathway: Visionary Communication | Time: 5-7 minutes',
      pathwayColors: { green: 4, yellow: 6, red: 7 }
    },
    {
      id: '7',
      section: 'Table Topics Segment',
      time: '04:40',
      title: 'Table Topics Master conducts impromptu speaking exercises',
      presenter: '',
      duration: 0,
      details: ''
    },
    {
      id: '8',
      section: 'Evaluation',
      time: '04:55',
      title: 'Prepared speech evaluation - Speaker - 1',
      presenter: 'TM Susmitha',
      duration: 5,
      details: '',
      pathwayColors: { green: 2, yellow: 2.5, red: 3 }
    },
    {
      id: '9',
      section: 'Evaluation',
      time: '05:00',
      title: 'Prepared speech evaluation - Speaker - 2',
      presenter: 'TM Bhooma',
      duration: 5,
      details: '',
      pathwayColors: { green: 2, yellow: 2.5, red: 3 }
    },
    {
      id: '10',
      section: 'Evaluation',
      time: '05:05',
      title: 'TAG Report',
      presenter: '',
      duration: 0,
      details: ''
    },
    {
      id: '11',
      section: 'Evaluation',
      time: '05:15',
      title: 'General Evaluator Report and handover to Presiding officer',
      presenter: '',
      duration: 0,
      details: ''
    },
    {
      id: '12',
      section: 'Conclusion',
      time: '05:25',
      title: 'Presentation of Awards and adjournment of Weekly Meeting',
      presenter: 'TM Susmitha',
      duration: 10,
      details: ''
    },
    {
      id: '13',
      section: 'Club Elections',
      time: '05:35',
      title: 'Election chair conducting Club Ex-Com elections',
      presenter: 'TM Anantha Subramanian',
      duration: 0,
      details: ''
    }
  ]);

  const [rolePlayers, setRolePlayers] = useState({
    tmod: 'TM Rajarajeswari Natarajan',
    generalEvaluator: 'TM Anand Venktraman',
    tableTopicsMaster: 'TM Subhashree',
    timer: 'TM Chitra Venkatesan',
    ahCounter: 'TM Savitha',
    grammarian: 'TM Srijanani'
  });

  const [executiveCommittee, setExecutiveCommittee] = useState({
    immediatePastPresident: 'TM Anantha Subramanian',
    president: 'TM Susmitha',
    vpEducation: 'TM Srijanani',
    vpMembership: 'TM Sripadraj',
    vpPublicRelations: 'TM Sarathy',
    secretary: 'TM Madhavan',
    treasurer: 'TM Niveditha',
    sergeantAtArms: 'TM Subhashree'
  });

  const handleDownloadPDF = async () => {
    if (!contentRef.current) {
      console.error('Content ref is null');
      alert('Error: Content not found. Please try again.');
      return;
    }

    try {
      console.log('Starting PDF generation...');

      // Use modern-screenshot to generate PNG
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      console.log('PNG created successfully');

      // Convert to PDF
      const img = new Image();
      img.src = dataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Account for margins when calculating available space
      const marginTop = 10;
      const marginBottom = 10;
      const availableHeight = pdfHeight - marginTop - marginBottom;
      const availableWidth = pdfWidth - 10; // Small horizontal margin

      // Calculate ratio based on available space (not full page)
      const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = marginTop;

      pdf.addImage(dataUrl, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Agenda-${clubInfo.date}.pdf`);
      console.log('PDF saved');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message || error}`);
    }
  };

  const handleDownloadJPG = async () => {
    if (!contentRef.current) {
      console.error('Content ref is null');
      alert('Error: Content not found. Please try again.');
      return;
    }

    try {
      console.log('Starting JPG generation...');

      // Use modern-screenshot to generate JPEG
      const dataUrl = await domToJpeg(contentRef.current, {
        scale: 2,
        quality: 0.9,
        backgroundColor: '#ffffff'
      });

      console.log('JPEG created successfully');

      // Create and trigger download - improved for mobile compatibility
      const link = document.createElement('a');
      link.download = `Agenda-${clubInfo.date}.jpg`;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);

      // Small delay for mobile browsers
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
        console.log('JPG saved');
      }, 100);
    } catch (error) {
      console.error('Error generating JPG:', error);
      alert(`Failed to generate JPG: ${error.message || error}`);
    }
  };

  // Format date for display
  const formatDateForShare = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Format time for display
  const formatTimeForShare = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleShareWhatsApp = async () => {
    if (!contentRef.current) {
      console.error('Content ref is null');
      alert('Error: Content not found. Please try again.');
      return;
    }

    try {
      console.log('Starting WhatsApp share...');

      // Generate high-resolution image for sharing
      // A4 at 96 DPI = 794 x 1123 pixels, at 2x = 1588 x 2246
      const dataUrl = await domToJpeg(contentRef.current, {
        scale: 3, // Higher scale for better quality when shared
        quality: 0.95,
        backgroundColor: '#ffffff'
      });

      // Create caption
      const caption = `📋 Meeting Agenda
🏛️ ${clubInfo.clubName} Toastmasters Club
📅 ${formatDateForShare(clubInfo.date)}
⏰ ${formatTimeForShare(clubInfo.time)} onwards

Created with TI Tools ✨`;

      // Convert data URL to blob for sharing
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `Agenda-${clubInfo.date}.jpg`, { type: 'image/jpeg' });

      // Detect if we're on a REAL mobile device (not Windows with Web Share API)
      const isMobileDevice = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      // Only use native share on actual mobile devices
      if (isMobileDevice && navigator.canShare && navigator.canShare({ files: [file] })) {
        // Mobile: Use native share
        await navigator.share({
          files: [file],
          title: 'Meeting Agenda',
          text: caption
        });
        console.log('Shared via Web Share API');
      } else {
        // Desktop (Windows/Mac): Download image first, then open WhatsApp Web

        // Step 1: Download the image
        const link = document.createElement('a');
        link.download = `Agenda-${clubInfo.date}.jpg`;
        link.href = dataUrl;
        link.click();

        // Step 2: Open WhatsApp Web with caption
        const encodedCaption = encodeURIComponent(caption);

        // Small delay to ensure download starts before opening WhatsApp
        setTimeout(() => {
          window.open(`https://web.whatsapp.com/send?text=${encodedCaption}`, '_blank');
        }, 500);

        // Step 3: Show instructions
        alert('Image downloaded! In WhatsApp Web:\n\n1. Click the 📎 attachment icon\n2. Select the downloaded image\n3. Send to your group!');
      }
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      if (error.name !== 'AbortError') {
        alert(`Failed to share: ${error.message || error}`);
      }
    }
  };

  // Show agenda creator
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Hide TopBar download buttons on mobile - they're in the tab bar */}
      <TopBar
        onDownloadPDF={handleDownloadPDF}
        onDownloadJPG={handleDownloadJPG}
        onBackToHome={() => router.push('/toastmasters')}
        hideDownloadButtons={isMobile}
      />

      <main className={`flex-1 flex overflow-hidden relative ${isMobile ? 'pb-16' : ''}`}>
        {/* Desktop: Side-by-side layout */}
        {/* Mobile: Show only active tab */}

        {/* Editor Pane */}
        <div className={`
          ${isMobile
            ? mobileTab === 'edit' ? 'flex w-full' : 'hidden'
            : 'w-1/2 max-w-[700px]'
          } 
          border-r border-slate-200 bg-white z-10 shadow-xl flex-col overflow-hidden
        `}>
          <EditorPane
            clubInfo={clubInfo}
            setClubInfo={setClubInfo}
            agendaItems={agendaItems}
            setAgendaItems={setAgendaItems}
            rolePlayers={rolePlayers}
            setRolePlayers={setRolePlayers}
            executiveCommittee={executiveCommittee}
            setExecutiveCommittee={setExecutiveCommittee}
          />
        </div>

        {/* Preview Pane - Always rendered for capture */}
        {/* On mobile when not active: positioned off-screen but still rendered */}
        <div className={`
          ${isMobile
            ? mobileTab === 'preview'
              ? 'flex w-full'
              : 'fixed left-[-9999px] top-0 w-[210mm]'
            : 'flex-1'
          } 
          bg-slate-100
        `}>
          <PreviewPane
            clubInfo={clubInfo}
            agendaItems={agendaItems}
            rolePlayers={rolePlayers}
            executiveCommittee={executiveCommittee}
            contentRef={contentRef}
          />
        </div>
      </main>

      {/* Mobile Bottom Tab Bar - Fixed at bottom */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around safe-area-pb z-40">
          <button
            onClick={() => setMobileTab('edit')}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${mobileTab === 'edit'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <Edit3 size={20} />
            <span className="text-xs font-medium">Edit</span>
          </button>

          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${mobileTab === 'preview'
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <Eye size={20} />
            <span className="text-xs font-medium">Preview</span>
          </button>

          <button
            onClick={() => setShowDownloadModal(true)}
            className="flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-lg text-slate-500 hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            <Download size={20} />
            <span className="text-xs font-medium">Download</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-lg text-slate-500 hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-xs font-medium">Share</span>
          </button>
        </div>
      )}

      {/* Mobile Download Format Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowDownloadModal(false)}>
          <div
            className="bg-white w-full max-w-md rounded-t-2xl p-6 pb-8 safe-area-pb animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Download Format</h3>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  handleDownloadPDF();
                }}
                className="w-full flex items-center gap-4 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText size={24} className="text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">PDF Format</p>
                  <p className="text-sm text-slate-500">Best for printing (A4 size)</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  handleDownloadJPG();
                }}
                className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ImageIcon size={24} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">JPG Image</p>
                  <p className="text-sm text-slate-500">Best for sharing online</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <FeedbackWidget />
    </div>
  );
}
