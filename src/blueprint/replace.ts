import { BeltParameters, BlueprintData, StationParameters } from "./parser";
import { recipesMap } from "@/data/recipes"
import { isBelt, isStation } from "@/data/items";
import { recipeIconId } from "@/data/icons";

export interface ReplaceParams {
    searchRecipe: number;
    replaceRecipe: number;
    scope: {
        recipe: boolean;
        filter: boolean;
        station: boolean;
        beltIcon: boolean;
        blueprintIcon: boolean;
    }
}

export function replace(bp: BlueprintData, params: ReplaceParams) {
    const searchRecipe = recipesMap.get(params.searchRecipe);
    if (!searchRecipe)
        throw new Error(`Unknown search recipe ${params.searchRecipe}`);
    const searchItem = searchRecipe.to[0].item.id;
    const searchIcon = recipeIconId(params.searchRecipe);

    const replaceRecipe = recipesMap.get(params.replaceRecipe);
    if (!replaceRecipe)
        throw new Error(`Unknown replace recipe ${params.replaceRecipe}`);
    const replaceItem = replaceRecipe.to[0].item.id;
    const replaceIcon = recipeIconId(params.replaceRecipe);

    let updated = false;

    for (const b of bp.buildings) {
        if (params.scope.recipe) {
            if (b.recipeId === params.searchRecipe) {
                b.recipeId = params.replaceRecipe;
                updated = true;
            }
        }
        if (params.scope.filter) {
            if (b.filterId === searchItem) {
                b.filterId = replaceItem;
                updated = true;
            }
        }
        if (params.scope.beltIcon && isBelt(b.itemId)) {
            const p = b.parameters as BeltParameters | null;
            if (p?.iconId === searchIcon) {
                p.iconId = replaceIcon;
                updated = true;
            }
        }
        if (params.scope.station && isStation(b.itemId)) {
            const p = b.parameters as StationParameters;
            for (const s of p.storage)
                if (s.itemId === searchItem) {
                    s.itemId = replaceItem
                    updated = true;
                }
        }
    }
    if (params.scope.blueprintIcon) {
        const icons = bp.header.icons
        for (const i in icons) {
            if (icons[i] === searchIcon) {
                icons[i] = replaceIcon;
                updated = true;
            }
        }
    }
    return updated;
}
