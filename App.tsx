
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// --- TYPES (from types.ts) ---
interface IkigaiData {
    passion: string;
    vocation: string;
    mission: string;
    profession: string;
}

type IkigaiSectionKey = keyof IkigaiData;

interface IkigaiSection {
    key: IkigaiSectionKey;
    title: string;
    description: string;
    icon: React.ReactNode;
}

// --- CONSTANTS & ICONS (from constants.ts) ---

const HeartIcon = () => React.createElement('svg',
    {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-red-500",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2
    },
    React.createElement('path', {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    })
);

const StarIcon = () => React.createElement('svg',
    {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-amber-500",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2
    },
    React.createElement('path', {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    })
);

const GlobeIcon = () => React.createElement('svg',
    {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-emerald-500",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2
    },
    React.createElement('path', {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.564A9 9 0 1019.436 19.436M12 21a9 9 0 000-18h.008v18h-.008z"
    })
);

const BriefcaseIcon = () => React.createElement('svg',
    {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-sky-500",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2
    },
    React.createElement('path', {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    })
);

const IKIGAI_SECTIONS: IkigaiSection[] = [
    {
        key: 'passion',
        title: 'Tu Pasión',
        description: '¿Qué es lo que más disfrutas en la vida? ¿Qué te hace feliz y te llena de energía?',
        icon: React.createElement(HeartIcon),
    },
    {
        key: 'vocation',
        title: 'Tu Vocación',
        description: '¿En qué eres bueno? Describe tus talentos naturales, habilidades y cualidades innatas.',
        icon: React.createElement(StarIcon),
    },
    {
        key: 'mission',
        title: 'Tu Misión',
        description: '¿Qué necesita el mundo y tu entorno? ¿Cómo podrías contribuir a mejorarlo?',
        icon: React.createElement(GlobeIcon),
    },
    {
        key: 'profession',
        title: 'Tu Profesión',
        description: '¿Por qué habilidades o talentos te podrían pagar? ¿Cómo puedes monetizar lo que disfrutas?',
        icon: React.createElement(BriefcaseIcon),
    },
];

const INSPIRING_QUOTES: string[] = [
    "El propósito de la vida es una vida con propósito.",
    "El misterio de la existencia humana no reside solo en mantenerse vivo, sino en encontrar algo por lo que vivir.",
    "Aquel que tiene un porqué para vivir puede soportar casi cualquier cómo.",
    "Donde tus talentos y las necesidades del mundo se cruzan, ahí yace tu vocación.",
    "El autodescubrimiento es el comienzo de toda sabiduría.",
    "La única manera de hacer un gran trabajo es amar lo que haces."
];


// --- GEMINI SERVICE (from services/geminiService.ts) ---

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateIkigaiSummaryStream = async (data: IkigaiData): Promise<AsyncIterable<GenerateContentResponse>> => {
    const model = 'gemini-2.5-flash';

    const systemInstruction = `Eres un coach de vida experto en la filosofía Ikigai. Tu propósito es ayudar a los usuarios a encontrar su propósito de vida analizando sus propias reflexiones. Sé empático, inspirador y constructivo. Basa tu análisis únicamente en las respuestas del usuario. Formatea tu respuesta en HTML, usando encabezados (<h3>) para las secciones y párrafos (<p>) para el texto. Utiliza <strong> para resaltar las ideas clave. No uses markdown.`;

    const prompt = `
        Analiza las siguientes reflexiones de un usuario para ayudarle a descubrir su Ikigai. Sintetiza la información, encuentra patrones y conexiones entre las áreas, y ofrécele una perspectiva clara sobre cuál podría ser su propósito de vida.

        <h3>Mi Pasión (lo que amo):</h3>
        <p>${data.passion}</p>

        <h3>Mi Vocación (en lo que soy bueno):</h3>
        <p>${data.vocation}</p>

        <h3>Mi Misión (lo que el mundo necesita):</h3>
        <p>${data.mission}</p>
        
        <h3>Mi Profesión (por lo que me pueden pagar):</h3>
        <p>${data.profession}</p>

        Basado en esto, genera un resumen de mi posible Ikigai. Comienza con una sección titulada 'Síntesis de tu Ikigai' con un párrafo inspirador. Luego, crea una sección 'Puntos Clave de Conexión' con una lista de viñetas HTML (<ul><li>) que conecten mis pasiones, talentos y oportunidades. Finalmente, concluye con una sección 'Tu Ikigai Potencial' que resuma la idea central en una o dos frases potentes.
    `;

    try {
        const response = await ai.models.generateContentStream({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                topP: 1,
                topK: 32,
            }
        });
        return response;
    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        throw new Error("Failed to get summary from AI service.");
    }
}


// --- INLINED UI COMPONENTS ---

const Spinner: React.FC = () => (
    <svg
        className="animate-spin h-12 w-12 text-amber-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        ></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
    </svg>
);

const Header: React.FC = () => (
    <header className="bg-transparent pt-8 pb-4">
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
                Tu Ikigai
            </h1>
            <p className="text-lg text-slate-500 mt-2">
                Descubre el propósito de tu vida
            </p>
        </div>
    </header>
);

interface IkigaiCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const IkigaiCard: React.FC<IkigaiCardProps> = ({ title, description, icon, value, onChange }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 transition-all duration-300 hover:shadow-xl hover:border-amber-200 flex flex-col">
        <div className="flex items-center mb-4">
            <div className="mr-4">{icon}</div>
            <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-slate-600 mb-4 flex-grow">{description}</p>
        <textarea
            value={value}
            onChange={onChange}
            placeholder="Escribe tus reflexiones aquí..."
            rows={6}
            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200 resize-none"
            autoFocus
        />
    </div>
);

const Footer: React.FC = () => (
    <footer className="bg-transparent mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Tu Ikigai. Todos los derechos reservados.</p>
            <p className="mt-2">
                Tu privacidad es importante. Las reflexiones que escribes se envían a la IA de Google para su análisis y no son almacenadas por esta aplicación.
            </p>
        </div>
    </footer>
);


// --- MAIN APP ---

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
            const stream = await generateIkigaiSummaryStream(ikigaiData);
            for await (const chunk of stream) {
                setAiSummary(prev => prev + chunk.text);
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
