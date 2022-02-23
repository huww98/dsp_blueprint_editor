import { items } from './itemsData';
import { Item } from './types';

export const itemsMap = new Map<number, Item>();

for (const i of items) {
    itemsMap.set(i.id, i);
}

export function isBelt(id: number) {
    return id >= 2001 && id <= 2003;
}

export function isInserter(id: number) {
    return id >= 2011 && id <= 2013;
}

export function isStation(id: number) {
    return id === 2103 || id === 2104;
}

export function isInterstellarStation(id: number) {
    return id === 2104;
}

export function isSplitter(id: number) {
    return id === 2020;
}
