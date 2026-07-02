import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown } from 'lucide-react';

export function SortableItem(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    const sectionColors = {
        'Introduction': 'bg-purple-100 border-purple-300',
        'Prepared Speech': 'bg-red-100 border-red-300',
        'Table Topics Segment': 'bg-orange-100 border-orange-300',
        'Evaluation': 'bg-green-100 border-green-300',
        'Conclusion': 'bg-blue-100 border-blue-300',
        'Club Elections': 'bg-yellow-100 border-yellow-300'
    };

    return (
        <div ref={setNodeRef} style={style} className="group relative mb-3">
            <div
                className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-start gap-3 ${isDragging
                    ? 'border-brand-500 ring-2 ring-brand-100'
                    : props.highlighted
                        ? 'border-green-400 ring-2 ring-green-200 bg-green-50'
                        : 'border-slate-200'
                    }`}
            >
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
                >
                    <GripVertical size={20} />
                </div>

                <div className="flex-1 space-y-3">
                    {/* Always visible: Collapse toggle + Section/Title summary */}
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={props.onToggleExpand}
                            className="flex items-center gap-2 flex-1 text-left hover:bg-slate-50 p-1 rounded transition-colors"
                        >
                            <ChevronDown
                                size={18}
                                className={`text-slate-400 transition-transform ${props.isExpanded ? '' : '-rotate-90'}`}
                            />
                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                                <span className={`text-xs px-2 py-1 rounded ${sectionColors[props.item.section] || 'bg-slate-100 text-slate-700'}`}>
                                    {props.item.section}
                                </span>
                                <span className="text-sm font-medium text-slate-700">{props.item.title}</span>
                                {props.item.presenter && (
                                    <span className="text-xs text-slate-500">• {props.item.presenter}</span>
                                )}
                            </div>
                        </button>
                    </div>

                    {/* Expanded view: Show full form */}
                    {props.isExpanded && (
                        <>
                            {/* Section & Time Row */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                <div className="md:col-span-6">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Section</label>
                                    <select
                                        value={props.item.section}
                                        onChange={(e) => props.onUpdate(props.id, 'section', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${sectionColors[props.item.section] || 'bg-slate-50 border-slate-200'}`}
                                    >
                                        {props.availableSections.map((section) => (
                                            <option key={section} value={section}>
                                                {section}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={props.item.time}
                                        onChange={(e) => props.onUpdate(props.id, 'time', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        value={props.item.duration}
                                        onChange={(e) => props.onUpdate(props.id, 'duration', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Title Row */}
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Activity / Speech Title</label>
                                    <input
                                        type="text"
                                        value={props.item.title}
                                        onChange={(e) => props.onUpdate(props.id, 'title', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        placeholder="e.g. Speaker 1 or Table Topics Master conducts..."
                                    />
                                </div>
                            </div>

                            {/* Presenter & Details Row */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                <div className="md:col-span-6">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Presenter / Speaker</label>
                                    <input
                                        type="text"
                                        value={props.item.presenter}
                                        onChange={(e) => props.onUpdate(props.id, 'presenter', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        placeholder="TM Name"
                                    />
                                </div>
                                <div className="md:col-span-6">
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Additional Details</label>
                                    <input
                                        type="text"
                                        value={props.item.details}
                                        onChange={(e) => props.onUpdate(props.id, 'details', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                        placeholder="Pathway, Project, Time limits"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={() => props.onRemove(props.id)}
                    className="mt-1 text-slate-400 hover:text-red-500 transition-colors md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Delete item"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
