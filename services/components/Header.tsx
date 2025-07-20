import React from 'react';

const Header: React.FC = () => {
    return (
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
};

export default Header;
