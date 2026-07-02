import React, { useState } from 'react';
import UploadAgenda from './UploadAgenda';
import EditDetails from './EditDetails';
import PreviewMinutes from './PreviewMinutes';
import TopBar from '../TopBar';

export default function MinutesGenerator({ onBackToHome }) {
    const [step, setStep] = useState(1);
    const [minutesData, setMinutesData] = useState({
        meetingInfo: { clubName: '', date: '', number: '', theme: '', wordOfTheDay: '', location: '' },
        attendees: [],
        officers: {
            president: '',
            vpe: '',
            vpm: '',
            vppr: '',
            secretary: '',
            treasurer: '',
            saa: '',
            ipp: ''
        },
        roles: {},
        speeches: [],
        evaluators: [],
        tableTopics: [],
        generalEvaluation: { commendations: '', recommendations: '' },
        awards: {},
        notes: '',
        template: ''
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const steps = [
        { number: 1, title: 'Upload Agenda' },
        { number: 2, title: 'Edit Details' },
        { number: 3, title: 'Generate Minutes' }
    ];

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
            <TopBar
                onBackToHome={onBackToHome}
                title="Meeting Minutes Generator"
            />

            {/* Step Indicator */}
            <div className="bg-white border-b border-slate-200 py-4 px-6">
                <div className="max-w-3xl mx-auto flex items-center justify-between relative">
                    {/* Progress Bar Background */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>

                    {/* Progress Bar Fill */}
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-300"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((s) => (
                        <div key={s.number} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                                    ${step >= s.number ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}
                                `}
                            >
                                {s.number}
                            </div>
                            <span
                                className={`text-xs font-medium transition-colors
                                    ${step >= s.number ? 'text-blue-900' : 'text-slate-400'}
                                `}
                            >
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <main className="flex-1 overflow-auto p-6">
                {step === 1 && (
                    <UploadAgenda
                        onNext={handleNext}
                        setMinutesData={setMinutesData}
                        minutesData={minutesData}
                    />
                )}

                {step === 2 && (
                    <EditDetails
                        data={minutesData}
                        setData={setMinutesData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {step === 3 && (
                    <PreviewMinutes
                        data={minutesData}
                        onBack={handleBack}
                    />
                )}
            </main>
        </div>
    );
}
