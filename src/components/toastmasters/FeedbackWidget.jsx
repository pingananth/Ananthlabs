import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            alert('Please enter your feedback!');
            return;
        }

        setIsSubmitting(true);

        try {
            // Using FormSubmit.co to send emails without backend
            const formData = new FormData();
            formData.append('email', email || 'anonymous@user.com');
            formData.append('message', comment);
            formData.append('_subject', 'New Feedback from TI Tools');
            formData.append('_captcha', 'false');
            formData.append('_template', 'table');

            const response = await fetch('https://formsubmit.co/pingananth@gmail.com', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setSubmitSuccess(true);
                setComment('');
                setEmail('');
                setTimeout(() => {
                    setSubmitSuccess(false);
                    setIsOpen(false);
                }, 2000);
            } else {
                alert('Failed to send feedback. Please try again.');
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
            alert('Failed to send feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Button - Hidden on mobile to avoid overlaying tab bar */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hidden md:flex items-center justify-center text-white transition-all transform hover:scale-110 z-50 ${isOpen ? 'bg-red-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                style={{ backgroundColor: isOpen ? '#dc2626' : '#004165' }}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Feedback Form */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in slide-in-from-bottom-4 fade-in">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Send Feedback</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {submitSuccess ? (
                            <div className="py-8 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-green-600 font-medium">Thank you for your feedback!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email <span className="text-slate-400">(optional)</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Your Feedback <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Tell us what you think..."
                                        rows="4"
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: isSubmitting ? '#94a3b8' : '#004165' }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Feedback
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-slate-500 text-center">
                                    We read every piece of feedback and appreciate your input!
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
