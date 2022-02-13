import { Color } from 'three';
import { items } from './itemsData';
import { Item } from './types';

export const itemsMap = new Map<number, Item>();

for (const i of items) {
    itemsMap.set(i.id, i);
}

export function isBelt(id: number) {
    return beltColorMap.has(id);
}

export const beltColorMap = new Map<number, Color>([
    [2001, new Color(0xf4b870)],
    [2002, new Color(0x56bfaa)],
    [2003, new Color(0x66baef)],
]);
