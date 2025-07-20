import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-transparent mt-12">
            <div className="container mx-auto px-4 py-6 text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Tu Ikigai. Todos los derechos reservados.</p>
                <p className="mt-2">
                    Tu privacidad es importante. Las reflexiones que escribes se envían a la IA de Google para su análisis y no son almacenadas por esta aplicación.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
