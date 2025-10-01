import React, { useState } from 'react';
import { generateDietPlan } from '../services/db';
import RobotIcon from './icons/RobotIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import OatmealIcon from './icons/OatmealIcon';
import SaladIcon from './icons/SaladIcon';
import SalmonIcon from './icons/SalmonIcon';
import YogurtIcon from './icons/YogurtIcon';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import LightbulbIcon from './icons/LightbulbIcon';

interface Meal {
  mealName: string;
  description: string;
}

interface DietPlan {
  morning: Meal;
  afternoon: Meal;
  evening: Meal;
  night: Meal;
}

const MealIconMap: { [key: string]: React.FC<{ className?: string }> } = {
  morning: OatmealIcon,
  afternoon: SaladIcon,
  evening: SalmonIcon,
  night: YogurtIcon,
};


const AiDietPlanner: React.FC = () => {
  const [healthCondition, setHealthCondition] = useState('');
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearched, setLastSearched] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const quickSuggestions = [
    { label: '🩺 Diabetes', value: 'diabetes' },
    { label: '❤️ Heart Disease', value: 'heart disease' },
    { label: '⚖️ Weight Loss', value: 'obesity' },
    { label: '🩸 High Blood Pressure', value: 'hypertension' },
    { label: '🦴 Osteoporosis', value: 'osteoporosis' },
    { label: '🧠 ADHD', value: 'adhd' },
    { label: '😰 Anxiety', value: 'anxiety' },
    { label: '💪 Muscle Building', value: 'muscle building' },
  ];

  const handleGetDietPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthCondition.trim()) {
      setError("Please enter a health condition or dietary goal.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDietPlan(null);
    setLastSearched(healthCondition);
    setShowSuggestions(false);

    try {
      const planObject = await generateDietPlan(healthCondition);
      setDietPlan(planObject);

    } catch (err) {
      console.error("Error fetching diet plan:", err);
      setError(err instanceof Error ? err.message : "Sorry, I couldn't generate a diet plan at the moment. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (value: string) => {
    setHealthCondition(value);
    setShowSuggestions(false);
  };

  const handleNewSearch = () => {
    setDietPlan(null);
    setHealthCondition('');
    setError(null);
    setShowSuggestions(true);
  };
  
  const MealCard: React.FC<{title: string, meal: Meal, iconKey: keyof typeof MealIconMap, delay: string}> = ({ title, meal, iconKey, delay }) => {
    const Icon = MealIconMap[iconKey];
    const [isHovered, setIsHovered] = useState(false);
    const gradients = {
        morning: 'from-amber-400 to-yellow-500',
        afternoon: 'from-lime-400 to-green-500',
        evening: 'from-sky-400 to-blue-500',
        night: 'from-indigo-400 to-purple-500'
    }
    return (
        <div 
            className={`flex items-start gap-4 p-5 bg-white/50 dark:bg-dark-card/50 rounded-xl border border-white dark:border-dark-subtext/20 backdrop-blur-sm shadow-lg animate-fade-in-up transition-all duration-300 cursor-pointer ${isHovered ? 'scale-105 shadow-2xl' : ''}`} 
            style={{ animationDelay: delay }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradients[iconKey]} text-white flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
                <Icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-500 dark:text-dark-subtext tracking-widest uppercase">{title}</h3>
                <p className="text-lg font-bold text-gray-800 dark:text-dark-text mt-1">{meal.mealName}</p>
                <p className="text-sm text-gray-600 dark:text-dark-subtext mt-1">{meal.description}</p>
            </div>
        </div>
    );
  };


  return (
    <div className="bg-gradient-to-br from-green-50 via-teal-50 to-blue-100 dark:from-slate-900 dark:via-gray-800 dark:to-dark-bg p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-dark-subtext/20 w-full mx-auto font-sans relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-100/[0.05] dark:bg-grid-slate-700/[0.1] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        <header className="text-center mb-8 relative z-10">
            <div className="inline-block p-4 bg-gradient-to-br from-primary-green to-teal-400 rounded-full shadow-lg mb-4">
                <RobotIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-800 dark:text-dark-text tracking-tight">Your Personal AI Diet Planner</h1>
            <p className="text-gray-600 dark:text-dark-subtext mt-2 max-w-lg mx-auto">Tell me your health goals or conditions, and I'll whip up a delicious, healthy plan for you!</p>
        </header>

        <div className="max-w-2xl mx-auto relative z-10">
            <form onSubmit={handleGetDietPlan} className="bg-white dark:bg-dark-card p-2 rounded-full shadow-lg border border-gray-200/80 dark:border-dark-subtext/20 transition-all hover:shadow-xl">
                <label htmlFor="health-condition-input" className="sr-only">Enter your health condition or goal</label>
                <div className="flex items-center gap-2">
                    <input
                        id="health-condition-input"
                        type="text"
                        value={healthCondition}
                        onChange={(e) => setHealthCondition(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="E.g., Diabetes, Heart Disease, Weight Loss..."
                        className="flex-grow bg-transparent border-0 rounded-full px-5 py-3 text-sm placeholder-gray-500 dark:placeholder-dark-subtext/60 focus:outline-none focus:ring-0 text-gray-800 dark:text-dark-text"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-green to-teal-500 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                       {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <PaperAirplaneIcon className="w-5 h-5" />}
                        <span className="hidden sm:inline">{isLoading ? 'Generating...' : 'Get Plan'}</span>
                    </button>
                </div>
            </form>

            {/* Quick Suggestions */}
            {showSuggestions && !dietPlan && (
                <div className="mt-4 animate-fade-in-up">
                    <p className="text-xs text-gray-500 dark:text-dark-subtext mb-2 text-center">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {quickSuggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion.value)}
                                className="px-3 py-1.5 bg-white dark:bg-dark-card text-xs font-medium text-gray-700 dark:text-dark-text rounded-full border border-gray-300 dark:border-dark-subtext/30 hover:border-primary-green dark:hover:border-dark-accent hover:bg-green-50 dark:hover:bg-dark-accent/10 transition-all transform hover:scale-105 shadow-sm"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {suggestion.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        <div className="mt-8 max-w-2xl mx-auto relative z-10">
            {isLoading && (
               <div className="text-center p-8 space-y-4">
                   <SpinnerIcon className="w-12 h-12 text-primary-green dark:text-dark-accent mx-auto" />
                   <p className="mt-2 text-gray-600 dark:text-dark-subtext font-semibold">Crafting your perfect meal plan...</p>
                   <p className="text-sm text-gray-500 dark:text-dark-subtext/70">This can take a few moments. Thanks for your patience!</p>
               </div>
            )}
            {error && (
                <div className="bg-red-100 dark:bg-red-500/10 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-r-lg" role="alert">
                    <p className="font-bold">Oops, an error occurred!</p>
                    <p>{error}</p>
                </div>
            )}
            {dietPlan && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between animate-fade-in-up">
                        <h2 className="text-xl font-bold text-gray-700 dark:text-dark-text">
                            Diet plan for: <span className="text-primary-green dark:text-dark-accent">{lastSearched}</span>
                        </h2>
                        <button
                            onClick={handleNewSearch}
                            className="px-4 py-2 bg-gradient-to-r from-primary-green to-teal-500 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                            ✨ New Search
                        </button>
                    </div>
                    
                    <div className="grid gap-4">
                        <MealCard title="🌅 Morning" meal={dietPlan.morning} iconKey="morning" delay="100ms" />
                        <MealCard title="☀️ Afternoon" meal={dietPlan.afternoon} iconKey="afternoon" delay="200ms" />
                        <MealCard title="🌆 Evening" meal={dietPlan.evening} iconKey="evening" delay="300ms" />
                        <MealCard title="🌙 Night" meal={dietPlan.night} iconKey="night" delay="400ms" />
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-dark-card rounded-xl border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                        <LightbulbIcon className="w-8 h-8 mt-1 flex-shrink-0" />
                        <p><strong>Disclaimer:</strong> This diet plan is generated by AI and is for informational purposes only. It is not a substitute for professional medical advice. Please consult with a healthcare provider or registered dietitian before making any significant changes to your diet.</p>
                    </div>

                    <div className="text-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                        <p className="text-sm text-gray-500 dark:text-dark-subtext mb-3">Want a plan for a different condition?</p>
                        <button
                            onClick={handleNewSearch}
                            className="px-6 py-3 bg-white dark:bg-dark-card text-primary-green dark:text-dark-accent font-semibold rounded-full border-2 border-primary-green dark:border-dark-accent hover:bg-primary-green hover:text-white dark:hover:bg-dark-accent dark:hover:text-white transition-all transform hover:scale-105 shadow-md"
                        >
                            Try Another Condition
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default AiDietPlanner;