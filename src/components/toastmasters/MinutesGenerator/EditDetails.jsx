import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Section = ({ title, isOpen, onToggle, children }) => (
    <div className="border border-slate-200 rounded-xl mb-4 overflow-hidden bg-white shadow-sm">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        >
            <h3 className="font-bold text-slate-800">{title}</h3>
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-6 border-t border-slate-200">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export default function EditDetails({ data, setData, onNext, onBack }) {
    const [openSections, setOpenSections] = useState({
        info: true,
        attendees: false,
        officers: false,
        roles: false,
        speeches: false,
        evaluators: false,
        tableTopics: false,
        general: false,
        awards: false,
        notes: false
    });

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleNextWithTracking = () => {
        trackEvent('generate_minutes_clicked');
        onNext();
    };

    const handleChange = (section, field, value) => {
        setData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Helper for array updates
    const handleArrayChange = (section, index, field, value) => {
        const newArray = [...data[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        setData(prev => ({ ...prev, [section]: newArray }));
    };

    const addItem = (section, template) => {
        setData(prev => ({ ...prev, [section]: [...prev[section], template] }));
    };

    const removeItem = (section, index) => {
        setData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Edit Meeting Details</h2>
                    <p className="text-slate-600">Review and edit the extracted information.</p>
                </div>
            </div>

            {/* 1. Meeting Information */}
            <Section title="1. Meeting Information" isOpen={openSections.info} onToggle={() => toggleSection('info')}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Club Name</label>
                        <input
                            type="text"
                            value={data.meetingInfo.clubName || ''}
                            onChange={(e) => handleChange('meetingInfo', 'clubName', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., Walkie Talkie Toastmasters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Date</label>
                        <input
                            type="date"
                            value={data.meetingInfo.date}
                            onChange={(e) => handleChange('meetingInfo', 'date', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Number</label>
                        <input
                            type="text"
                            value={data.meetingInfo.number}
                            onChange={(e) => handleChange('meetingInfo', 'number', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Location</label>
                        <input
                            type="text"
                            value={data.meetingInfo.location}
                            onChange={(e) => handleChange('meetingInfo', 'location', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., Zoom, Conference Room A, etc."
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Theme</label>
                        <input
                            type="text"
                            value={data.meetingInfo.theme}
                            onChange={(e) => handleChange('meetingInfo', 'theme', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Word of the Day</label>
                        <input
                            type="text"
                            value={data.meetingInfo.wordOfTheDay}
                            onChange={(e) => handleChange('meetingInfo', 'wordOfTheDay', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </Section>

            {/* 2. Attendees */}
            <Section title="2. Meeting Attendees" isOpen={openSections.attendees} onToggle={() => toggleSection('attendees')}>
                <p className="text-sm text-slate-500 mb-2">Enter names separated by commas or new lines.</p>
                <textarea
                    value={Array.isArray(data.attendees) ? data.attendees.join('\n') : data.attendees}
                    onChange={(e) => setData(prev => ({ ...prev, attendees: e.target.value.split('\n') }))}
                    className="w-full p-3 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="TM Name 1&#10;TM Name 2&#10;Guest Name"
                />
            </Section>

            {/* 3. Club Officers */}
            <Section title="3. Club Officers" isOpen={openSections.officers} onToggle={() => toggleSection('officers')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries({
                        president: 'President',
                        vpe: 'VP Education',
                        vpm: 'VP Membership',
                        vppr: 'VP Public Relations',
                        secretary: 'Secretary',
                        treasurer: 'Treasurer',
                        saa: 'Sergeant at Arms',
                        ipp: 'Immediate Past President'
                    }).map(([key, label]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                            <input
                                type="text"
                                value={data.officers[key] || ''}
                                onChange={(e) => handleChange('officers', key, e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    ))}
                </div>
            </Section>

            {/* 4. Key Roles */}
            <Section title="4. Key Meeting Roles" isOpen={openSections.roles} onToggle={() => toggleSection('roles')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries({
                        presidingOfficer: 'Presiding Officer',
                        tmod: 'Toastmaster of the Day',
                        generalEvaluator: 'General Evaluator',
                        tableTopicsMaster: 'Table Topics Master',
                        timer: 'Timer',
                        ahCounter: 'Ah Counter',
                        grammarian: 'Grammarian',
                        saa: 'Sergeant at Arms'
                    }).map(([key, label]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                            <input
                                type="text"
                                value={data.roles[key] || ''}
                                onChange={(e) => handleChange('roles', key, e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    ))}
                </div>
            </Section>

            {/* 5. Speeches */}
            <Section title="5. Speeches" isOpen={openSections.speeches} onToggle={() => toggleSection('speeches')}>
                {data.speeches.map((speech, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200 relative">
                        <button
                            onClick={() => removeItem('speeches', index)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                        >
                            <Trash2 size={18} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Speaker Name</label>
                                <input
                                    type="text"
                                    value={speech.speaker}
                                    onChange={(e) => handleArrayChange('speeches', index, 'speaker', e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Project / Title</label>
                                <input
                                    type="text"
                                    value={speech.title}
                                    onChange={(e) => handleArrayChange('speeches', index, 'title', e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Duration</label>
                                <input
                                    type="text"
                                    value={speech.duration || ''}
                                    onChange={(e) => handleArrayChange('speeches', index, 'duration', e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm"
                                    placeholder="e.g., 5-7 mins"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Speech Notes</label>
                                <textarea
                                    value={speech.notes || ''}
                                    onChange={(e) => handleArrayChange('speeches', index, 'notes', e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm h-20"
                                    placeholder="Summary of the speech..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => addItem('speeches', { speaker: '', title: '', project: '', duration: '', notes: '' })}
                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Add Speech
                </button>
            </Section>

            {/* 6. Evaluators */}
            <Section title="6. Evaluators" isOpen={openSections.evaluators} onToggle={() => toggleSection('evaluators')}>
                {data.evaluators.map((evaluator, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200 relative">
                        <button
                            onClick={() => removeItem('evaluators', index)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                        >
                            <Trash2 size={18} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Evaluator Name</label>
                                <input
                                    type="text"
                                    value={evaluator.evaluator}
                                    onChange={(e) => handleArrayChange('evaluators', index, 'evaluator', e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Speaker Evaluated</label>
                                <select
                                    value={evaluator.speakerIndex || ''}
                                    onChange={(e) => handleArrayChange('evaluators', index, 'speakerIndex', e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm"
                                >
                                    <option value="">Select Speaker</option>
                                    {data.speeches.map((s, i) => (
                                        <option key={i} value={i}>{s.speaker || `Speaker ${i + 1}`}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-500 mb-1">Evaluator Notes</label>
                                <textarea
                                    value={evaluator.notes || ''}
                                    onChange={(e) => handleArrayChange('evaluators', index, 'notes', e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md text-sm h-20"
                                    placeholder="Key points from the evaluation..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => addItem('evaluators', { evaluator: '', speakerIndex: '', notes: '' })}
                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Add Evaluator
                </button>
            </Section>

            {/* 7. Table Topics */}
            <Section title="7. Table Topics" isOpen={openSections.tableTopics} onToggle={() => toggleSection('tableTopics')}>
                {data.tableTopics.map((tt, index) => (
                    <div key={index} className="flex gap-4 mb-2 items-start">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Speaker Name"
                                value={tt.speaker}
                                onChange={(e) => handleArrayChange('tableTopics', index, 'speaker', e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md text-sm"
                            />
                        </div>
                        <div className="flex-[2]">
                            <input
                                type="text"
                                placeholder="Topic"
                                value={tt.topic}
                                onChange={(e) => handleArrayChange('tableTopics', index, 'topic', e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md text-sm"
                            />
                        </div>
                        <button
                            onClick={() => removeItem('tableTopics', index)}
                            className="p-2 text-slate-400 hover:text-red-500"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => addItem('tableTopics', { speaker: '', topic: '' })}
                    className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Add Table Topic
                </button>
            </Section>

            {/* 8. General Evaluation */}
            <Section title="8. General Evaluation" isOpen={openSections.general} onToggle={() => toggleSection('general')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Commendations</label>
                        <textarea
                            value={data.generalEvaluation.commendations}
                            onChange={(e) => handleChange('generalEvaluation', 'commendations', e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Recommendations</label>
                        <textarea
                            value={data.generalEvaluation.recommendations}
                            onChange={(e) => handleChange('generalEvaluation', 'recommendations', e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </Section>

            {/* 9. Awards */}
            <Section title="9. Awards & Recognitions" isOpen={openSections.awards} onToggle={() => toggleSection('awards')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries({
                        bestSpeaker: 'Best Speaker',
                        bestTableTopics: 'Best Table Topics',
                        bestEvaluator: 'Best Evaluator',
                        bestRolePlayer: 'Best Role Player'
                    }).map(([key, label]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                            <input
                                type="text"
                                value={data.awards[key] || ''}
                                onChange={(e) => handleChange('awards', key, e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    ))}
                </div>
            </Section>

            {/* 10. Other Notes */}
            <Section title="10. Other Notes" isOpen={openSections.notes} onToggle={() => toggleSection('notes')}>
                <textarea
                    value={data.notes}
                    onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Any other announcements or notes..."
                />
            </Section>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-8 border-t border-slate-200 mt-8">
                <button onClick={onBack} className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl flex items-center gap-2 font-medium transition-colors">
                    <ArrowLeft size={20} /> Back
                </button>
                <button onClick={handleNextWithTracking} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                    Generate Minutes <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
}
