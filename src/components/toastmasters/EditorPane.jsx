import React, { useRef, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { Plus, FolderPlus } from 'lucide-react';

export default function EditorPane({
    clubInfo,
    setClubInfo,
    agendaItems,
    setAgendaItems,
    rolePlayers,
    setRolePlayers,
    executiveCommittee,
    setExecutiveCommittee
}) {
    const [availableSections, setAvailableSections] = useState([
        'Introduction',
        'Prepared Speech',
        'Table Topics Segment',
        'Evaluation',
        'Conclusion',
        'Club Elections'
    ]);
    const [newSectionName, setNewSectionName] = useState('');
    const [showNewSectionInput, setShowNewSectionInput] = useState(false);
    const [highlightedItemId, setHighlightedItemId] = useState(null);
    const [expandedItems, setExpandedItems] = useState(() => {
        // Initialize with only Introduction items expanded
        return agendaItems
            .filter(item => item.section === 'Introduction')
            .reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
    });
    const itemRefs = useRef({});

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event) {
        const { active, over } = event;

        if (active.id !== over.id) {
            setAgendaItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    const handleUpdateItem = (id, field, value) => {
        setAgendaItems(items =>
            items.map(item => item.id === id ? { ...item, [field]: value } : item)
        );
    };

    const handleRemoveItem = (id) => {
        setAgendaItems(items => items.filter(item => item.id !== id));
        // Also remove from expandedItems
        setExpandedItems(prev => {
            const newExpanded = { ...prev };
            delete newExpanded[id];
            return newExpanded;
        });
    };

    const handleAddItem = () => {
        const newItem = {
            id: `item-${Date.now()}`,
            section: availableSections[0] || 'Introduction',
            time: '',
            title: 'New Agenda Item',
            presenter: '',
            duration: 5,
            details: ''
        };
        setAgendaItems([...agendaItems, newItem]);

        // Auto-expand new item
        setExpandedItems(prev => ({ ...prev, [newItem.id]: true }));

        // Highlight and scroll to new item
        setHighlightedItemId(newItem.id);
        setTimeout(() => {
            if (itemRefs.current[newItem.id]) {
                itemRefs.current[newItem.id].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
        setTimeout(() => setHighlightedItemId(null), 2000);
    };

    const handleAddSection = () => {
        if (newSectionName.trim() && !availableSections.includes(newSectionName.trim())) {
            setAvailableSections([...availableSections, newSectionName.trim()]);
            setNewSectionName('');
            setShowNewSectionInput(false);
        }
    };

    const toggleItemExpanded = (id) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6 bg-slate-50/50">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Club Info Section */}
                <section className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                        Club Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-slate-500">Club Name</label>
                            <input
                                type="text"
                                value={clubInfo.clubName}
                                onChange={(e) => setClubInfo({ ...clubInfo, clubName: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                placeholder="Toastmasters Club Name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">District</label>
                            <input
                                type="text"
                                value={clubInfo.district}
                                onChange={(e) => setClubInfo({ ...clubInfo, district: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                placeholder="120"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Division</label>
                            <input
                                type="text"
                                value={clubInfo.division}
                                onChange={(e) => setClubInfo({ ...clubInfo, division: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                placeholder="E"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Area</label>
                            <input
                                type="text"
                                value={clubInfo.area}
                                onChange={(e) => setClubInfo({ ...clubInfo, area: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                placeholder="1"
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-slate-500">Club Mission</label>
                            <textarea
                                value={clubInfo.mission}
                                onChange={(e) => setClubInfo({ ...clubInfo, mission: e.target.value })}
                                rows="2"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focusring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                                placeholder="Club mission statement"
                            />
                        </div>
                    </div>
                </section>

                {/* Meeting Details Section */}
                <section className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                        Meeting Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Meeting Number</label>
                            <input
                                type="text"
                                value={clubInfo.meetingNumber}
                                onChange={(e) => setClubInfo({ ...clubInfo, meetingNumber: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                placeholder="311"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Date</label>
                            <input
                                type="date"
                                value={clubInfo.date}
                                onChange={(e) => setClubInfo({ ...clubInfo, date: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Time</label>
                            <input
                                type="time"
                                value={clubInfo.time}
                                onChange={(e) => setClubInfo({ ...clubInfo, time: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-slate-500">Meeting Details</label>
                            <textarea
                                value={clubInfo.meetingDetails || ''}
                                onChange={(e) => setClubInfo({ ...clubInfo, meetingDetails: e.target.value })}
                                rows="2"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none"
                                placeholder="e.g., Zoom ID: 890 9788 8695, Passcode: wtnmeet or Venue: Conference Room A"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Theme of the Day</label>
                            <input
                                type="text"
                                value={clubInfo.theme}
                                onChange={(e) => setClubInfo({ ...clubInfo, theme: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                placeholder="Superpowers"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Word of the Day</label>
                            <input
                                type="text"
                                value={clubInfo.wordOfTheDay}
                                onChange={(e) => setClubInfo({ ...clubInfo, wordOfTheDay: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                                placeholder="Prowess"
                            />
                        </div>
                    </div>
                </section>

                {/* Draggable Agenda Items */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                            Agenda Items
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowNewSectionInput(!showNewSectionInput)}
                                className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <FolderPlus size={16} />
                                New Section
                            </button>
                            <button
                                onClick={handleAddItem}
                                className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus size={16} />
                                Add Item
                            </button>
                        </div>
                    </div>

                    {showNewSectionInput && (
                        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                                    className="flex-1 px-3 py-2 bg-white border border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                    placeholder="Enter new section name..."
                                    autoFocus
                                />
                                <button
                                    onClick={handleAddSection}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowNewSectionInput(false);
                                        setNewSectionName('');
                                    }}
                                    className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={agendaItems}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {agendaItems.map((item) => (
                                    <div
                                        key={item.id}
                                        ref={(el) => (itemRefs.current[item.id] = el)}
                                        className={highlightedItemId === item.id ? 'animate-pulse' : ''}
                                    >
                                        <SortableItem
                                            id={item.id}
                                            item={item}
                                            availableSections={availableSections}
                                            onUpdate={handleUpdateItem}
                                            onRemove={handleRemoveItem}
                                            highlighted={highlightedItemId === item.id}
                                            isExpanded={expandedItems[item.id] || false}
                                            onToggleExpand={() => toggleItemExpanded(item.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </section>

                {/* Role Players Section */}
                <section className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                        Role Players
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Toastmaster of the Day (TMoD)</label>
                            <input
                                type="text"
                                value={rolePlayers.tmod}
                                onChange={(e) => setRolePlayers({ ...rolePlayers, tmod: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">General Evaluator</label>
                            <input
                                type="text"
                                value={rolePlayers.generalEvaluator}
                                onChange={(e) => setRolePlayers({ ...rolePlayers, generalEvaluator: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Table Topics Master</label>
                            <input
                                type="text"
                                value={rolePlayers.tableTopicsMaster}
                                onChange={(e) => setRolePlayers({ ...rolePlayers, tableTopicsMaster: e.target.value })}
                                className="w-full px-3py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Timer</label>
                            <input
                                type="text"
                                value={rolePlayers.timer}
                                onChange={(e) => setRolePlayers({ ...rolePlayers, timer: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Ah-Counter</label>
                            <input
                                type="text"
                                value={rolePlayers.ahCounter}
                                onChange={(e) => setRolePlayers({ ...rolePlayers, ahCounter: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Grammarian</label>
                            <input
                                type="text"
                                value={rolePlayers.grammarian}
                                onChange={(e) => setRolePlayers({ ...rolePlayers, grammarian: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Executive Committee Section */}
                <section className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                        Executive Committee
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Immediate Past President</label>
                            <input
                                type="text"
                                value={executiveCommittee.immediatePastPresident}
                                onChange={(e) => setExecutiveCommittee({ ...executiveCommittee, immediatePastPresident: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">President</label>
                            <input
                                type="text"
                                value={executiveCommittee.president}
                                onChange={(e) => setExecutiveCommittee({ ...executiveCommittee, president: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">VP - Education</label>
                            <input
                                type="text"
                                value={executiveCommittee.vpEducation}
                                onChange={(e) => setExecutiveCommittee({ ...executiveCommittee, vpEducation: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">VP - Membership</label>
                            <input
                                type="text"
                                value={executiveCommittee.vpMembership}
                                onChange={(e) => setExecutiveCommittee({ ...executiveCommittee, vpMembership: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">VP - Public Relations</label>
                            <input
                                type="text"
                                value={executiveCommittee.vpPublicRelations}
                                onChange={(e) => setExecutiveCommittee({ ...executiveCommittee, vpPublicRelations: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Secretary</label>
                            <input
                                type="text"
                                value={executiveCommittee.secretary}
                                onChange={(e) => setExecutiveCommittee({ ...executiveCommittee, secretary: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Treasurer</label>
                            <input
                                type="text"
                                value={executiveCommittee.treasurer}
                                onChange={(e) => setExecutiveCommittee({ ...executiveCommittee, treasurer: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Sergeant at Arms</label>
                            <input
                                type="text"
                                value={executiveCommittee.sergeantAtArms}
                                onChange={(e) => setExecutiveCommittee({ ...executiveCommittee, sergeantAtArms: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
