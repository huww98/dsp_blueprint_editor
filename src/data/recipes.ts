import { recipes } from './recipesData';
import { Recipe } from './types';

export const recipesMap = new Map<number, Recipe>();

for (const i of recipes) {
    recipesMap.set(i.id, i);
}
