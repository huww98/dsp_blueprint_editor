import { items } from './itemsData';
import { Item } from './types';

export const itemsMap = new Map<number, Item>();

for (const i of items) {
    itemsMap.set(i.id, i);
}
