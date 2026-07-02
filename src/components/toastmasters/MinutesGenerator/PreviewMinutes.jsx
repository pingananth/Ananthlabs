import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, Copy, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { DEFAULT_TEMPLATE } from './UploadAgenda';
import { trackEvent } from '../../../utils/analytics';

const compileTemplate = (template, data) => {
    let result = template || DEFAULT_TEMPLATE;
    
    // Basic replacements
    result = result.replace(/\[CLUB_NAME\]/g, data.meetingInfo.clubName || '[CLUB_NAME]');
    result = result.replace(/\[DATE\]/g, data.meetingInfo.date || '[DATE]');
    result = result.replace(/\[NUMBER\]/g, data.meetingInfo.number || '[NUMBER]');
    result = result.replace(/\[MEETING_NUMBER\]/g, data.meetingInfo.number || '[MEETING_NUMBER]');
    result = result.replace(/\[THEME\]/g, data.meetingInfo.theme || '[THEME]');
    result = result.replace(/\[LOCATION\]/g, data.meetingInfo.location || 'Not Specified');
    result = result.replace(/\[WORD_OF_THE_DAY\]/g, data.meetingInfo.wordOfTheDay || 'Not Specified');
    
    // Attendees
    const attendeesStr = Array.isArray(data.attendees) ? data.attendees.join(', ') : data.attendees;
    result = result.replace(/\[ATTENDEES\]/g, attendeesStr || 'None listed');
    
    // Officers
    result = result.replace(/\[PRESIDENT\]/g, data.officers.president || 'N/A');
    result = result.replace(/\[VPE\]/g, data.officers.vpe || 'N/A');
    result = result.replace(/\[VPM\]/g, data.officers.vpm || 'N/A');
    result = result.replace(/\[VPPR\]/g, data.officers.vppr || 'N/A');
    result = result.replace(/\[SECRETARY\]/g, data.officers.secretary || 'N/A');
    result = result.replace(/\[TREASURER\]/g, data.officers.treasurer || 'N/A');
    result = result.replace(/\[OFFICER_SAA\]/g, data.officers.saa || 'N/A');
    result = result.replace(/\[IPP\]/g, data.officers.ipp || 'N/A');
    
    // Notes
    result = result.replace(/\[NOTES\]/g, data.notes || 'None.');
    
    // Roles & Officers
    result = result.replace(/\[PRESIDING_OFFICER\]/g, data.roles.presidingOfficer || '[PRESIDING_OFFICER]');
    result = result.replace(/\[TMOD_NAME\]/g, data.roles.tmod || '[TMOD_NAME]');
    result = result.replace(/\[GE_NAME\]/g, data.roles.generalEvaluator || '[GE_NAME]');
    result = result.replace(/\[TIMER_NAME\]/g, data.roles.timer || '[TIMER_NAME]');
    result = result.replace(/\[AH_COUNTER_NAME\]/g, data.roles.ahCounter || '[AH_COUNTER_NAME]');
    result = result.replace(/\[GRAMMARIAN_NAME\]/g, data.roles.grammarian || '[GRAMMARIAN_NAME]');
    result = result.replace(/\[SAA_NAME\]/g, data.roles.saa || '[SAA_NAME]');
    result = result.replace(/\[TT_MASTER_NAME\]/g, data.roles.tableTopicsMaster || '[TT_MASTER_NAME]');
    
    // Time
    result = result.replace(/\[TIME\]/g, 'the end of the meeting');
    result = result.replace(/\[NEXT_MEETING_DATE\]/g, 'the next scheduled meeting');
    
    // Lists and loops
    result = result.replace(/\[COMMENDATIONS_LIST\]/g, data.generalEvaluation.commendations || 'None mentioned.');
    result = result.replace(/\[RECOMMENDATIONS_LIST\]/g, data.generalEvaluation.recommendations || 'None mentioned.');
    
    // [FOR_EACH_SPEECH] block
    if (result.includes('[FOR_EACH_SPEECH]')) {
        const speechBlockRegex = /\[FOR_EACH_SPEECH\]\n([\s\S]*?)(?=\n\n|\n##|$)/;
        const match = result.match(speechBlockRegex);
        if (match) {
            const speechTemplate = match[1];
            const speechesStr = data.speeches.map((s, i) => {
                let st = speechTemplate;
                st = st.replace(/\[NUMBER\]/g, i + 1);
                st = st.replace(/\[SPEECH_TITLE\]/g, s.title || '');
                st = st.replace(/\[SPEAKER_NAME\]/g, s.speaker || '');
                st = st.replace(/\[PROJECT_NAME\]/g, s.project || '');
                st = st.replace(/\[DURATION\]/g, s.duration || '');
                st = st.replace(/\[SPEECH_NOTES\]/g, s.notes || '');
                return st;
            }).join('\n\n');
            result = result.replace(match[0], speechesStr);
        }
    }
    
    // [FOR_EACH_EVALUATION]
    if (result.includes('[FOR_EACH_EVALUATION]')) {
        const evalBlockRegex = /\[FOR_EACH_EVALUATION\]\n([\s\S]*?)(?=\n\n|\n##|$)/;
        const match = result.match(evalBlockRegex);
        if (match) {
            const evalTemplate = match[1];
            const evalsStr = data.evaluators.map(e => {
                let et = evalTemplate;
                et = et.replace(/\[EVALUATOR_NAME\]/g, e.evaluator || '');
                const speakerName = data.speeches[e.speakerIndex]?.speaker || 'Unknown Speaker';
                const speechTitle = data.speeches[e.speakerIndex]?.title || 'Unknown Title';
                et = et.replace(/\[SPEECH_TITLE\]/g, speechTitle);
                et = et.replace(/\[COMMENDATIONS_LIST\]/g, e.notes || '');
                et = et.replace(/\[RECOMMENDATIONS_LIST\]/g, 'Refer to notes'); 
                return et;
            }).join('\n\n');
            result = result.replace(match[0], evalsStr);
        }
    }
    
    // [FOR_EACH_TT_PARTICIPANT]
    if (result.includes('[FOR_EACH_TT_PARTICIPANT]')) {
        const ttBlockRegex = /\[FOR_EACH_TT_PARTICIPANT\]\n([\s\S]*?)(?=\n\n|\n##|$)/;
        const match = result.match(ttBlockRegex);
        if (match) {
            const ttTemplate = match[1];
            const ttStr = data.tableTopics.map(tt => {
                let t = ttTemplate;
                t = t.replace(/\[SPEAKER_NAME\]/g, tt.speaker || '');
                t = t.replace(/\[TOPIC_GIVEN\]/g, tt.topic || '');
                return t;
            }).join('\n');
            result = result.replace(match[0], ttStr);
        }
    }
    
    // [FOR_EACH_AWARD]
    if (result.includes('[FOR_EACH_AWARD]')) {
        const awardBlockRegex = /\[FOR_EACH_AWARD\]\n([\s\S]*?)(?=\n\n|\n##|$)/;
        const match = result.match(awardBlockRegex);
        if (match) {
            const awardTemplate = match[1];
            const awardsStr = Object.entries(data.awards).map(([key, value]) => {
                if (!value) return null;
                let at = awardTemplate;
                const formattedAwardName = key.replace(/([A-Z])/g, ' $1').trim();
                const capitalizedAwardName = formattedAwardName.charAt(0).toUpperCase() + formattedAwardName.slice(1);
                at = at.replace(/\[AWARD_TYPE\]/g, capitalizedAwardName);
                at = at.replace(/\[RECIPIENT_NAME\]/g, value || '');
                return at;
            }).filter(Boolean).join('\n');
            result = result.replace(match[0], awardsStr || 'None distributed.');
        }
    }
    
    return result;
};

export default function PreviewMinutes({ data, onBack }) {
    const [compiledText, setCompiledText] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        trackEvent('tm_minutes_generated_viewed');
        const result = compileTemplate(data.template, data);
        setCompiledText(result);
    }, [data]);

    const handleCopy = () => {
        trackEvent('tm_minutes_copied');
        navigator.clipboard.writeText(compiledText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownloadTXT = () => {
        trackEvent('tm_minutes_downloaded_md');
        const element = document.createElement("a");
        const file = new Blob([compiledText], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Minutes-${data.meetingInfo.date || 'meeting'}.md`;
        document.body.appendChild(element);
        element.click();
    };

    const handleDownloadPDF = () => {
        trackEvent('tm_minutes_downloaded_pdf');
        const pdf = new jsPDF();
        pdf.setFontSize(10);
        
        const splitText = pdf.splitTextToSize(compiledText, 180);
        let yPos = 15;
        
        splitText.forEach((line) => {
            if (yPos > 280) {
                pdf.addPage();
                yPos = 15;
            }
            pdf.text(line, 15, yPos);
            yPos += 5;
        });
        
        pdf.save(`Minutes-${data.meetingInfo.date || 'meeting'}.pdf`);
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Final Minutes</h2>
                    <p className="text-slate-600">Review your generated minutes based on the template.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={onBack} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium flex items-center gap-2 transition-colors">
                        <ArrowLeft size={18} /> Edit Data
                    </button>

                    <button onClick={handleCopy} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors">
                        {isCopied ? <CheckCircle size={18} /> : <Copy size={18} />}
                        {isCopied ? 'Copied!' : 'Copy Text'}
                    </button>
                    
                    <button onClick={handleDownloadTXT} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors">
                        <FileText size={18} /> Download MD
                    </button>

                    <button onClick={handleDownloadPDF} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors">
                        <Download size={18} /> Download PDF
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-slate-200">
                <textarea
                    value={compiledText}
                    onChange={(e) => setCompiledText(e.target.value)}
                    className="w-full h-[70vh] p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono whitespace-pre-wrap leading-relaxed resize-y"
                    placeholder="Compiled minutes will appear here..."
                />
            </div>
        </div>
    );
}
