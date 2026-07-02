import React, { useState, forwardRef } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Settings, X } from 'lucide-react';
const toastmastersLogo = '/ToastmastersLogo3Color.jpg';

const AgendaContent = forwardRef(({ clubInfo, agendaItems, rolePlayers, executiveCommittee, appearance, groupedItems, sectionColors, formatDate, formatTime }, ref) => (
    <div
        ref={ref}
        id="agenda-content"
        className="w-full max-w-[210mm] p-6 relative overflow-hidden mx-auto"
        style={{
            fontFamily: 'Arial, sans-serif',
            color: appearance.textColor,
            backgroundColor: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
    >
        <style>{`
            #agenda-content * {
                border-color: #e5e7eb !important;
                outline-color: #e5e7eb !important;
                text-decoration-color: #000000 !important;
                column-rule-color: #e5e7eb !important;
                -webkit-text-fill-color: initial !important;
            }
        `}</style>

        {/* Header with Toastmasters Logo and Club Name */}
        <header className="text-center mb-4 relative z-10">
            <div className="flex items-center justify-center gap-3 mb-2">
                {/* Toastmasters Logo */}
                <div className="w-20 h-20 flex-shrink-0">
                    <img
                        src={toastmastersLogo}
                        alt="Toastmasters International"
                        className="w-full h-full object-contain"
                    />
                </div>
                <div className="text-center flex-1">
                    <h1 className="text-2xl font-bold uppercase tracking-tight" style={{ color: appearance.headerColor }}>
                        {clubInfo.clubName || 'Toastmasters Club'}
                    </h1>
                    <p className="text-sm font-bold" style={{ color: appearance.headerColor }}>
                        DISTRICT: {clubInfo.district || '120'} | DIVISION: {clubInfo.division || 'E'} | AREA: {clubInfo.area || '1'}
                    </p>
                </div>
            </div>

            {/* Mission Statement */}
            {clubInfo.mission && (
                <div className="mt-3 mb-3">
                    <h3 className="text-xs font-bold mb-1" style={{ color: appearance.accentColor }}>Club's Mission</h3>
                    <p className="text-xs leading-relaxed" style={{ color: appearance.textColor }}>
                        {clubInfo.mission}
                    </p>
                </div>
            )}

            {/* Meeting Number Badge */}
            <div className="mt-3 inline-block px-8 py-2 rounded-full" style={{ backgroundColor: appearance.headerColor, color: '#ffffff' }}>
                <span className="text-base font-bold">Meeting - {clubInfo.meetingNumber || '000'}</span>
            </div>
        </header>

        {/* Date and Meeting Details */}
        <div className="mb-3 text-center">
            <p className="text-sm font-bold mb-2" style={{ color: appearance.textColor }}>
                {formatDate(clubInfo.date)}, {formatTime(clubInfo.time)} onwards
            </p>
            <div className="inline-block rounded-lg p-3 border-2" style={{ backgroundColor: '#FFF4CC', borderColor: '#D4A017' }}>
                <p className="text-sm font-bold" style={{ color: appearance.accentColor }}>Meeting details:</p>
                <p className="text-sm whitespace-pre-line" style={{ color: appearance.textColor }}>{clubInfo.meetingDetails || 'N/A'}</p>
            </div>
        </div>

        {/* Theme and Word of the Day */}
        <div className="mb-3 text-center text-sm" style={{ color: appearance.textColor }}>
            <p>
                Theme of the day: <span className="font-bold" style={{ color: appearance.accentColor }}>{clubInfo.theme || 'N/A'}</span>
            </p>
            <p>
                Word of the day: {clubInfo.wordOfTheDay || 'N/A'}
            </p>
        </div>

        {/* Agenda Sections */}
        <div className="border mb-4" style={{ borderColor: '#d1d5db' }}>
            {Object.entries(groupedItems).map(([section, items]) => (
                <div key={section}>
                    {/* Section Header */}
                    <div
                        className="text-center py-1.5 text-xs font-bold uppercase"
                        style={{ backgroundColor: appearance.accentColor, color: '#ffffff' }}
                    >
                        {section}
                    </div>

                    {/* Section Items as Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    {/* Column 1: Time */}
                                    <td
                                        className="font-bold py-2 px-2 text-xs"
                                        style={{
                                            color: appearance.textColor,
                                            borderRight: '1px solid #d1d5db',
                                            width: '15%',
                                            verticalAlign: 'top'
                                        }}
                                    >
                                        {item.time || '--:--'}
                                    </td>

                                    {/* Column 2: Details */}
                                    <td
                                        className="py-2 px-2 text-xs"
                                        style={{
                                            width: '60%',
                                            verticalAlign: 'top',
                                            borderRight: '1px solid #d1d5db'
                                        }}
                                    >
                                        <div className="font-normal leading-tight" style={{ color: appearance.textColor }}>
                                            {item.title}
                                        </div>
                                        {item.details && (
                                            <div className="text-xs mt-0.5" style={{ color: appearance.textColor, opacity: 0.8 }}>
                                                {item.details}
                                            </div>
                                        )}
                                    </td>

                                    {/* Column 3: Role Player */}
                                    <td
                                        className="py-2 px-2 text-xs text-right"
                                        style={{
                                            color: appearance.textColor,
                                            width: '25%',
                                            verticalAlign: 'top'
                                        }}
                                    >
                                        {item.presenter && (
                                            <span className="font-bold">
                                                {item.presenter}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>

        {/* Role Players Section */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mb-3 text-xs">
            <div>
                <h3 className="font-bold mb-1 uppercase text-xs" style={{ color: appearance.headerColor }}>Role Players</h3>
                <p className="leading-relaxed"><span className="font-bold">Toastmaster of the day (TMoD):</span> {rolePlayers.tmod}</p>
                <p className="leading-relaxed"><span className="font-bold">General Evaluator:</span> {rolePlayers.generalEvaluator}</p>
                <p className="leading-relaxed"><span className="font-bold">Table topics master:</span> {rolePlayers.tableTopicsMaster}</p>
            </div>
            <div>
                <h3 className="font-bold mb-1 uppercase text-xs" style={{ color: appearance.headerColor }}>TAG Role Players</h3>
                <p className="leading-relaxed"><span className="font-bold">Timer:</span> {rolePlayers.timer}</p>
                <p className="leading-relaxed"><span className="font-bold">Ah-Counter:</span> {rolePlayers.ahCounter}</p>
                <p className="leading-relaxed"><span className="font-bold">Grammarian:</span> {rolePlayers.grammarian}</p>
            </div>
        </div>

        {/* Executive Committee */}
        <div className="border-t-2 pt-2" style={{ borderColor: appearance.headerColor }}>
            <h3 className="font-bold mb-1 uppercase text-xs text-center" style={{ color: appearance.headerColor }}>Executive Committee</h3>
            <div className="text-[10px] text-center leading-relaxed" style={{ color: appearance.textColor }}>
                <span className="font-bold">Immediate Past President:</span> {executiveCommittee.immediatePastPresident} |
                <span className="font-bold"> President:</span> {executiveCommittee.president} |
                <span className="font-bold"> VP – Education:</span> {executiveCommittee.vpEducation} |
                <span className="font-bold"> VP – Membership:</span> {executiveCommittee.vpMembership} |
                <span className="font-bold"> VP – Public Relations:</span> {executiveCommittee.vpPublicRelations} |
                <span className="font-bold"> Secretary:</span> {executiveCommittee.secretary} |
                <span className="font-bold"> Treasurer:</span> {executiveCommittee.treasurer} |
                <span className="font-bold"> Sergeant at Arms:</span> {executiveCommittee.sergeantAtArms}
            </div>
        </div>

    </div>
));

export default function PreviewPane({ clubInfo, agendaItems, rolePlayers, executiveCommittee, contentRef }) {
    const [zoom, setZoom] = useState(100);
    const [isFullView, setIsFullView] = useState(false);
    const [showAppearance, setShowAppearance] = useState(false);

    // Brand Colors
    const brandColors = {
        loyalBlue: '#004165',
        trueMaroon: '#772432',
        coolGray: '#A9B2B1',
        happyYellow: '#F2DF74',
        black: '#000000',
        darkGray: '#333333'
    };

    const [appearance, setAppearance] = useState({
        headerColor: brandColors.loyalBlue,
        textColor: brandColors.darkGray,
        accentColor: brandColors.trueMaroon
    });

    // Group items by section
    const groupedItems = agendaItems.reduce((acc, item) => {
        if (!acc[item.section]) {
            acc[item.section] = [];
        }
        acc[item.section].push(item);
        return acc;
    }, {});

    // Exact colors from Toastmasters template
    const sectionColors = {
        'Introduction': 'bg-[#6B2C3E]',
        'Prepared Speech': 'bg-[#6B2C3E]',
        'Table Topics Segment': 'bg-[#6B2C3E]',
        'Evaluation': 'bg-[#6B2C3E]',
        'Conclusion': 'bg-[#6B2C3E]',
        'Club Elections': 'bg-[#6B2C3E]'
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'YYYY-MM-DD';
        const date = new Date(dateStr);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${days[date.getDay()]} - ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '00:00';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const toggleFullView = () => setIsFullView(!isFullView);

    const ColorPicker = ({ label, value, onChange, options }) => (
        <div className="mb-3">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">{label}</label>
            <div className="flex gap-2">
                {options.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => onChange(color.value)}
                        className={`w-6 h-6 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 ${value === color.value ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                    />
                ))}
            </div>
        </div>
    );

    const contentProps = {
        clubInfo,
        agendaItems,
        rolePlayers,
        executiveCommittee,
        appearance,
        groupedItems,
        sectionColors,
        formatDate,
        formatTime
    };

    return (
        <div className="h-full bg-slate-100/50 relative flex flex-col">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2 border border-slate-200">
                <button
                    onClick={() => setShowAppearance(!showAppearance)}
                    className={`p-2 hover:bg-slate-100 rounded transition-colors ${showAppearance ? 'bg-slate-100 text-blue-600' : 'text-slate-600'}`}
                    title="Appearance Settings"
                >
                    <Settings size={18} />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut size={18} className="text-slate-600" />
                </button>
                <span className="text-sm font-medium text-slate-700 min-w-[50px] text-center">
                    {zoom}%
                </span>
                <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn size={18} className="text-slate-600" />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button
                    onClick={toggleFullView}
                    className="p-2 hover:bg-slate-100 rounded transition-colors"
                    title="Full View"
                >
                    <Maximize2 size={18} className="text-slate-600" />
                </button>
            </div>

            {/* Appearance Settings Popover */}
            {showAppearance && (
                <div className="absolute top-16 right-4 z-30 bg-white rounded-lg shadow-xl border border-slate-200 p-4 w-64 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-slate-800 text-sm">Appearance</h3>
                        <button onClick={() => setShowAppearance(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={16} />
                        </button>
                    </div>

                    <ColorPicker
                        label="Header Color"
                        value={appearance.headerColor}
                        onChange={(val) => setAppearance(prev => ({ ...prev, headerColor: val }))}
                        options={[
                            { name: 'Loyal Blue', value: brandColors.loyalBlue },
                            { name: 'True Maroon', value: brandColors.trueMaroon },
                            { name: 'Black', value: brandColors.black }
                        ]}
                    />

                    <ColorPicker
                        label="Text Color"
                        value={appearance.textColor}
                        onChange={(val) => setAppearance(prev => ({ ...prev, textColor: val }))}
                        options={[
                            { name: 'Dark Gray', value: brandColors.darkGray },
                            { name: 'Black', value: brandColors.black },
                            { name: 'Loyal Blue', value: brandColors.loyalBlue }
                        ]}
                    />

                    <ColorPicker
                        label="Accent Color"
                        value={appearance.accentColor}
                        onChange={(val) => setAppearance(prev => ({ ...prev, accentColor: val }))}
                        options={[
                            { name: 'True Maroon', value: brandColors.trueMaroon },
                            { name: 'Loyal Blue', value: brandColors.loyalBlue },
                            { name: 'Happy Yellow', value: brandColors.happyYellow }
                        ]}
                    />
                </div>
            )}

            {/* Preview Content */}
            <div className="flex-1 p-8 overflow-y-auto preview-scrollbar flex justify-center">
                <div style={{
                    transform: `scale(${zoom / 100})`,
                    marginBottom: `${(zoom - 100) * 2}px`,
                    transformOrigin: 'top'
                }}>
                    <AgendaContent ref={contentRef} {...contentProps} />
                </div>
            </div>

            {/* Full View Modal */}
            {isFullView && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8" onClick={toggleFullView}>
                    <div className="relative max-w-[95vw] max-h-[95vh] overflow-auto bg-white rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={toggleFullView}
                            className="sticky top-4 right-4 float-right bg-white rounded-full p-2 shadow-lg hover:bg-slate-100 transition-colors z-10"
                        >
                            <X size={24} className="text-slate-600" />
                        </button>
                        <div className="p-8">
                            <AgendaContent {...contentProps} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
