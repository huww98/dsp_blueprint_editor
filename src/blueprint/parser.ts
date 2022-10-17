import { allAssemblers } from '@/data/items';
import pako from 'pako';
import { digest } from './md5';

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

abstract class BufferIO {
    protected pos = 0;
    constructor(protected view: DataView) { }

    getView(length: number) {
        const r = new DataView(this.view.buffer, this.view.byteOffset + this.pos, length);
        this.pos += length;
        return r;
    }
}

class BufferReader extends BufferIO {
    getUint8() { const v = this.view.getUint8(this.pos);       this.pos += 1; return v }
    getInt8()  { const v = this.view.getInt8(this.pos);        this.pos += 1; return v }
    getInt16() { const v = this.view.getInt16(this.pos, true); this.pos += 2; return v }
    getInt32() { const v = this.view.getInt32(this.pos, true); this.pos += 4; return v }

    getFloat32() { const v = this.view.getFloat32(this.pos, true); this.pos += 4; return v }
}

class BufferWriter extends BufferIO {
    setUint8(value: number) { this.view.setUint8(this.pos, value);       this.pos += 1; }
    setInt8(value: number)  { this.view.setInt8(this.pos, value);        this.pos += 1; }
    setInt16(value: number) { this.view.setInt16(this.pos, value, true); this.pos += 2; }
    setInt32(value: number) { this.view.setInt32(this.pos, value, true); this.pos += 4; }

    setFloat32(value: number) { this.view.setFloat32(this.pos, value, true); this.pos += 4; }
}

function btoUint8Array(b: string) {
    const arr = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) {
        arr[i] = b.charCodeAt(i);
    }
    return arr;
}

function Uint8ArrayTob(a: Uint8Array) {
    let out = '';
    for (let i = 0; i < a.length; i++) {
        out += String.fromCharCode(a[i]);
    }
    return out;
}

const uint8ToHex = new Array(0x100);
for (let i = 0; i < uint8ToHex.length; i++) {
    uint8ToHex[i] = i.toString(16).toUpperCase().padStart(2, '0');
}
function hex(buffer: ArrayBuffer) {
    const view = new Uint8Array(buffer);
    const hexBytes = new Array(view.length);
    for (let i = 0; i < view.length; i++) {
        hexBytes[i] = uint8ToHex[view[i]];
    }
    return hexBytes.join('');
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

function exportArea(w: BufferWriter, area: BlueprintArea) {
    w.setInt8(area.index);
    w.setInt8(area.parentIndex);
    w.setInt16(area.tropicAnchor);
    w.setInt16(area.areaSegments);
    w.setInt16(area.anchorLocalOffset.x);
    w.setInt16(area.anchorLocalOffset.y);
    w.setInt16(area.size.x);
    w.setInt16(area.size.y);
}

interface ParamParser<TParam extends AllParameters> {
    encodedSize(p: TParam): number;
    encode(p: TParam, a: DataView): void;
    decode(a: DataView): TParam;
}

function getParam(v: DataView, pos: number, defaultValue?: number) {
    const p = pos * Int32Array.BYTES_PER_ELEMENT;
    if (p >= v.byteLength) {
        if (defaultValue === undefined) {
            throw new Error('参数解析错误：数据段太短');
        } else {
            return defaultValue;
        }
    }
    return v.getInt32(p, true);
}
function setParam(v: DataView, pos: number, value: number) {
    v.setInt32(pos * Int32Array.BYTES_PER_ELEMENT, value, true);
}

const stationDesc = {
    maxItemKind: 3,
    numSlots: 12,
};
const interstellarStationDesc = {
    maxItemKind: 5,
    numSlots: 12,
};
const AdvancedMiningMachineDesc = {
    maxItemKind: 1,
    numSlots: 9,
};

export enum IODir { None, Output, Input, }
export enum LogisticRole { None, Supply, Demand, }
export interface StationParameters {
    storage: {
        itemId: number;
        max: number;
        localRole: LogisticRole;
        remoteRole: LogisticRole;
    }[];
    slots: {
        dir: IODir;
        /** Index into storage. Start from 1 */
        storageIdx: number;
    }[];

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
export interface AdvancedMiningMachineParameters extends StationParameters {
    miningSpeed: number;
}

const stationParamsMeta = {
    base: 320,
    storage: { base: 0, stride: 6 },
    slots: { base: 192, stride: 4 },
} as const;
function stationParamsParser(desc: typeof stationDesc): ParamParser<StationParameters> {
    return {
        encodedSize() { return 2048; },
        encode(p, a) {
            const base = stationParamsMeta.base;
            setParam(a, base + 0, p.workEnergyPerTick);
            setParam(a, base + 1, p.tripRangeOfDrones * 100000000.0);
            setParam(a, base + 2, p.tripRangeOfShips / 100.0);
            setParam(a, base + 3, p.includeOrbitCollector ? 1 : -1);
            setParam(a, base + 4, p.warpEnableDistance);
            setParam(a, base + 5, p.warperNecessary ? 1 : -1);
            setParam(a, base + 6, p.deliveryAmountOfDrones);
            setParam(a, base + 7, p.deliveryAmountOfShips);
            setParam(a, base + 8, p.pilerCount);
            {
                const {base, stride} = stationParamsMeta.storage;
                for (let i = 0; i < desc.maxItemKind; i++) {
                    const s = p.storage[i];
                    setParam(a, base + i * stride + 0, s.itemId);
                    setParam(a, base + i * stride + 1, s.localRole);
                    setParam(a, base + i * stride + 2, s.remoteRole);
                    setParam(a, base + i * stride + 3, s.max);
                }
            } {
                const {base, stride} = stationParamsMeta.slots;
                for (let i = 0; i < 12; i++) {
                    const s = p.slots[i];
                    setParam(a, base + i * stride + 0, s.dir);
                    setParam(a, base + i * stride + 1, s.storageIdx);
                }
            }
        },
        decode(a) {
            const base = stationParamsMeta.base;
            const result: StationParameters = {
                storage: [],
                slots: [],
                workEnergyPerTick:      getParam(a, base + 0),
                tripRangeOfDrones:      getParam(a, base + 1) / 100000000.0,
                tripRangeOfShips:       getParam(a, base + 2) * 100.0,
                includeOrbitCollector:  getParam(a, base + 3) > 0,
                warpEnableDistance:     getParam(a, base + 4),
                warperNecessary:        getParam(a, base + 5) > 0,
                deliveryAmountOfDrones: getParam(a, base + 6),
                deliveryAmountOfShips:  getParam(a, base + 7),
                pilerCount:             getParam(a, base + 8),
            };
            {
                const {base, stride} = stationParamsMeta.storage;
                for (let i = 0; i < desc.maxItemKind; i++) {
                    result.storage.push({
                        itemId:     getParam(a, base + i * stride + 0),
                        localRole:  getParam(a, base + i * stride + 1),
                        remoteRole: getParam(a, base + i * stride + 2),
                        max:        getParam(a, base + i * stride + 3),
                    });
                }
            } {
                const {base, stride} = stationParamsMeta.slots;
                for (let i = 0; i < 12; i++) {
                    result.slots.push({
                        dir:        getParam(a, base + i * stride + 0),
                        storageIdx: getParam(a, base + i * stride + 1),
                    })
                }
            }
            return result;
        }
    }
}

function advancedMiningMachineParamParser(): ParamParser<AdvancedMiningMachineParameters> {
    const stationParser = stationParamsParser(AdvancedMiningMachineDesc);
    return {
        encodedSize: stationParser.encodedSize,
        encode(p, a) {
            stationParser.encode(p, a);
            const base = stationParamsMeta.base;
            setParam(a, base + 9, p.miningSpeed);
        },
        decode(a) {
            const p = stationParser.decode(a);
            const base = stationParamsMeta.base;
            return Object.assign(p, {
                miningSpeed: getParam(a, base + 9),
            });
        }
    }
}

export interface SplitterParameters {
    priority: boolean[];
}

const splitterParamParser: ParamParser<SplitterParameters> = {
    encodedSize() { return 4; },
    encode(p, a) {
        for (let i = 0; i < 4; i++) {
            setParam(a, i, p.priority[i] ? 1 : 0);
        }
    },
    decode(a) {
        const result: SplitterParameters = {
            priority: [],
        };
        for (let i = 0; i < 4; i++) {
            result.priority[i] = getParam(a, i) > 0;
        }
        return result;
    }
}

export enum AcceleratorMode { ExtraOutput, Accelerate }
export enum ResearchMode { None, Compose, Research }

export interface AssembleParamerters {
    acceleratorMode: AcceleratorMode,
}

export interface LabParamerters extends AssembleParamerters {
    researchMode: ResearchMode,
}

const labParamParser: ParamParser<LabParamerters> = {
    encodedSize() { return 2; },
    encode(p, a) {
        setParam(a, 0, p.researchMode);
        setParam(a, 1, p.acceleratorMode);
    },
    decode(a) {
        return {
            researchMode: getParam(a, 0),
            acceleratorMode: getParam(a, 1),
        }
    }
}

const assembleParamParser: ParamParser<AssembleParamerters> = {
    encodedSize() { return 1; },
    encode(p, a) {
        setParam(a, 0, p.acceleratorMode);
    },
    decode(a) {
        return {
            acceleratorMode: getParam(a, 0),
        };
    },
}

export interface BeltParameters {
    iconId: number;
    count: number;
}

const beltParamParser: ParamParser<BeltParameters> = {
    encodedSize() { return 2; },
    encode(p, a) {
        setParam(a, 0, p.iconId);
        setParam(a, 1, p.count);
    },
    decode(a) {
        return {
            iconId: getParam(a, 0),
            count: getParam(a, 1, 0),
        };
    },
}

export interface InserterParameters {
    length: number;
}

const inserterParamParser: ParamParser<InserterParameters> = {
    encodedSize() { return 1; },
    encode(p, a) {
        setParam(a, 0, p.length);
    },
    decode(a) {
        return {
            length: getParam(a, 0),
        };
    },
}

export interface TankParameters {
    input: boolean;
    output: boolean;
}

const tankParamParser: ParamParser<TankParameters> = {
    encodedSize() { return 2; },
    encode(p, a) {
        setParam(a, 0, p.output ? 1 : -1);
        setParam(a, 1, p.input ? 1 : -1);
    },
    decode(a) {
        return {
            output: getParam(a, 0) > 0,
            input: getParam(a, 1) > 0,
        };
    },
}

export interface StorageParameters {
    automationLimit: number
}

const storageParamParser: ParamParser<StorageParameters> = {
    encodedSize() { return 1; },
    encode(p, a) {
        setParam(a, 0, p.automationLimit);
    },
    decode(a) {
        return {
            automationLimit: getParam(a, 0),
        };
    },
}

export interface EjectorParameters {
    orbitId: number;
}

const ejectorParamParser: ParamParser<EjectorParameters> = {
    encodedSize() { return 1; },
    encode(p, a) {
        setParam(a, 0, p.orbitId);
    },
    decode(a) {
        return {
            orbitId: getParam(a, 0),
        };
    },
}

export interface PowerGeneratorParameters {
    productId: number;
}

const powerGeneratorParamParser: ParamParser<PowerGeneratorParameters> = {
    encodedSize() { return 1; },
    encode(p, a) {
        setParam(a, 0, p.productId);
    },
    decode(a) {
        return {
            productId: getParam(a, 0),
        };
    },
}

export enum EnergyExchangerMode {
    Discharge = -1,
    StandBy = 0,
    Charge = 1,
}

export interface EnergyExchangerParameters {
    mode: EnergyExchangerMode;
}

const energyExchangerParamParser: ParamParser<EnergyExchangerParameters> = {
    encodedSize() { return 1; },
    encode(p, a) {
        setParam(a, 0, p.mode);
    },
    decode(a) {
        return {
            mode: getParam(a, 0),
        };
    },
}

export interface MonitorParameters {
    targetBeltId: number;
    offset: number;
    targetCargoAmount: number;
    periodTicksCount: number;
    passColorId: number;
    failColorId: number;
    passOperator: number;
    alarmMode: number;
    cargoFilter: number;
    systemWarningMode: number;
    systemWarningIconId: number;
    tone: number;
    volume: number;
    pitch: number;
    repeat: boolean;
    length: number;
    falloffRadius: [number, number];
}

const MonitorParamParser: ParamParser<MonitorParameters> = {
    encodedSize() { return 128; },
    encode(p, a) {
        setParam(a, 0, p.targetBeltId);
        setParam(a, 1, p.offset);
        setParam(a, 2, p.targetCargoAmount);
        setParam(a, 3, p.periodTicksCount);
        setParam(a, 4, p.passOperator);
        setParam(a, 5, p.passColorId);
        setParam(a, 6, p.failColorId);
        setParam(a, 14, p.cargoFilter);

        setParam(a, 7, p.tone);
        setParam(a, 8, p.volume);
        setParam(a, 9, p.pitch);
        setParam(a, 11, p.repeat ? 1 : 0);
        setParam(a, 13, p.length * 10000);
        setParam(a, 18, p.falloffRadius[0] * 10);
        setParam(a, 19, p.falloffRadius[1] * 10);

        setParam(a, 10, p.systemWarningMode);
        setParam(a, 17, p.systemWarningIconId);
        setParam(a, 12, p.alarmMode);
    },
    decode(a) {
        return {
            targetBeltId: getParam(a, 0),
            offset: getParam(a, 1),
            targetCargoAmount: getParam(a, 2),
            periodTicksCount: getParam(a, 3),
            passOperator: getParam(a, 4),
            passColorId: getParam(a, 5),
            failColorId: getParam(a, 6),
            cargoFilter: getParam(a, 14),

            tone: getParam(a, 7),
            volume: getParam(a, 8),
            pitch: getParam(a, 9),
            repeat: getParam(a, 11) > 0,
            length: getParam(a, 13) / 10000,
            falloffRadius: [getParam(a, 18) / 10, getParam(a, 19) / 10],

            systemWarningMode: getParam(a, 10),
            systemWarningIconId: getParam(a, 17),
            alarmMode: getParam(a, 12),
        }
    }
}

interface UnknownParamerters {
    parameters: Int32Array,
}

const unknownParamParser: ParamParser<UnknownParamerters> = {
    encodedSize(p) { return p.parameters.length; },
    encode(p, a) {
        for (let i = 0; i < p.parameters.length; i++)
            setParam(a, i, p.parameters[i]);
    },
    decode(a) {
        const p: UnknownParamerters = {
            parameters: new Int32Array(a.byteLength / Int32Array.BYTES_PER_ELEMENT),
        };
        for (let i = 0; i < p.parameters.length; i++)
            p.parameters[i] = getParam(a, i);
        return p;
    },
}

type AllParameters = AssembleParamerters | StationParameters | AdvancedMiningMachineParameters |
    SplitterParameters | LabParamerters | BeltParameters | InserterParameters |
    TankParameters | StorageParameters | EjectorParameters |
    PowerGeneratorParameters | EnergyExchangerParameters | MonitorParameters | UnknownParamerters;

const parameterParsers = new Map<number, ParamParser<AllParameters>>([
    [2103, stationParamsParser(stationDesc)],
    [2104, stationParamsParser(interstellarStationDesc)],
    [2316, advancedMiningMachineParamParser()],
    [2020, splitterParamParser],
    [2901, labParamParser],
    [2001, beltParamParser],
    [2002, beltParamParser],
    [2003, beltParamParser],
    [2011, inserterParamParser],
    [2012, inserterParamParser],
    [2013, inserterParamParser],
    [2101, storageParamParser],
    [2102, storageParamParser],
    [2106, tankParamParser],
    [2311, ejectorParamParser],
    [2208, powerGeneratorParamParser],
    [2209, energyExchangerParamParser],
    [2030, MonitorParamParser],
]);
for (const id of allAssemblers) {
    parameterParsers.set(id, assembleParamParser);
}

function parserFor(itemId: number) {
    const parser = parameterParsers.get(itemId);
    if (parser !== undefined)
        return parser;
    return unknownParamParser;
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
    if (length > 0) {
        const p = r.getView(length * Int32Array.BYTES_PER_ELEMENT);
        b.parameters = parserFor(b.itemId).decode(p);
    }
    return b;
}

function exportBuilding(w: BufferWriter, b: BlueprintBuilding) {
    function writeXYZ(v: {x: number, y: number, z: number}) {
        w.setFloat32(v.x);
        w.setFloat32(v.y);
        w.setFloat32(v.z);
    }
    w.setInt32(b.index);
    w.setInt8(b.areaIndex);
    writeXYZ(b.localOffset[0]); writeXYZ(b.localOffset[1]);
    w.setFloat32(b.yaw[0]); w.setFloat32(b.yaw[1]);
    w.setInt16(b.itemId);
    w.setInt16(b.modelIndex);
    w.setInt32(b.outputObjIdx);
    w.setInt32(b.inputObjIdx);
    w.setInt8(b.outputToSlot);
    w.setInt8(b.inputFromSlot);
    w.setInt8(b.outputFromSlot);
    w.setInt8(b.inputToSlot);
    w.setInt8(b.outputOffset);
    w.setInt8(b.inputOffset);
    w.setInt16(b.recipeId);
    w.setInt16(b.filterId);

    if (b.parameters !== null) {
        const parser = parserFor(b.itemId);
        const length = parser.encodedSize(b.parameters);
        w.setInt16(length);
        parser.encode(b.parameters, w.getView(length * Int32Array.BYTES_PER_ELEMENT));
    } else {
        w.setInt16(0);
    }
}

const START = 'BLUEPRINT:';
const TIME_BASE = new Date(0).setUTCFullYear(1);

export function fromStr(strData: string): BlueprintData {
    if (!strData.startsWith(START))
        throw Error('Invalid start');

    const p1 = strData.indexOf('"', START.length);
    const cells = strData.substring(START.length, p1).split(',');
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

    const p2 = strData.length - 33;
    if (strData[p2] !== '"')
        throw Error('Checksum not found')
    const d = hex(digest(btoUint8Array(strData.substring(0, p2)).buffer));
    const expectedD = strData.substring(p2 + 1);
    if (d !== expectedD)
        throw Error('Checksum mismatch')

    const encoded = strData.substring(p1 + 1, p2);
    const decoded = pako.ungzip(btoUint8Array(atob(encoded)));
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

function encodedSize(bp: BlueprintData): number {
    let result = 28 // meta
        + 1 // numAreas
        + 14 * bp.areas.length
        + 4 // numBuildings
        + 61 * bp.buildings.length;
    for (const b of bp.buildings) {
        if (b.parameters === null)
            continue;
        const parser = parserFor(b.itemId);
        result += parser.encodedSize(b.parameters) * Int32Array.BYTES_PER_ELEMENT;
    }
    return result;
}

export function toStr(bp: BlueprintData): string {
    let result = START;
    result += '0,';
    result += bp.header.layout;
    result += ',';
    for (const i of bp.header.icons) {
        result += i;
        result += ',';
    }
    result += '0,';
    result += (bp.header.time.getTime() - TIME_BASE) * 10000;
    result += ',';
    result += bp.header.gameVersion;
    result += ',';
    result += encodeURIComponent(bp.header.shortDesc);
    result += ',';
    result += encodeURIComponent(bp.header.desc);
    result += '"';

    const decoded = new Uint8Array(encodedSize(bp));
    const writer = new BufferWriter(new DataView(decoded.buffer));
    writer.setInt32(bp.version);
    writer.setInt32(bp.cursorOffset.x);
    writer.setInt32(bp.cursorOffset.y);
    writer.setInt32(bp.cursorTargetArea);
    writer.setInt32(bp.dragBoxSize.x);
    writer.setInt32(bp.dragBoxSize.y);
    writer.setInt32(bp.primaryAreaIdx);

    writer.setUint8(bp.areas.length);
    for (const a of bp.areas)
        exportArea(writer, a);

    writer.setInt32(bp.buildings.length);
    for (const b of bp.buildings)
        exportBuilding(writer, b);

    result += btoa(Uint8ArrayTob(pako.gzip(decoded)));
    const d = hex(digest(btoUint8Array(result).buffer));

    result += '"'
    result += d;

    return result;
}
