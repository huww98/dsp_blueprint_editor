import { BeltParameters, BlueprintBuilding, BlueprintData, StationParameters } from "./parser";
import { recipesMap } from "@/data/recipes"
import { isBelt, isStation } from "@/data/items";
import { recipeIconId } from "@/data/icons";
import { Command, Updater } from "@/command";

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

export class ReplaceCommand implements Command {
    recipeBuildings: BlueprintBuilding[] = [];
    filterBuildings: BlueprintBuilding[] = [];
    stationStorage: {b: BlueprintBuilding, i: number}[] = [];
    beltBuildings: BlueprintBuilding[] = [];
    blueprintIconIndex: number[] = [];

    searchRecipeId: number;
    replaceRecipeId: number;

    constructor(bp: BlueprintData, params: ReplaceParams) {
        this.searchRecipeId = params.searchRecipe;
        this.replaceRecipeId = params.replaceRecipe;

        const searchRecipe = recipesMap.get(params.searchRecipe);
        if (!searchRecipe)
            throw new Error(`Unknown search recipe ${params.searchRecipe}`);
        const searchItem = searchRecipe.to[0].item.id;
        const searchIcon = recipeIconId(params.searchRecipe);

        for (const b of bp.buildings) {
            if (params.scope.recipe)
                if (b.recipeId === params.searchRecipe)
                    this.recipeBuildings.push(b);

            if (params.scope.filter)
                if (b.filterId === searchItem)
                    this.filterBuildings.push(b);

            if (params.scope.beltIcon && isBelt(b.itemId)) {
                const p = b.parameters as BeltParameters | null;
                if (p?.iconId === searchIcon)
                    this.beltBuildings.push(b);
            }

            if (params.scope.station && isStation(b.itemId)) {
                this.stationStorage.push(
                    ...(b.parameters as StationParameters).storage
                        .filter(s => s.itemId === searchItem)
                        .map((s, i) => ({ b, i }))
                );
            }
        }
        if (params.scope.blueprintIcon) {
            const icons = bp.header.icons
            for (let i = 0; i < icons.length; i++)
                if (icons[i] === searchIcon)
                    this.blueprintIconIndex.push(i);
        }
    }
    replace(recipeId: number, data: BlueprintData, updater: Updater) {
        const recipe = recipesMap.get(recipeId);
        if (!recipe)
            throw new Error(`Unknown recipe ${recipeId}`);
        const item = recipe.to[0].item.id;
        const icon = recipeIconId(recipeId);

        for (const b of this.recipeBuildings) {
            b.recipeId = recipeId;
            updater.updateBuildingIcon.dispatch(b);
        }
        for (const b of this.filterBuildings) {
            b.filterId = item;
            updater.updateSorterIcon.dispatch(b);
        }
        for (const b of this.beltBuildings) {
            (b.parameters as BeltParameters).iconId = icon;
            updater.updateBeltIcon.dispatch(b);
        }
        for (const { b, i } of this.stationStorage) {
            (b.parameters as StationParameters).storage[i].itemId = item;
            updater.updateStationInfo.dispatch(b);
        }
        for (const i of this.blueprintIconIndex)
            data.header.icons[i] = icon;
    }
    do(data: BlueprintData, updater: Updater) {
        this.replace(this.replaceRecipeId, data, updater);
    }
    undo(data: BlueprintData, updater: Updater) {
        this.replace(this.searchRecipeId, data, updater);
    }
    merge() { return false; }
}
