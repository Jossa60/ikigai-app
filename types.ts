
import React from 'react';

export interface IkigaiData {
    passion: string;
    vocation: string;
    mission: string;
    profession: string;
}

export type IkigaiSectionKey = keyof IkigaiData;

export interface IkigaiSection {
    key: IkigaiSectionKey;
    title: string;
    description: string;
    icon: React.ReactNode;
}
