import { Tech, Signal } from "./types";
import { itemsMap } from "./items";
import { recipesMap } from "./recipes";

export async function itemRecipeIconUrl(name:string): Promise<string> {
    return (await import(/* webpackMode: "eager" */`@/assets/icons/item_recipe/${name}.png`)).default;
}

export async function techIconUrl(techId: number): Promise<string> {
    return (await import(/* webpackMode: "eager" */`@/assets/icons/tech/${techId}.png`)).default;
}

export async function signalIconUrl(signalId: number): Promise<string> {
    return (await import(/* webpackMode: "eager" */`@/assets/icons/signal/signal-${signalId}.png`)).default;
}

export function signalIconId(signalId: number) { return signalId; }
export function itemIconId(itemId: number) { return itemId; }
export function recipeIconId(recipeId: number) {
    const r = recipesMap.get(recipeId)!
    if (r.icon)
        return recipeId + 20000;
    return itemIconId(r.to[0].item.id);
}
export function techIconId(techId: number) { return techId + 40000; }

export function iconUrl(iconId: number) {
    if (iconId < 1000)
        return signalIconUrl(iconId);
    if (iconId < 20000)
        return itemRecipeIconUrl(itemsMap.get(iconId)!.icon);
    if (iconId < 40000)
        return itemRecipeIconUrl(recipesMap.get(iconId - 20000)!.icon!);
    if (iconId < 60000)
        return techIconUrl(iconId - 40000);
    throw new Error(`Unknown icon ${iconId}`)
}

export function* allIconIds() {
    for (const i of itemsMap.values())
        yield itemIconId(i.id);

    for (const r of recipesMap.values()) {
        if (r.icon)
            yield recipeIconId(r.id)
    }

    for (const s of signal) {
        yield signalIconId(s.id);
    }

    for (const t of tech) {
        yield techIconId(t.id);
    }
}

export const signal: Signal[] = [
    {id: 501, gridPos: [1, 0]},
    {id: 502, gridPos: [1, 1]},
    {id: 503, gridPos: [1, 2]},
    {id: 504, gridPos: [1, 3]},
    {id: 506, gridPos: [1, 4]},
    {id: 507, gridPos: [1, 5]},
    {id: 508, gridPos: [1, 6]},
    {id: 509, gridPos: [1, 7]},
    {id: 510, gridPos: [1, 8]},
    {id: 401, gridPos: [0, 0]},
    {id: 402, gridPos: [0, 1]},
    {id: 403, gridPos: [0, 2]},
    {id: 404, gridPos: [0, 3]},
    {id: 405, gridPos: [0, 4]},
    {id: 600, gridPos: [2, 0]},
    {id: 601, gridPos: [2, 1]},
    {id: 602, gridPos: [2, 2]},
    {id: 603, gridPos: [2, 3]},
    {id: 604, gridPos: [2, 4]},
    {id: 605, gridPos: [2, 5]},
    {id: 606, gridPos: [2, 6]},
    {id: 607, gridPos: [2, 7]},
    {id: 608, gridPos: [2, 8]},
    {id: 609, gridPos: [2, 9]},
];

export const tech: Tech[] = [
    {id: 1},
    {id: 1001},
    {id: 1002},
    {id: 1101},
    {id: 1102},
    {id: 1103},
    {id: 1111},
    {id: 1112},
    {id: 1113},
    {id: 1114},
    {id: 1120},
    {id: 1121},
    {id: 1122},
    {id: 1123},
    {id: 1124},
    {id: 1125},
    {id: 1126},
    {id: 1131},
    {id: 1132},
    {id: 1133},
    {id: 1134},
    {id: 1141},
    {id: 1142},
    {id: 1143},
    {id: 1144},
    {id: 1145},
    {id: 1151},
    {id: 1152},
    {id: 1153},
    {id: 1201},
    {id: 1202},
    {id: 1203},
    {id: 1302},
    {id: 1303},
    {id: 1304},
    {id: 1311},
    {id: 1312},
    {id: 1401},
    {id: 1402},
    {id: 1403},
    {id: 1411},
    {id: 1412},
    {id: 1413},
    {id: 1414},
    {id: 1415},
    {id: 1416},
    {id: 1417},
    {id: 1501},
    {id: 1502},
    {id: 1503},
    {id: 1504},
    {id: 1505},
    {id: 1506},
    {id: 1507},
    {id: 1508},
    {id: 1511},
    {id: 1512},
    {id: 1513},
    {id: 1521},
    {id: 1522},
    {id: 1523},
    {id: 1601},
    {id: 1602},
    {id: 1603},
    {id: 1604},
    {id: 1605},
    {id: 1606},
    {id: 1607},
    {id: 1701},
    {id: 1702},
    {id: 1703},
    {id: 1704},
    {id: 1705},
    {id: 1711},
    {id: 1712},
    {id: 2101},
    {id: 2102},
    {id: 2103},
    {id: 2104},
    {id: 2105},
    {id: 2106},
    {id: 2201},
    {id: 2202},
    {id: 2203},
    {id: 2204},
    {id: 2205},
    {id: 2206},
    {id: 2207},
    {id: 2208},
    {id: 2301},
    {id: 2302},
    {id: 2303},
    {id: 2304},
    {id: 2305},
    {id: 2306},
    {id: 2401},
    {id: 2402},
    {id: 2403},
    {id: 2404},
    {id: 2405},
    {id: 2406},
    {id: 2407},
    {id: 2501},
    {id: 2502},
    {id: 2503},
    {id: 2504},
    {id: 2505},
    {id: 2506},
    {id: 2601},
    {id: 2602},
    {id: 2603},
    {id: 2604},
    {id: 2605},
    {id: 2606},
    {id: 2701},
    {id: 2702},
    {id: 2703},
    {id: 2704},
    {id: 2705},
    {id: 2901},
    {id: 2902},
    {id: 2903},
    {id: 2904},
    {id: 2905},
    {id: 2906},
    {id: 3101},
    {id: 3102},
    {id: 3103},
    {id: 3104},
    {id: 3105},
    {id: 3106},
    {id: 3201},
    {id: 3202},
    {id: 3203},
    {id: 3204},
    {id: 3205},
    {id: 3206},
    {id: 3207},
    {id: 3208},
    {id: 3301},
    {id: 3302},
    {id: 3303},
    {id: 3304},
    {id: 3305},
    {id: 3401},
    {id: 3402},
    {id: 3403},
    {id: 3404},
    {id: 3405},
    {id: 3406},
    {id: 3407},
    {id: 3501},
    {id: 3502},
    {id: 3503},
    {id: 3504},
    {id: 3505},
    {id: 3506},
    {id: 3507},
    {id: 3508},
    {id: 3509},
    {id: 3510},
    {id: 3801},
    {id: 3802},
    {id: 3803},
    {id: 3601},
    {id: 3602},
    {id: 3603},
    {id: 3604},
    {id: 3605},
    {id: 3606},
    {id: 3701},
    {id: 3702},
    {id: 3703},
    {id: 3704},
    {id: 3705},
    {id: 3706},
    {id: 3901},
    {id: 3902},
    {id: 3903},
    {id: 3904},
    {id: 4101},
    {id: 4102},
    {id: 4103},
    {id: 4104},
];
