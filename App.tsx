import React, { useState, useCallback, useEffect, useRef } from 'react';
import { IkigaiData, IkigaiSectionKey } from './types';
import { IKIGAI_SECTIONS, INSPIRING_QUOTES } from './constants';
import { generateIkigaiSummaryStream } from './services/geminiService';
import Header from './components/Header';
import IkigaiCard from './components/IkigaiCard';
import Spinner from './components/common/Spinner';
import Footer from './components/Footer';

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0); // 0: Welcome, 1-4: Questions, 5: Loading/Result
    const [ikigaiData, setIkigaiData] = useState<IkigaiData>({
        passion: '',
        vocation: '',
        mission: '',
        profession: ''
    });
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    const [quote, setQuote] = useState(INSPIRING_QUOTES[0]);
    const summaryRef = useRef<HTMLDivElement>(null);


    // Load from localStorage on initial render
    useEffect(() => {
        try {
            const savedData = localStorage.getItem('ikigaiData');
            if (savedData) {
                setIkigaiData(JSON.parse(savedData));
            }
        } catch (e) {
            console.error("Failed to parse ikigaiData from localStorage", e);
        }
    }, []);

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('ikigaiData', JSON.stringify(ikigaiData));
    }, [ikigaiData]);
    
    // Inspiring quotes rotator during loading
    useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setQuote(prev => {
                    const currentIndex = INSPIRING_QUOTES.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % INSPIRING_QUOTES.length;
                    return INSPIRING_QUOTES[nextIndex];
                });
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleInputChange = (field: IkigaiSectionKey, value: string) => {
        setIkigaiData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep > 0) {
            const currentKey = IKIGAI_SECTIONS[currentStep - 1].key;
            if (ikigaiData[currentKey].trim() === '') {
                 setError('Por favor, completa esta sección para continuar.');
                 return;
            }
        }
        setError(null);
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
             // This is the final step, trigger AI generation
            handleGenerateStream();
        }
    };
    
    const handleBack = () => {
        setError(null);
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };
    
    const handleStart = () => {
        setCurrentStep(1);
    }
    
    const handleGenerateStream = useCallback(async () => {
        setCurrentStep(5); // Move to loading/result screen
        setIsLoading(true);
        setAiSummary('');
        setError(null);

        try {
            const stream = generateIkigaiSummaryStream(ikigaiData);
            for await (const chunk of stream) {
                if (!isLoading) setIsLoading(true); // ensure loading stays true during stream
                setAiSummary(prev => prev + chunk); // Simplified: chunk is now a string
            }
        } catch (err) {
            console.error(err);
            setError('Hubo un error al contactar con la IA. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    }, [ikigaiData]);
    
    const handleCopy = () => {
        if (summaryRef.current) {
            navigator.clipboard.writeText(summaryRef.current.innerText)
                .then(() => {
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2500);
                })
                .catch(err => console.error("Failed to copy text:", err));
        }
    };

    const renderWelcomeStep = () => (
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center animate-fade-in">
            <p className="text-lg md:text-xl text-slate-600 mb-8">
                Bienvenido a tu viaje de autodescubrimiento. Responde con sinceridad a las siguientes preguntas para empezar a trazar el mapa de tu propósito.
            </p>
            <button
                onClick={handleStart}
                className="bg-amber-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:bg-amber-700 disabled:bg-slate-400 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
                Comenzar mi Viaje
            </button>
        </div>
    );
    
    const renderQuestionStep = () => {
        const section = IKIGAI_SECTIONS[currentStep - 1];
        if (!section) return null;
        
        const isLastStep = currentStep === 4;

        return (
            <div className="flex flex-col items-center animate-fade-in">
                 <div className="w-full max-w-2xl mb-8">
                    <IkigaiCard
                        key={section.key}
                        title={section.title}
                        description={section.description}
                        icon={section.icon}
                        value={ikigaiData[section.key]}
                        onChange={(e) => handleInputChange(section.key, e.target.value)}
                    />
                     {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
                </div>
                <div className="flex justify-between w-full max-w-2xl">
                    <button
                        onClick={handleBack}
                        disabled={currentStep <= 1}
                        className="bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-full hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Atrás
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-amber-600 text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-amber-700 disabled:bg-slate-400 transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                        {isLastStep ? '✨ Descubrir mi Ikigai' : 'Siguiente'}
                    </button>
                </div>
            </div>
        )
    };
    
    const renderResultStep = () => (
        <div className="flex flex-col items-center text-center animate-fade-in">
            {isLoading && (
                <div className="mt-12 flex flex-col items-center justify-center">
                    <Spinner />
                    <p className="mt-6 text-slate-600 text-lg italic transition-opacity duration-500 animate-fade-in">{`"${quote}"`}</p>
                </div>
            )}
            
            {error && <div className="mt-12 max-w-3xl mx-auto p-6 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-lg">{error}</div>}

            <div className={`mt-12 max-w-3xl mx-auto w-full transition-all duration-1000 ease-out ${!isLoading && aiSummary ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                 <h2 className="text-3xl font-bold text-center mb-6 text-slate-800">Tu Ikigai Potencial</h2>
                 <div className="bg-white p-8 rounded-xl shadow-2xl border border-slate-200 text-left">
                      <div 
                         id="ai-summary-content"
                         ref={summaryRef}
                         className="prose prose-lg max-w-none text-slate-700 prose-h3:text-slate-700 prose-strong:text-slate-800"
                         dangerouslySetInnerHTML={{ __html: aiSummary }} 
                      />
                 </div>
                 {!isLoading && aiSummary && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleCopy}
                            className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-full shadow-md hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                        >
                            {isCopied ? '¡Copiado!' : '📋 Copiar al Portapapeles'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-stone-50 text-slate-800">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex items-center justify-center">
                {currentStep === 0 && renderWelcomeStep()}
                {currentStep > 0 && currentStep < 5 && renderQuestionStep()}
                {currentStep === 5 && renderResultStep()}
            </main>
            <Footer />
        </div>
    );
};

export default App;
