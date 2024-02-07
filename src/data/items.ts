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
    return id >= 2011 && id <= 2014;
}

export function isStation(id: number) {
    return id === 2103 || id === 2104 || id === 2316;
}

export function isInterstellarStation(id: number) {
    return id === 2104;
}

export function isSplitter(id: number) {
    return id === 2020;
}

export function isLab(id: number) {
    return id === 2901;
}

export function isStorage(id: number) {
    return id === 2101 || id === 2102 || id === 3009;
}

export function isTank(id: number) {
    return id === 2106;
}

export function isEjector(id: number) {
    return id === 2311;
}

export function isRayReciver(id: number) {
    return id === 2208;
}

export function isArtificialStar(id: number) {
    return id === 2210;
}

export function isEnergyExchanger(id: number) {
    return id === 2209;
}

export function isAdvancedMiningMachine(id: number) {
    return id === 2316;
}

export function isMonitor(id: number) {
    return id === 2030;
}

export function isBattleBase(id: number) {
    return id === 3009;
}

export function isDispenser(id: number) {
    return id === 2107;
}

export const allAssemblers = new Set([
    2303, // 制造台
    2304,
    2305,
    2318,
    2302, // 熔炉
    2315,
    2319,
    2308, // 原油精炼厂
    2309, // 化工厂
    2310, // 对撞机
]);
