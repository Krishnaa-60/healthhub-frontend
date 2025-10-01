import React, { useState } from 'react';
import MailIcon from '../components/icons/MailIcon';
import LocationMarkerIcon from '../components/icons/LocationMarkerIcon';
import PaperAirplaneIcon from '../components/icons/PaperAirplaneIcon';
import { sendContactMessage } from '../services/db';
import SpinnerIcon from '../components/icons/SpinnerIcon';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      await sendContactMessage(formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "mt-1 block w-full px-5 py-3 bg-white/80 dark:bg-dark-bg/80 border-0 rounded-full shadow-inner placeholder-gray-500 dark:placeholder-dark-subtext/60 focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent sm:text-sm text-gray-900 dark:text-dark-text";

  return (
    <div className="w-full flex-grow flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-cyan-200 via-pink-200 to-orange-200 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-900 dark:to-slate-800 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/20 dark:bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-white/20 dark:bg-white/5 rounded-full animate-pulse delay-75"></div>
        <span className="absolute top-1/4 left-1/4 text-8xl text-white/10 font-black select-none">+</span>
        <span className="absolute bottom-1/4 right-1/4 text-8xl text-white/10 font-black select-none">+</span>

        <main className="w-full max-w-5xl bg-white/30 dark:bg-dark-card/30 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/40 dark:border-dark-subtext/20 z-10 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Left side: Contact Info */}
        <div className="bg-white/40 dark:bg-dark-card/40 rounded-2xl p-8 flex flex-col justify-center h-full text-gray-800 dark:text-dark-text space-y-8 shadow-lg">
            <h2 className="text-4xl font-bold text-center text-gray-800 dark:text-dark-text">Reach us</h2>
            <div className="space-y-4">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text">Email :</h3>
                <p className="mt-1 text-gray-700 dark:text-dark-subtext">gohealthhub.360@gmail.com</p>
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text">Address :</h3>
                <p className="mt-1 text-gray-700 dark:text-dark-subtext">
                fourth floor, einstein bhavan, near pencil canteen, Aditya polytechnic college,Surampalem.
                </p>
            </div>
            </div>
            <div className="flex justify-center gap-8 pt-4">
                <div className="w-16 h-16 rounded-full bg-red-400 text-white flex items-center justify-center shadow-md">
                    <MailIcon className="w-8 h-8"/>
                </div>
                <div className="w-16 h-16 rounded-full bg-blue-400 text-white flex items-center justify-center shadow-md">
                    <LocationMarkerIcon className="w-8 h-8"/>
                </div>
            </div>
        </div>

        {/* Right side: Contact Form */}
        <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-lg font-bold text-gray-800 dark:text-dark-text">Name</label>
                <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className={inputStyle}
                placeholder="name"
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-lg font-bold text-gray-800 dark:text-dark-text">Email</label>
                <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputStyle}
                placeholder="email"
                />
            </div>
            <div>
                <label htmlFor="message" className="block text-lg font-bold text-gray-800 dark:text-dark-text">Message</label>
                <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
                className={`${inputStyle} rounded-2xl resize-none`}
                placeholder=""
                />
            </div>
            <div className="text-center pt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <><SpinnerIcon className="w-5 h-5"/> Sending...</> : <>Submit <PaperAirplaneIcon className="w-5 h-5"/></>}
                </button>
            </div>
             {submitStatus === 'success' && (
                <p className="text-center text-green-800 dark:text-green-300 font-semibold mt-4 bg-green-100 dark:bg-green-500/20 p-2 rounded-md">Thank you! Your message has been received.</p>
            )}
            {submitStatus === 'error' && (
                <p className="text-center text-red-800 dark:text-red-300 font-semibold mt-4 bg-red-100 dark:bg-red-500/20 p-2 rounded-md">Something went wrong. Please try again later.</p>
            )}
            </form>
        </div>
        </main>
    </div>
  );
};

export default ContactPage;