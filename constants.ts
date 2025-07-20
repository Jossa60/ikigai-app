import React from 'react';
import { IkigaiSection } from './types';

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


export const IKIGAI_SECTIONS: IkigaiSection[] = [
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

export const INSPIRING_QUOTES: string[] = [
    "El propósito de la vida es una vida con propósito.",
    "El misterio de la existencia humana no reside solo en mantenerse vivo, sino en encontrar algo por lo que vivir.",
    "Aquel que tiene un porqué para vivir puede soportar casi cualquier cómo.",
    "Donde tus talentos y las necesidades del mundo se cruzan, ahí yace tu vocación.",
    "El autodescubrimiento es el comienzo de toda sabiduría.",
    "La única manera de hacer un gran trabajo es amar lo que haces."
];
