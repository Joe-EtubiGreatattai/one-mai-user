import React, { useState } from 'react';
import axios from "../Api/axios";
import toast from "react-hot-toast";

const Support = () => {
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
        
            // Simulate API call
            const response = await axios.post("/api/support", form);
            const responseData = response.data?.data || response.data;
            
            setSubmitted(true);
            setIsSubmitting(false);
        } catch (error) {
            
            toast.error(error.message);
        }
        
    };

    const resetForm = () => {
        setSubmitted(false);
        setForm({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                        <svg className="w-8 h-8" style={{ color: '#3390d5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Need Help?</h1>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                        We're here to support you. Send us a message and our team will get back to you within 24 hours.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {submitted ? (
                        /* Success State */
                        <div className="p-8 sm:p-12 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully! 🎉</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Thank you for reaching out to us. Our support team has received your message and will respond within 24 hours. We appreciate your patience!
                            </p>
                            <button
                                onClick={resetForm}
                                className="inline-flex items-center px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                                style={{ backgroundColor: '#3390d5' }}
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        /* Form State */
                        <>
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6" style={{ background: `linear-gradient(135deg, #3390d5, #2980c9)` }}>
                                <h2 className="text-xl font-semibold text-white">Contact Support</h2>
                                <p className="text-blue-100 mt-1">Fill out the form below and we'll help you out</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-6">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-900 placeholder-gray-500"
                                        style={{ 
                                            '--tw-ring-color': '#3390d5', 
                                            '--focus-border-color': '#3390d5' 
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3390d5'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="your.email@example.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-900 placeholder-gray-500"
                                        style={{ 
                                            '--tw-ring-color': '#3390d5', 
                                            '--focus-border-color': '#3390d5' 
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3390d5'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                </div>

                                {/* Message Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        placeholder="Describe your issue or question in detail..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-900 placeholder-gray-500 resize-vertical"
                                        style={{ 
                                            '--tw-ring-color': '#3390d5', 
                                            '--focus-border-color': '#3390d5' 
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#3390d5'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Please provide as much detail as possible to help us assist you better.
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-white font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#3390d5' }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Additional Help Section */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white rounded-lg p-6 shadow-md text-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" style={{ color: '#3390d5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                        <p className="text-sm text-gray-600">support@onemai.com</p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-md text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
                        <p className="text-sm text-gray-600">Within 24 hours</p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-md text-center sm:col-span-2 lg:col-span-1">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">24/7 Available</h3>
                        <p className="text-sm text-gray-600">Always here to help</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;