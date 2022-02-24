import { allAssemblers } from '@/data/items';
import pako from 'pako';

export interface BlueprintArea {
    index: number;
    parentIndex: number;
    tropicAnchor: number;
    areaSegments: number;
    anchorLocalOffset: {
        x: number;
        y: number;
    };
    size: {
        x: number;
        y: number;
    };
}

interface XYZ {
    x: number, y: number, z: number,
}
export interface BlueprintBuilding {
    index: number,
    areaIndex: number,
    localOffset: [ XYZ, XYZ ],
    yaw: [ number, number ],
    itemId: number,
    modelIndex: number,
    outputObjIdx: number,
    inputObjIdx: number,
    outputToSlot: number,
    inputFromSlot: number,
    outputFromSlot: number,
    inputToSlot: number,
    outputOffset: number,
    inputOffset: number,
    recipeId: number,
    filterId: number,
    parameters: null | AllParameters,
}

export interface BlueprintData {
    header: {
        layout: number;
        icons: number[];
        time: Date;
        gameVersion: string;
        shortDesc: string;
        desc: string;
    };
    version: number;
    cursorOffset: { x: number, y: number };
    cursorTargetArea: number;
    dragBoxSize: { x: number, y: number };
    primaryAreaIdx: number;
    areas: BlueprintArea[];
    buildings: BlueprintBuilding[];
}

class BufferReader {
    private pos = 0;
    constructor(private view: DataView) {}

    private _get(func: (this: DataView, byteOffset: number, littleEndian: boolean) => number, size: number) {
        const v = func.call(this.view, this.pos, true);
        this.pos += size;
        return v;
    }

    getUint8() { return this._get(this.view.getUint8, 1); }
    getInt8()  { return this._get(this.view.getInt8,  1); }
    getInt16() { return this._get(this.view.getInt16, 2); }
    getInt32() { return this._get(this.view.getInt32, 4); }

    getFloat32() { return this._get(this.view.getFloat32, 4); }

    slice(length: number) {
        const r = this.view.buffer.slice(this.pos, this.pos + length);
        this.pos += length;
        return r;
    }
}

function atobUint8Array(a: string) {
    const b = atob(a);
    const arr = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) {
        arr[i] = b.charCodeAt(i);
    }
    return arr;
}

function importArea(r: BufferReader): BlueprintArea {
    return {
        index: r.getInt8(),
        parentIndex: r.getInt8(),
        tropicAnchor: r.getInt16(),
        areaSegments: r.getInt16(),
        anchorLocalOffset: {
            x: r.getInt16(),
            y: r.getInt16(),
        },
        size: {
            x: r.getInt16(),
            y: r.getInt16(),
        },
    }
}

const stationDesc = {
    maxItemKind: 3,
}
const interstellarStationDesc = {
    maxItemKind: 5,
}

export enum IODir { None, Output, Input, }
export enum LogisticRole { None, Supply, Demand, }
export interface StationParameters {
    storage: {
        itemId: number;
        max: number;
        localRole: LogisticRole;
        remoteRole: LogisticRole;
    }[];
    slots: { dir: IODir; storageIdx: number; }[];

    workEnergyPerTick: number;
    tripRangeOfDrones: number;
    tripRangeOfShips: number;
    includeOrbitCollector: boolean;
    warpEnableDistance: number;
    warperNecessary: boolean;
    deliveryAmountOfDrones: number;
    deliveryAmountOfShips: number;
    pilerCount: number;
}

function stationParamsParser(desc: typeof stationDesc) {
    return function (parameters: Int32Array) {
        const base = 320;
        const result: StationParameters = {
            storage: [],
            slots: [],
            workEnergyPerTick:      parameters[base + 0],
            tripRangeOfDrones:      parameters[base + 1] / 100000000.0,
            tripRangeOfShips:       parameters[base + 2] * 100.0,
            includeOrbitCollector:  parameters[base + 3] > 0,
            warpEnableDistance:     parameters[base + 4],
            warperNecessary:        parameters[base + 5] > 0,
            deliveryAmountOfDrones: parameters[base + 6],
            deliveryAmountOfShips:  parameters[base + 7],
            pilerCount:             parameters[base + 8],
        };
        {
            const base = 0, stride = 6;
            for (let i = 0; i < desc.maxItemKind; i++) {
                result.storage.push({
                    itemId:     parameters[base + i * stride + 0],
                    localRole:  parameters[base + i * stride + 1],
                    remoteRole: parameters[base + i * stride + 2],
                    max:        parameters[base + i * stride + 3],
                });
            }
        } {
            const base = 192, stride = 4;
            for (let i = 0; i < 12; i++) {
                result.slots.push({
                    dir:        parameters[base + i * stride + 0],
                    storageIdx: parameters[base + i * stride + 1],
                })
            }
        }
        return result;
    }
}

export interface SplitterParameters {
    priority: boolean[];
}

function splitterParamParser(parameters: Int32Array) {
    const result: SplitterParameters = {
        priority: [],
    };
    for (let i = 0; i < 4; i++) {
        result.priority[i] = parameters[i] > 0;
    }
    return result;
}

export enum AcceleratorMode { ExtraOutput, Accelerate }
export enum ResearchMode { None, Compose, Research }

export interface AssembleParamerters {
    acceleratorMode: AcceleratorMode,
}

export interface LabParamerters extends AssembleParamerters {
    researchMode: ResearchMode,
}

function labParamParser(parameters: Int32Array): LabParamerters {
    return {
        researchMode: parameters[0],
        acceleratorMode: parameters[1],
    }
}

function assembleParamParser(parameters: Int32Array): AssembleParamerters {
    return {
        acceleratorMode: parameters[0],
    }
}

type AllParameters = AssembleParamerters | StationParameters | SplitterParameters | LabParamerters;

const parameterParsers = new Map<number, (p: Int32Array) => AllParameters>([
    [2103, stationParamsParser(stationDesc)],
    [2104, stationParamsParser(interstellarStationDesc)],
    [2020, splitterParamParser],
    [2901, labParamParser],
]);
for (const id of allAssemblers) {
    parameterParsers.set(id, assembleParamParser);
}

function importBuilding(r: BufferReader): BlueprintBuilding {
    function readXYZ() {
        return {
            x: r.getFloat32(),
            y: r.getFloat32(),
            z: r.getFloat32(),
        }
    }
    const b: BlueprintBuilding = {
        index: r.getInt32(),
        areaIndex: r.getInt8(),
        localOffset: [readXYZ(), readXYZ()],
        yaw: [r.getFloat32(), r.getFloat32()],
        itemId: r.getInt16(),
        modelIndex: r.getInt16(),
        outputObjIdx: r.getInt32(),
        inputObjIdx: r.getInt32(),
        outputToSlot: r.getInt8(),
        inputFromSlot: r.getInt8(),
        outputFromSlot: r.getInt8(),
        inputToSlot: r.getInt8(),
        outputOffset: r.getInt8(),
        inputOffset: r.getInt8(),
        recipeId: r.getInt16(),
        filterId: r.getInt16(),
        parameters: null,
    };
    const length = r.getInt16();
    if (length) {
        const p = r.slice(length * Int32Array.BYTES_PER_ELEMENT);
        const parser = parameterParsers.get(b.itemId);
        if (parser !== undefined) {
            b.parameters = parser(new Int32Array(p));
        }
    }
    return b;
}

const START = 'BLUEPRINT:';
const TIME_BASE = new Date(0).setUTCFullYear(1);

export function fromStr(strData: string): BlueprintData {
    if (!strData.startsWith(START))
        throw Error('Invalid start');

    const cells = strData.substring(START.length, strData.indexOf('"', START.length)).split(',');
    if (cells.length < 12)
        throw Error('Header too short');
    const header = {
        layout: parseInt(cells[1]),
        icons: cells.slice(2, 7).map(s => parseInt(s)),
        time: new Date(TIME_BASE + parseInt(cells[8]) / 10000),
        gameVersion: cells[9],
        shortDesc: decodeURIComponent(cells[10]),
        desc: decodeURIComponent(cells[11]),
    }

    const encoded = strData.match(/"(.+)"/);
    if (!encoded)
        throw Error('Content not found')
    const decoded = pako.inflate(atobUint8Array(encoded[1]));
    const reader = new BufferReader(new DataView(decoded.buffer));

    const meta = {
        version: reader.getInt32(),
        cursorOffset: {
            x: reader.getInt32(),
            y: reader.getInt32(),
        },
        cursorTargetArea: reader.getInt32(),
        dragBoxSize: {
            x: reader.getInt32(),
            y: reader.getInt32(),
        },
        primaryAreaIdx: reader.getInt32(),
    };

    const numAreas = reader.getUint8();
    const areas: Array<BlueprintArea> = [];
    for (let i = 0; i < numAreas; i++)
        areas.push(importArea(reader));

    const numBuildings = reader.getInt32();
    const buildings: Array<BlueprintBuilding> = [];
    for (let i = 0; i < numBuildings; i++)
        buildings.push(importBuilding(reader));

    return {
        header,
        ...meta,
        areas,
        buildings,
    };
}
