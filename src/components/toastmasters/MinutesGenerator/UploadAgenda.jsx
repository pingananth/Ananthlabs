import React, { useState, useCallback } from 'react';
import { Upload, FileText, ArrowRight, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export const DEFAULT_TEMPLATE = `**[CLUB_NAME]**
**Meeting Minutes**
**Date: [DATE] | Meeting #[NUMBER] | Theme: [THEME]**
**Location: [LOCATION]**
**Word of the Day: [WORD_OF_THE_DAY]**

---

## 1. Attendees & Officers
**Attendees:** [ATTENDEES]

**Club Officers Present/Noted:**
- President: [PRESIDENT]
- VP Education: [VPE]
- VP Membership: [VPM]
- VP Public Relations: [VPPR]
- Secretary: [SECRETARY]
- Treasurer: [TREASURER]
- Sergeant at Arms: [OFFICER_SAA]
- Immediate Past President: [IPP]

## 2. Opening the Meeting

The Sergeant at Arms [SAA_NAME] started the meeting by welcoming members and guests. The SAA read out ground rules to be adhered to during the meeting.

The SAA invited the Presiding Officer [PRESIDING_OFFICER] to don the role of Presiding Officer.

The Presiding Officer [PRESIDING_OFFICER] greeted everyone and opened meeting #[MEETING_NUMBER] of [CLUB_NAME].

The Presiding Officer proceeded with a brief introduction and background of Toastmasters International and invited the TMOD, [TMOD_NAME].

## 3. Meeting Roles

**Toastmaster of the Day:** [TMOD_NAME]
**General Evaluator:** [GE_NAME]

**Meeting Roles:**
- Timer: [TIMER_NAME]
- Ah Counter: [AH_COUNTER_NAME] 
- Grammarian: [GRAMMARIAN_NAME]
- Sergeant at Arms: [SAA_NAME]

## 4. Prepared Speeches

[FOR_EACH_SPEECH]
**Speech #[NUMBER]: "[SPEECH_TITLE]" by [SPEAKER_NAME]**
- Project: [PROJECT_NAME]
- Duration: [DURATION]
- Key Points: [SPEECH_NOTES]

## 5. Speech Evaluations

[FOR_EACH_EVALUATION]
**Evaluation of "[SPEECH_TITLE]" by [EVALUATOR_NAME]**
- Commendations: [COMMENDATIONS_LIST]
- Recommendations: [RECOMMENDATIONS_LIST]

## 6. Table Topics Session

**Table Topics Master:** [TT_MASTER_NAME]

**Participants:**
[FOR_EACH_TT_PARTICIPANT]
- [SPEAKER_NAME]: [TOPIC_GIVEN]

## 7. General Evaluator Report

**General Evaluator:** [GE_NAME]

**Meeting Commendations:**
[COMMENDATIONS_LIST]

**Meeting Recommendations:**
[RECOMMENDATIONS_LIST]

## 8. Awards and Recognition

[FOR_EACH_AWARD]
- **[AWARD_TYPE]:** [RECIPIENT_NAME]

## 9. Additional Notes
[NOTES]

## 10. Closing

The meeting was adjourned at [TIME] by the Presiding Officer.

---

**Minutes compiled by:** Toastmasters AI Assistant
**Next Meeting:** [NEXT_MEETING_DATE]`;

export default function UploadAgenda({ onNext, setMinutesData, minutesData }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [isTemplateOpen, setIsTemplateOpen] = useState(false);

    const processFile = async (file) => {
        setIsProcessing(true);
        setError(null);

        try {
            // Convert file to base64
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Call the Gemini API route
            const response = await fetch('/api/extract-agenda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64Image })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to extract agenda details');
            }

            // Ensure missing nested objects exist to prevent crashes in the next step
            const safeData = {
                meetingInfo: data.meetingInfo || { clubName: '', date: '', number: '', theme: '', wordOfTheDay: '', location: '' },
                attendees: data.attendees || [],
                officers: data.officers || { president: '', vpe: '', vpm: '', vppr: '', secretary: '', treasurer: '', saa: '', ipp: '' },
                roles: data.roles || {},
                speeches: data.speeches || [],
                evaluators: data.evaluators || [],
                tableTopics: data.tableTopics || [],
                generalEvaluation: data.generalEvaluation || { commendations: '', recommendations: '' },
                awards: data.awards || {},
                notes: data.notes || ''
            };

            setMinutesData(prev => ({
                ...prev,
                ...safeData
            }));

            onNext();
        } catch (err) {
            setError(err.message || 'Failed to process file. Please try again or skip this step.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles?.length > 0) {
            processFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxFiles: 1
    });

    return (
        <div className="max-w-4xl mx-auto">
            {/* Meeting Minutes Template */}
            <div className="mb-8 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                    onClick={() => setIsTemplateOpen(!isTemplateOpen)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                >
                    <h3 className="font-bold text-slate-800">Minutes Template (Optional Customization)</h3>
                    {isTemplateOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isTemplateOpen && (
                    <div className="p-6 border-t border-slate-200">
                        <p className="text-sm text-slate-500 mb-3">
                            You can customize the markdown template below. The AI will inject the extracted details into the bracketed placeholders.
                        </p>
                        <textarea
                            value={minutesData?.template || DEFAULT_TEMPLATE}
                            onChange={(e) => {
                                setMinutesData(prev => ({ ...prev, template: e.target.value }));
                            }}
                            className="w-full p-4 border border-slate-300 rounded-lg h-96 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono whitespace-pre"
                        />
                    </div>
                )}
            </div>
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Upload Meeting Agenda</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Upload your meeting agenda image (JPG/PNG) and our AI will automatically extract the details for you.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div
                    {...getRootProps()}
                    className={`border-3 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
                        ${isProcessing ? 'pointer-events-none opacity-50' : ''}
                    `}
                >
                    <input {...getInputProps()} />

                    {isProcessing ? (
                        <div className="flex flex-col items-center">
                            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Agenda...</h3>
                            <p className="text-slate-600">
                                Extracting meeting details, roles, and segments...
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                <Upload size={32} className="text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {isDragActive ? 'Drop the agenda here' : 'Drag & drop your agenda here'}
                            </h3>
                            <p className="text-slate-500 mb-6">or click to browse files</p>
                            <div className="flex gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1"><FileText size={14} /> JPG, PNG</span>
                                <span>•</span>
                                <span>Max 10MB</span>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={onNext}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium px-6 py-3 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    Skip this step
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}
